import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { extractTextFromImage } from '@/utils/ocrService';

const { FiImage, FiUpload, FiCamera, FiTrash, FiEye, FiX, FiSave, FiLoader, FiStar } = FiIcons;

const ProductImageUploader = ({ product, onClose, onUpdate }) => {
  const [images, setImages] = useState(product.images || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isNewProduct = product.id === 'new';

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
    setError(null);
    
    try {
      // Always use local blob URL for immediate display
      const imageUrl = URL.createObjectURL(file);

      // Create image object
      const imageData = {
        id: Date.now() + Math.random(),
        name: file.name,
        url: imageUrl,
        file: file, // Keep reference to original file
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        isPrimary: images.length === 0, // First image is primary
        category: 'product',
        description: ''
      };

      // Add image to list immediately
      setImages(prev => [...prev, imageData]);
      
      toast.success('Immagine caricata con successo!');

      // Try to extract text for description (optional)
      try {
        const extractedText = await extractTextFromImage(file);
        if (extractedText && extractedText.trim()) {
          setImages(prev => prev.map(img => 
            img.id === imageData.id 
              ? { ...img, description: extractedText.substring(0, 200) }
              : img
          ));
          toast.success('Testo estratto dall\'immagine!');
        }
      } catch (ocrError) {
        console.log('OCR not available:', ocrError.message);
        // Don't show error for OCR - it's optional
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError(error.message);
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
      const imageToDelete = images.find(img => img.id === imageId);
      
      // Revoke blob URL to free memory
      if (imageToDelete && imageToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Immagine eliminata');
    }
  };

  const setPrimaryImage = (imageId) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
    toast.success('Immagine principale aggiornata');
  };

  const updateImageCategory = (imageId, category) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, category } : img
    ));
  };

  const updateImageDescription = (imageId, description) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, description } : img
    ));
  };

  const handleSave = () => {
    // Clean up images data for saving
    const cleanImages = images.map(img => ({
      id: img.id,
      name: img.name,
      url: img.url,
      size: img.size,
      type: img.type,
      uploadedAt: img.uploadedAt,
      isPrimary: img.isPrimary,
      category: img.category,
      description: img.description || ''
    }));

    onUpdate(cleanImages);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'product': 'bg-blue-100 text-blue-800',
      'packaging': 'bg-green-100 text-green-800',
      'certificate': 'bg-purple-100 text-purple-800',
      'quality': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
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
            <h2 className="text-xl font-semibold text-nordic-800">Gestione Immagini Prodotto</h2>
            <p className="text-sm text-nordic-500">
              {isNewProduct ? 'Nuovo Prodotto' : product.name}
            </p>
            {isNewProduct && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Le immagini verranno salvate al salvataggio del prodotto
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-nordic-400 hover:text-nordic-600"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Controls */}
        <div className="bg-nordic-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SafeIcon icon={FiUpload} className="w-5 h-5" />
              Carica Immagini
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SafeIcon icon={FiCamera} className="w-5 h-5" />
              Scatta Foto
            </button>
          </div>
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiLoader} className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-800">Elaborazione immagine in corso...</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Estrazione testo automatica con OCR...
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiX} className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Errore durante il caricamento</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
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

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white border-2 rounded-lg overflow-hidden ${
                image.isPrimary ? 'border-sage-500' : 'border-nordic-200'
              }`}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setPreviewImage(image)}
                  onLoad={() => {
                    // Image loaded successfully
                    console.log('Image loaded:', image.name);
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e, image);
                  }}
                />
                
                {/* Primary badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-sage-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <SafeIcon icon={FiStar} className="w-3 h-3" />
                    Principale
                  </div>
                )}
                
                {/* New product indicator */}
                {isNewProduct && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Nuovo
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    onClick={() => setPreviewImage(image)}
                    className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                  >
                    <SafeIcon icon={FiEye} className="w-3 h-3" />
                  </button>
                  {!image.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(image.id)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                      title="Imposta come principale"
                    >
                      <SafeIcon icon={FiStar} className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                  >
                    <SafeIcon icon={FiTrash} className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Image Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-nordic-800 truncate">{image.name}</p>
                  <p className="text-xs text-nordic-500">{formatFileSize(image.size)}</p>
                </div>

                {/* Category selector */}
                <div className="mb-3">
                  <select
                    value={image.category}
                    onChange={(e) => updateImageCategory(image.id, e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-nordic-300 rounded focus:ring-1 focus:ring-sage-500"
                  >
                    <option value="product">Foto Prodotto</option>
                    <option value="packaging">Confezione</option>
                    <option value="certificate">Certificato</option>
                    <option value="quality">Controllo Qualità</option>
                    <option value="other">Altro</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-2">
                  <textarea
                    value={image.description || ''}
                    onChange={(e) => updateImageDescription(image.id, e.target.value)}
                    placeholder="Descrizione immagine..."
                    rows={2}
                    className="w-full text-xs px-2 py-1 border border-nordic-300 rounded focus:ring-1 focus:ring-sage-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(image.category)}`}>
                    {image.category}
                  </span>
                  <span className="text-xs text-nordic-500">
                    {new Date(image.uploadedAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty state */}
          {images.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-nordic-200 rounded-lg">
              <SafeIcon icon={FiImage} className="w-16 h-16 text-nordic-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-nordic-700 mb-2">Nessuna immagine caricata</h3>
              <p className="text-nordic-500 mb-4">
                Carica foto per il prodotto per migliorare la presentazione
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors"
              >
                Carica Prima Immagine
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-nordic-200 mt-6">
          <div className="text-sm text-nordic-600">
            {images.length} immagini caricate
            {images.some(img => img.isPrimary) && (
              <span className="ml-2 text-sage-600">• Immagine principale selezionata</span>
            )}
          </div>
          <div className="flex gap-3">
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
              Salva Immagini
            </button>
          </div>
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
                    {previewImage.category}
                  </span>
                  {previewImage.isPrimary && (
                    <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                      Principale
                    </span>
                  )}
                  {isNewProduct && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Nuovo Prodotto
                    </span>
                  )}
                  <p className="text-sm text-nordic-500">
                    {formatFileSize(previewImage.size)} • {new Date(previewImage.uploadedAt).toLocaleString('it-IT')}
                  </p>
                </div>
                {previewImage.description && (
                  <p className="text-sm text-nordic-600 mt-2">{previewImage.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductImageUploader;