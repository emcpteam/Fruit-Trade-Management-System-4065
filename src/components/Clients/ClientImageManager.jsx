import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { extractTextFromImage } from '@/utils/ocrService';

const { FiImage, FiUpload, FiCamera, FiTrash, FiEye, FiX, FiSave, FiLoader, FiFileText } = FiIcons;

const ClientImageManager = ({ client, onClose, onUpdate }) => {
  const [images, setImages] = useState(client.images || []);
  const [notes, setNotes] = useState(client.notes || []);
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
        uploadedAt: new Date().toISOString()
      };

      // Add image to list
      setImages(prev => [...prev, imageData]);

      // Extract text using OCR
      const extractedText = await extractTextFromImage(file);
      if (extractedText && extractedText.trim()) {
        // Create note with extracted text
        const noteData = {
          id: Date.now() + Math.random() + 1,
          text: extractedText,
          type: 'ocr',
          imageId: imageData.id,
          createdAt: new Date().toISOString(),
          highlighted: true
        };
        setNotes(prev => [...prev, noteData]);
        toast.success('Testo estratto dall\'immagine con successo!');
      } else {
        toast.info('Nessun testo rilevato nell\'immagine');
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
    const text = prompt('Inserisci la nota:');
    if (text && text.trim()) {
      const noteData = {
        id: Date.now(),
        text: text.trim(),
        type: 'manual',
        createdAt: new Date().toISOString(),
        highlighted: false
      };
      setNotes(prev => [...prev, noteData]);
      toast.success('Nota aggiunta');
    }
  };

  const toggleNoteHighlight = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, highlighted: !note.highlighted } : note
    ));
  };

  const handleSave = () => {
    onUpdate(client.id, images, notes);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <h2 className="text-xl font-semibold text-nordic-800">Gestione Immagini e Note</h2>
            <p className="text-sm text-nordic-500">{client.name}</p>
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
              <h3 className="text-lg font-medium text-nordic-800">
                Immagini ({images.length})
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
            <div className="grid grid-cols-2 gap-4">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-nordic-200 rounded-lg overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => setPreviewImage(image)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => setPreviewImage(image)}
                        className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                      >
                        <SafeIcon icon={FiEye} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                      >
                        <SafeIcon icon={FiTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-nordic-800 truncate">{image.name}</p>
                    <p className="text-xs text-nordic-500">{formatFileSize(image.size)}</p>
                    <p className="text-xs text-nordic-500">
                      {new Date(image.uploadedAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </motion.div>
              ))}
              {images.length === 0 && (
                <div className="col-span-2 text-center py-8 text-nordic-500">
                  <SafeIcon icon={FiImage} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna immagine caricata</p>
                  <p className="text-sm">Carica la prima immagine per iniziare</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-nordic-800">
                Note ({notes.length})
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
                  <p className="text-sm">Carica un'immagine o aggiungi una nota manuale</p>
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
            Salva Modifiche
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
                <p className="text-sm text-nordic-500">
                  {formatFileSize(previewImage.size)} • {new Date(previewImage.uploadedAt).toLocaleString('it-IT')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ClientImageManager;