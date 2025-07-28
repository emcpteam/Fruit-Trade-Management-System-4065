import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import SuggestionInput from '@/components/Common/SuggestionInput';

const { 
  FiX, FiSave, FiUser, FiTruck, FiPackage, FiWeight, FiDollarSign, FiTrello 
} = FiIcons;

const OrderEditModal = ({ order, clients, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    product: order.product || '',
    type: order.type || '',
    origin: order.origin || '',
    packaging: order.packaging || '',
    quantity: order.quantity || '',
    delivery_details: order.delivery_details || ''
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      price: order.price,
      discount: order.discount || 0,
      actual_weight: order.actual_weight || 0,
      invoice_amount: order.invoice_amount || 0,
      deliveryDate: order.deliveryDate,
      paymentTerms: order.paymentTerms,
      publishToApp: order.publishToApp || false
    }
  });

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = (data) => {
    try {
      // Merge form data with suggestion input data
      const mergedData = { ...data, ...formData };
      const updatedOrder = {
        ...mergedData,
        buyerId: parseInt(mergedData.buyerId),
        sellerId: parseInt(mergedData.sellerId),
        price: parseFloat(mergedData.price),
        discount: parseFloat(mergedData.discount || 0),
        actual_weight: parseFloat(mergedData.actual_weight || 0),
        invoice_amount: parseFloat(mergedData.invoice_amount || 0),
        publishToApp: mergedData.publishToApp || false
      };

      onUpdate(order.id, updatedOrder);
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento dell\'ordine');
    }
  };

  // Filter clients by role
  const buyers = clients.filter(client => client.is_buyer);
  const sellers = clients.filter(client => client.is_seller);

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
            <h2 className="text-xl font-semibold text-nordic-800">
              Modifica Ordine #{order.orderNumber}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-nordic-400 hover:text-nordic-600 rounded-lg hover:bg-nordic-100 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client and Vendor Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  <SafeIcon icon={FiUser} className="inline w-4 h-4 mr-1" />
                  Compratore *
                </label>
                <select
                  {...register('buyerId', { required: 'Compratore obbligatorio' })}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="">Seleziona compratore...</option>
                  {buyers.map(buyer => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.name} - {buyer.city}
                    </option>
                  ))}
                </select>
                {errors.buyerId && (
                  <p className="text-red-500 text-sm mt-1">{errors.buyerId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  <SafeIcon icon={FiTruck} className="inline w-4 h-4 mr-1" />
                  Venditore *
                </label>
                <select
                  {...register('sellerId', { required: 'Venditore obbligatorio' })}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="">Seleziona venditore...</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name} - {seller.city}
                    </option>
                  ))}
                </select>
                {errors.sellerId && (
                  <p className="text-red-500 text-sm mt-1">{errors.sellerId.message}</p>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nordic-800 flex items-center gap-2">
                <SafeIcon icon={FiPackage} className="w-5 h-5" />
                Dettagli Prodotto
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Prodotto *
                  </label>
                  <SuggestionInput
                    category="product"
                    value={formData.product}
                    onChange={(value) => handleFieldChange('product', value)}
                    placeholder="es. CIPOLLE DORATE PRECOCI VARIETA' TELESTO"
                    required
                  />
                  {!formData.product && (
                    <p className="text-red-500 text-sm mt-1">Prodotto obbligatorio</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Tipologia *
                  </label>
                  <SuggestionInput
                    category="type"
                    value={formData.type}
                    onChange={(value) => handleFieldChange('type', value)}
                    placeholder="es. SGAMBATE, SELEZIONATE E CALIBRATE 40/60 MM"
                    required
                  />
                  {!formData.type && (
                    <p className="text-red-500 text-sm mt-1">Tipologia obbligatoria</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Origine *
                  </label>
                  <SuggestionInput
                    category="origin"
                    value={formData.origin}
                    onChange={(value) => handleFieldChange('origin', value)}
                    placeholder="es. ITALIA (VENETO)"
                    required
                  />
                  {!formData.origin && (
                    <p className="text-red-500 text-sm mt-1">Origine obbligatoria</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Imballaggio *
                  </label>
                  <SuggestionInput
                    category="packaging"
                    value={formData.packaging}
                    onChange={(value) => handleFieldChange('packaging', value)}
                    placeholder="es. BINS COMPRATORE TARA REALE"
                    required
                  />
                  {!formData.packaging && (
                    <p className="text-red-500 text-sm mt-1">Imballaggio obbligatorio</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Quantità *
                  </label>
                  <SuggestionInput
                    category="quantity"
                    value={formData.quantity}
                    onChange={(value) => handleFieldChange('quantity', value)}
                    placeholder="es. 2,5 AUTOTRENI"
                    required
                  />
                  {!formData.quantity && (
                    <p className="text-red-500 text-sm mt-1">Quantità obbligatoria</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Prezzo (€/KG) *
                  </label>
                  <input
                    {...register('price', {
                      required: 'Prezzo obbligatorio',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Prezzo non valido'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0.30"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Sconto (%)
                  </label>
                  <input
                    {...register('discount')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    <SafeIcon icon={FiWeight} className="inline w-4 h-4 mr-1" />
                    Peso Effettivo (KG)
                  </label>
                  <input
                    {...register('actual_weight')}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    <SafeIcon icon={FiDollarSign} className="inline w-4 h-4 mr-1" />
                    Importo Fattura (€)
                  </label>
                  <input
                    {...register('invoice_amount')}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Data Consegna *
                  </label>
                  <input
                    {...register('deliveryDate', { required: 'Data consegna obbligatoria' })}
                    type="date"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                  {errors.deliveryDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.deliveryDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    <SafeIcon icon={FiTrello} className="inline w-4 h-4 mr-1" />
                    Dettagli Consegna
                  </label>
                  <SuggestionInput
                    category="delivery_details"
                    value={formData.delivery_details}
                    onChange={(value) => handleFieldChange('delivery_details', value)}
                    placeholder="es. Consegna presso il magazzino centrale"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Condizioni di Pagamento *
                </label>
                <input
                  {...register('paymentTerms', { required: 'Condizioni di pagamento obbligatorie' })}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="es. 30 GIORNI DATA RICEVIMENTO FATTURA"
                />
                {errors.paymentTerms && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentTerms.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    {...register('publishToApp')}
                    type="checkbox"
                    className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                  />
                  <span className="text-sm font-medium text-nordic-700">
                    Pubblica su app mobile (se non venduto)
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-nordic-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiSave} className="w-5 h-5" />
                Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderEditModal;