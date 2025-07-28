import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

const { 
  FiX, FiEdit, FiPackage, FiDollarSign, FiTruck, FiMapPin, 
  FiCalendar, FiStar, FiTag, FiInfo, FiCheckCircle, FiAlertCircle,
  FiImage, FiList
} = FiIcons;

const ProductDetailModal = ({ product, onClose, onEdit }) => {
  const { hasPermission } = useAuthStore();

  const getStockStatus = () => {
    if (product.currentStock === 0) {
      return { text: 'Esaurito', color: 'text-red-600', bg: 'bg-red-50', icon: FiAlertCircle };
    }
    if (product.currentStock <= product.minQuantity) {
      return { text: 'Scorte Basse', color: 'text-orange-600', bg: 'bg-orange-50', icon: FiAlertCircle };
    }
    return { text: 'Disponibile', color: 'text-green-600', bg: 'bg-green-50', icon: FiCheckCircle };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-nordic-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-nordic-800">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <div className={`flex items-center gap-1 ${stockStatus.color} text-sm`}>
                  <SafeIcon icon={stockStatus.icon} className="w-4 h-4" />
                  {stockStatus.text}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPermission('warehouse.write') && (
                <button
                  onClick={() => onEdit(product)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  Modifica
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-nordic-400 hover:text-nordic-600 rounded-lg hover:bg-nordic-100 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div>
              <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                <SafeIcon icon={FiImage} className="w-5 h-5" />
                Immagini Prodotto
              </h3>
              
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Primary Image */}
                  {product.images.find(img => img.isPrimary) && (
                    <div className="relative">
                      <img
                        src={product.images.find(img => img.isPrimary).url}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-sage-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <SafeIcon icon={FiStar} className="w-3 h-3" />
                        Principale
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Images */}
                  {product.images.filter(img => !img.isPrimary).length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.filter(img => !img.isPrimary).map((image, index) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          {image.category && (
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                              {image.category}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-nordic-100 rounded-lg p-8 text-center">
                  <SafeIcon icon={FiImage} className="w-16 h-16 text-nordic-400 mx-auto mb-3" />
                  <p className="text-nordic-500">Nessuna immagine disponibile</p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                  <SafeIcon icon={FiInfo} className="w-5 h-5" />
                  Informazioni Generali
                </h3>
                <div className="space-y-3">
                  {product.description && (
                    <div>
                      <label className="text-sm font-medium text-nordic-600">Descrizione</label>
                      <p className="text-nordic-800 mt-1">{product.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-nordic-600">Prezzo</label>
                      <p className="text-lg font-bold text-nordic-800">
                        €{product.price.toFixed(2)}/{product.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-nordic-600">Unità</label>
                      <p className="text-nordic-800">{product.unit}</p>
                    </div>
                  </div>

                  {product.origin && (
                    <div>
                      <label className="text-sm font-medium text-nordic-600">Origine</label>
                      <p className="text-nordic-800 flex items-center gap-1">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                        {product.origin}
                      </p>
                    </div>
                  )}

                  {product.season && (
                    <div>
                      <label className="text-sm font-medium text-nordic-600">Stagionalità</label>
                      <p className="text-nordic-800 flex items-center gap-1">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                        {product.season}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                  <SafeIcon icon={FiPackage} className="w-5 h-5" />
                  Gestione Scorte
                </h3>
                <div className={`p-4 rounded-lg ${stockStatus.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={stockStatus.icon} className={`w-5 h-5 ${stockStatus.color}`} />
                    <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
                  </div>
                  <div className="text-sm text-nordic-700">
                    <p>Stock attuale: {product.currentStock || 0} {product.unit}</p>
                    {product.minQuantity > 0 && (
                      <p>Quantità minima: {product.minQuantity} {product.unit}</p>
                    )}
                    {product.maxQuantity > 0 && (
                      <p>Quantità massima: {product.maxQuantity} {product.unit}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              {product.supplier && (
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                    <SafeIcon icon={FiTruck} className="w-5 h-5" />
                    Fornitore
                  </h3>
                  <div className="bg-nordic-50 rounded-lg p-4">
                    <p className="font-medium text-nordic-800">{product.supplier.name}</p>
                    {product.supplier.contact && (
                      <p className="text-sm text-nordic-600 mt-1">{product.supplier.contact}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                    <SafeIcon icon={FiList} className="w-5 h-5" />
                    Specifiche Tecniche
                  </h3>
                  <div className="bg-nordic-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {product.specifications.map((spec, index) => (
                        <li key={index} className="text-sm text-nordic-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-sage-500 rounded-full mt-2 flex-shrink-0"></span>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
                    <SafeIcon icon={FiTag} className="w-5 h-5" />
                    Tag
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {product.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800 mb-4">Note</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-nordic-700">{product.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rating and Reviews (if available) */}
          {product.rating && (
            <div className="mt-8 pt-6 border-t border-nordic-200">
              <h3 className="text-lg font-semibold text-nordic-800 mb-4">Valutazione</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <SafeIcon
                      key={i}
                      icon={FiStar}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-nordic-800">{product.rating}</span>
                <span className="text-sm text-nordic-500">su 5</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-nordic-200">
            <h3 className="text-lg font-semibold text-nordic-800 mb-4">Informazioni Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-nordic-600">Creato il</label>
                <p className="text-nordic-800">
                  {new Date(product.createdAt).toLocaleDateString('it-IT')}
                </p>
              </div>
              {product.updatedAt && (
                <div>
                  <label className="text-nordic-600">Ultimo aggiornamento</label>
                  <p className="text-nordic-800">
                    {new Date(product.updatedAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailModal;