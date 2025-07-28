import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useApiKeyStore } from '@/store/apiKeyStore';
import { extractTextFromImage } from '@/utils/imageProcessing';

const { FiCamera, FiUpload, FiImage, FiFileText, FiX, FiLoader } = FiIcons;

const ImageUploader = ({ onImageUploaded, onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { isConfigured } = useApiKeyStore();

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await processImage(file);
      } else {
        toast.error('Formato file non supportato. Usa solo immagini.');
      }
    }
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    
    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      const newImage = {
        id: Date.now(),
        file,
        url: imageUrl,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      };

      setUploadedImages(prev => [...prev, newImage]);
      
      if (onImageUploaded) {
        onImageUploaded(newImage);
      }

      // Extract text if OpenAI is configured
      if (isConfigured('openai')) {
        try {
          const extractedText = await extractTextFromImage(file);
          
          if (extractedText) {
            const textNote = {
              id: Date.now(),
              imageId: newImage.id,
              text: extractedText,
              extractedAt: new Date()
            };

            setExtractedTexts(prev => [...prev, textNote]);
            
            if (onTextExtracted) {
              onTextExtracted(textNote);
            }

            toast.success('Testo estratto dall\'immagine!');
          }
        } catch (error) {
          console.error('Error extracting text:', error);
          toast.error('Errore nell\'estrazione del testo');
        }
      }

      toast.success('Immagine caricata con successo!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Errore nel caricamento dell\'immagine');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setExtractedTexts(prev => prev.filter(text => text.imageId !== imageId));
  };

  const getTextForImage = (imageId) => {
    return extractedTexts.find(text => text.imageId === imageId);
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiUpload} className="w-5 h-5" />
          Carica File
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiCamera} className="w-5 h-5" />
          Fotocamera
        </button>

        {isProcessing && (
          <div className="flex items-center gap-2 text-nordic-600">
            <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
            Elaborazione...
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* OpenAI Status */}
      {!isConfigured('openai') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            💡 Configura la chiave API OpenAI nelle impostazioni per abilitare l'estrazione automatica del testo dalle immagini.
          </p>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-nordic-800">Immagini Caricate</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedImages.map((image) => {
              const textData = getTextForImage(image.id);
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-nordic-200 rounded-lg overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <SafeIcon icon={FiImage} className="w-4 h-4 text-nordic-500" />
                      <span className="text-sm font-medium text-nordic-800 truncate">
                        {image.name}
                      </span>
                    </div>
                    
                    <div className="text-xs text-nordic-500 mb-3">
                      {(image.size / 1024 / 1024).toFixed(2)} MB • {image.uploadedAt.toLocaleString('it-IT')}
                    </div>

                    {/* Extracted Text */}
                    {textData && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <SafeIcon icon={FiFileText} className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Testo Estratto</span>
                        </div>
                        <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded border-l-4 border-yellow-400">
                          {textData.text}
                        </p>
                        <div className="text-xs text-yellow-600 mt-2">
                          Estratto il {textData.extractedAt.toLocaleString('it-IT')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;