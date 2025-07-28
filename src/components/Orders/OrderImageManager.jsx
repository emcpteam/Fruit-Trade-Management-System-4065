import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { extractTextFromImage } from '@/utils/ocrService';

const { FiImage, FiUpload, FiCamera, FiTrash, FiEye, FiX, FiSave, FiLoader, FiFileText, FiPaperclip } = FiIcons;

const OrderImageManager = ({ order, onClose, onUpdate }) => {
  const [images, setImages] = useState(order.attachments?.images || []);
  const [notes, setNotes] = useState(order.attachments?.notes || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await processImage(file);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    try {
      // Create image object
      const imageUrl = URL.createObjectURL(file);
      const imageData = {
        id: Date.now() + Math.random(),
        name: file.name,
        url: imageUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        category: 'order_document' // Can be: order_document, product_photo, quality_check, delivery_note
      };

      // Add image to list
      setImages(prev => [...prev, imageData]);

      // Extract text using OCR
      try {
        const extractedText = await extractTextFromImage(file);
        if (extractedText && extractedText.trim()) {
          // Create note with extracted text
          const noteData = {
            id: Date.now() + Math.random() + 1,
            text: extractedText,
            type: 'ocr',
            imageId: imageData.id,
            createdAt: new Date().toISOString(),
            highlighted: true,
            category: 'extracted_text'
          };
          setNotes(prev => [...prev, noteData]);
          toast.success('Testo estratto dall\'immagine con successo!');
        } else {
          toast.info('Nessun testo rilevato nell\'immagine');
        }
      } catch (ocrError) {
        console.log('OCR non disponibile:', ocrError.message);
        toast.info('Immagine caricata. OCR non disponibile (configura OpenAI API)');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Errore durante l\'elaborazione dell\'immagine');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      await processImage(file);
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const deleteImage = (imageId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa immagine?')) {
      setImages(prev => prev.filter(img => img.id !== imageId));
      // Also delete associated notes
      setNotes(prev => prev.filter(note => note.imageId !== imageId));
      toast.success('Immagine eliminata');
    }
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Nota eliminata');
  };

  const addManualNote = () => {
    const text = prompt('Inserisci la nota per l\'ordine:');
    if (text && text.trim()) {
      const noteData = {
        id: Date.now(),
        text: text.trim(),
        type: 'manual',
        createdAt: new Date().toISOString(),
        highlighted: false,
        category: 'order_note'
      };
      setNotes(prev => [...prev, noteData]);
      toast.success('Nota aggiunta');
    }
  };

  const updateImageCategory = (imageId, category) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, category } : img
    ));
  };

  const toggleNoteHighlight = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, highlighted: !note.highlighted } : note
    ));
  };

  const handleSave = () => {
    const attachments = {
      images,
      notes,
      lastUpdated: new Date().toISOString()
    };
    onUpdate(order.id, { attachments });
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'order_document': 'Documento Ordine',
      'product_photo': 'Foto Prodotto',
      'quality_check': 'Controllo Qualità',
      'delivery_note': 'Documento Trasporto'
    };
    return categories[category] || 'Generale';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'order_document': 'bg-blue-100 text-blue-800',
      'product_photo': 'bg-green-100 text-green-800',
      'quality_check': 'bg-yellow-100 text-yellow-800',
      'delivery_note': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-nordic-800">Gestione Allegati Ordine</h2>
            <p className="text-sm text-nordic-500">Ordine #{order.orderNumber}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-nordic-100 text-nordic-600 px-2 py-1 rounded">
                {order.product}
              </span>
              <span className="text-xs text-nordic-500">
                {new Date(order.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-nordic-400 hover:text-nordic-600"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-nordic-800 flex items-center gap-2">
                <SafeIcon icon={FiPaperclip} className="w-5 h-5" />
                Allegati ({images.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <SafeIcon icon={FiCamera} className="w-4 h-4" />
                  Foto
                </button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />

            {/* Processing indicator */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiLoader} className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-blue-800">Elaborazione immagine in corso...</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">Estrazione testo con OCR</p>
              </div>
            )}

            {/* Images Grid */}
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-nordic-200 rounded-lg overflow-hidden"
                >
                  <div className="flex">
                    {/* Image thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(image)}
                      />
                      <button
                        onClick={() => setPreviewImage(image)}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all"
                      >
                        <SafeIcon icon={FiEye} className="w-5 h-5 text-white opacity-0 hover:opacity-100" />
                      </button>
                    </div>
                    
                    {/* Image details */}
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-nordic-800 truncate">{image.name}</p>
                          <p className="text-xs text-nordic-500">
                            {formatFileSize(image.size)} • {new Date(image.uploadedAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                        >
                          <SafeIcon icon={FiTrash} className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Category selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={image.category}
                          onChange={(e) => updateImageCategory(image.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-nordic-300 rounded focus:ring-1 focus:ring-sage-500"
                        >
                          <option value="order_document">Documento Ordine</option>
                          <option value="product_photo">Foto Prodotto</option>
                          <option value="quality_check">Controllo Qualità</option>
                          <option value="delivery_note">Documento Trasporto</option>
                        </select>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(image.category)}`}>
                          {getCategoryLabel(image.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {images.length === 0 && (
                <div className="text-center py-8 text-nordic-500">
                  <SafeIcon icon={FiImage} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessun allegato presente</p>
                  <p className="text-sm">Carica documenti, foto prodotto o note di trasporto</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-nordic-800">
                Note Ordine ({notes.length})
              </h3>
              <button
                onClick={addManualNote}
                className="bg-sage-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiFileText} className="w-4 h-4" />
                Nuova Nota
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${
                    note.highlighted 
                      ? 'bg-yellow-50 border-yellow-300' 
                      : 'bg-white border-nordic-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        note.type === 'ocr' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {note.type === 'ocr' ? 'OCR' : 'Manuale'}
                      </span>
                      <span className="text-xs text-nordic-500">
                        {new Date(note.createdAt).toLocaleString('it-IT')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleNoteHighlight(note.id)}
                        className={`p-1 rounded ${
                          note.highlighted 
                            ? 'text-yellow-600 hover:bg-yellow-100' 
                            : 'text-nordic-400 hover:bg-nordic-100'
                        }`}
                        title={note.highlighted ? 'Rimuovi evidenziazione' : 'Evidenzia'}
                      >
                        ✨
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <SafeIcon icon={FiTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-nordic-700 whitespace-pre-wrap">{note.text}</p>
                </motion.div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8 text-nordic-500">
                  <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna nota presente</p>
                  <p className="text-sm">Aggiungi note manuali o carica immagini con testo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-nordic-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            Salva Allegati
          </button>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-60"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="bg-white p-4 rounded-b-lg">
                <p className="font-medium text-nordic-800">{previewImage.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(previewImage.category)}`}>
                    {getCategoryLabel(previewImage.category)}
                  </span>
                  <p className="text-sm text-nordic-500">
                    {formatFileSize(previewImage.size)} • {new Date(previewImage.uploadedAt).toLocaleString('it-IT')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrderImageManager;