import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import { generateOrderContract, downloadPDF } from '@/utils/pdfGenerator';
import OrderPhotoUploader from './OrderPhotoUploader';
import SuggestionInput from '@/components/Common/SuggestionInput';

const { FiSave, FiFileText, FiUser, FiTruck, FiPackage, FiDownload, FiPaperclip, FiCamera } = FiIcons;

const NewOrderForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderAttachments, setOrderAttachments] = useState({ images: [], notes: [] });
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [formData, setFormData] = useState({});
  const { clients, vendors, addOrder } = useOrderStore();
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm();

  const selectedClient = watch('clientId');
  const selectedVendor = watch('vendorId');
  const client = clients.find(c => c.id === parseInt(selectedClient));
  const vendor = vendors.find(v => v.id === parseInt(selectedVendor));

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Merge form data with suggestion input data
      const mergedData = { ...data, ...formData };
      const order = {
        ...mergedData,
        clientId: parseInt(mergedData.clientId),
        vendorId: parseInt(mergedData.vendorId),
        price: parseFloat(mergedData.price),
        discount: parseFloat(mergedData.discount || 0),
        publishToApp: mergedData.publishToApp || false,
        attachments: {
          ...orderAttachments,
          lastUpdated: new Date().toISOString()
        }
      };

      const newOrder = addOrder(order);

      // Generate PDF contract
      const pdf = generateOrderContract(newOrder, client, vendor);
      const fileName = `Contratto_${newOrder.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdf, fileName);

      toast.success('Ordine creato e contratto generato con successo!');

      // Reset form and attachments
      reset();
      setFormData({});
      setOrderAttachments({ images: [], notes: [] });
    } catch (error) {
      toast.error('Errore durante la creazione dell\'ordine');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewPDF = () => {
    if (!client || !vendor) {
      toast.error('Seleziona cliente e fornitore per generare l\'anteprima');
      return;
    }

    // Merge form values with formData to get all fields
    const formValues = watch();
    const mergedData = { ...formValues, ...formData };
    const previewOrder = {
      orderNumber: 'PREVIEW',
      createdAt: new Date().toISOString(),
      ...mergedData,
      price: parseFloat(mergedData.price || 0),
      discount: parseFloat(mergedData.discount || 0)
    };

    const pdf = generateOrderContract(previewOrder, client, vendor);
    downloadPDF(pdf, 'Anteprima_Contratto.pdf');
  };

  const handleAttachmentsUpdate = (attachments) => {
    setOrderAttachments(attachments);
  };

  const getAttachmentCount = () => {
    return orderAttachments.images.length + orderAttachments.notes.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Nuovo Ordine</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPhotoUploader(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiCamera} className="w-5 h-5" />
            Aggiungi Foto ({getAttachmentCount()})
          </button>
          <button
            onClick={generatePreviewPDF}
            disabled={!client || !vendor}
            className="bg-nordic-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-nordic-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <SafeIcon icon={FiDownload} className="w-5 h-5" />
            Anteprima PDF
          </button>
        </div>
      </div>

      {/* Photo Uploader Modal */}
      {showPhotoUploader && (
        <OrderPhotoUploader
          attachments={orderAttachments}
          onClose={() => setShowPhotoUploader(false)}
          onUpdate={handleAttachmentsUpdate}
          orderInfo={{
            orderNumber: 'NUOVO',
            product: formData.product || 'Prodotto non specificato',
            isNew: true
          }}
        />
      )}

      {/* Attachments Preview */}
      {getAttachmentCount() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiPaperclip} className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {getAttachmentCount()} allegati pronti per l'ordine
              </span>
            </div>
            <button
              onClick={() => setShowPhotoUploader(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Modifica allegati
            </button>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            {orderAttachments.images.length > 0 && `${orderAttachments.images.length} immagini`}
            {orderAttachments.images.length > 0 && orderAttachments.notes.length > 0 && ', '}
            {orderAttachments.notes.length > 0 && `${orderAttachments.notes.length} note`}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Vendor and Client Selection - SWAPPED ORDER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fornitore (Venditore) - NOW ON LEFT */}
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                <SafeIcon icon={FiTruck} className="inline w-4 h-4 mr-1" />
                Fornitore (Venditore) *
              </label>
              <select
                {...register('vendorId', { required: 'Fornitore obbligatorio' })}
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">Seleziona fornitore...</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.city}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="text-red-500 text-sm mt-1">{errors.vendorId.message}</p>
              )}
              {vendor && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-800">{vendor.name}</p>
                  <p className="text-blue-600">{vendor.address}, {vendor.city}</p>
                  <p className="text-blue-600">P.IVA: {vendor.vatNumber}</p>
                  {vendor.warehouses && vendor.warehouses.length > 0 && (
                    <p className="text-blue-600 text-xs mt-1">
                      {vendor.warehouses.length} magazzini disponibili
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cliente (Compratore) - NOW ON RIGHT */}
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                <SafeIcon icon={FiUser} className="inline w-4 h-4 mr-1" />
                Cliente (Compratore) *
              </label>
              <select
                {...register('clientId', { required: 'Cliente obbligatorio' })}
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">Seleziona cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.city}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
              )}
              {client && (
                <div className="mt-2 p-3 bg-sage-50 rounded-lg text-sm">
                  <p className="font-medium text-sage-800">{client.name}</p>
                  <p className="text-sage-600">{client.address}, {client.city}</p>
                  <p className="text-sage-600">P.IVA: {client.vatNumber}</p>
                  {client.warehouses && client.warehouses.length > 0 && (
                    <p className="text-sage-600 text-xs mt-1">
                      {client.warehouses.length} magazzini configurati
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Details with Suggestions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-nordic-800 flex items-center gap-2">
              <SafeIcon icon={FiPackage} className="w-5 h-5" />
              Dettagli Prodotto
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Prodotto *
                  <span className="text-xs text-nordic-500 ml-1">(con suggerimenti)</span>
                </label>
                <SuggestionInput
                  category="product"
                  value={formData.product || ''}
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
                  <span className="text-xs text-nordic-500 ml-1">(con suggerimenti)</span>
                </label>
                <SuggestionInput
                  category="type"
                  value={formData.type || ''}
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
                  <span className="text-xs text-nordic-500 ml-1">(con suggerimenti)</span>
                </label>
                <SuggestionInput
                  category="origin"
                  value={formData.origin || ''}
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
                  <span className="text-xs text-nordic-500 ml-1">(con suggerimenti)</span>
                </label>
                <SuggestionInput
                  category="packaging"
                  value={formData.packaging || ''}
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
                  <span className="text-xs text-nordic-500 ml-1">(con suggerimenti)</span>
                </label>
                <SuggestionInput
                  category="quantity"
                  value={formData.quantity || ''}
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="bg-sage-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-5 h-5" />
                  Crea Ordine e Genera Contratto
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewOrderForm;