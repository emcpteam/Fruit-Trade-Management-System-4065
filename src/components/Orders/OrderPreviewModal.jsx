import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiX, FiEdit, FiDownload, FiUser, FiTruck, FiPackage, FiCalendar, 
  FiDollarSign, FiFileText, FiWeight, FiTrello 
} = FiIcons;

const OrderPreviewModal = ({ order, buyer, seller, onClose, onEdit, onDownload }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const calculateFinalPrice = () => {
    const basePrice = parseFloat(order.price) || 0;
    const discount = parseFloat(order.discount) || 0;
    return basePrice * (1 - discount / 100);
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: { label: 'In Attesa', class: 'bg-orange-100 text-orange-800', icon: '⏳' },
      completed: { label: 'Completato', class: 'bg-green-100 text-green-800', icon: '✅' },
      invoiced: { label: 'Fatturato', class: 'bg-blue-100 text-blue-800', icon: '📄' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const statusInfo = getStatusInfo(order.status);

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
              <h2 className="text-xl font-semibold text-nordic-800">
                Ordine #{order.orderNumber}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
                <span className="text-sm text-nordic-500">
                  Creato il {new Date(order.createdAt).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
                Modifica
              </button>
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                Scarica PDF
              </button>
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
        <div className="p-6 space-y-6">
          {/* Parties Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buyer */}
            <div className="bg-sage-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-sage-800 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiUser} className="w-5 h-5" />
                Compratore
              </h3>
              {buyer ? (
                <div className="space-y-2">
                  <p className="font-medium text-nordic-800">{buyer.name}</p>
                  <p className="text-sm text-nordic-600">{buyer.address}</p>
                  <p className="text-sm text-nordic-600">{buyer.city}</p>
                  <p className="text-sm text-nordic-600">P.IVA: {buyer.vatNumber}</p>
                  {buyer.sdi && (
                    <p className="text-sm text-nordic-600">SDI: {buyer.sdi}</p>
                  )}
                  {buyer.phone && (
                    <p className="text-sm text-nordic-600">Tel: {buyer.phone}</p>
                  )}
                  {buyer.email && (
                    <p className="text-sm text-nordic-600">Email: {buyer.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-nordic-500">Compratore non trovato</p>
              )}
            </div>

            {/* Seller */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiTruck} className="w-5 h-5" />
                Venditore
              </h3>
              {seller ? (
                <div className="space-y-2">
                  <p className="font-medium text-nordic-800">{seller.name}</p>
                  <p className="text-sm text-nordic-600">{seller.address}</p>
                  <p className="text-sm text-nordic-600">{seller.city}</p>
                  <p className="text-sm text-nordic-600">P.IVA: {seller.vatNumber}</p>
                  {seller.phone && (
                    <p className="text-sm text-nordic-600">Tel: {seller.phone}</p>
                  )}
                  {seller.email && (
                    <p className="text-sm text-nordic-600">Email: {seller.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-nordic-500">Venditore non trovato</p>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white border border-nordic-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
              <SafeIcon icon={FiPackage} className="w-5 h-5" />
              Dettagli Prodotto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-nordic-700">Prodotto</label>
                <p className="text-nordic-800 mt-1">{order.product || 'N/A'}</p>
              </div>
              {order.type && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Tipologia</label>
                  <p className="text-nordic-800 mt-1">{order.type}</p>
                </div>
              )}
              {order.origin && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Origine</label>
                  <p className="text-nordic-800 mt-1">{order.origin}</p>
                </div>
              )}
              {order.packaging && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Imballaggio</label>
                  <p className="text-nordic-800 mt-1">{order.packaging}</p>
                </div>
              )}
              {order.quantity && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Quantità</label>
                  <p className="text-nordic-800 mt-1">{order.quantity}</p>
                </div>
              )}
              {order.actual_weight !== undefined && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">
                    <SafeIcon icon={FiWeight} className="inline w-4 h-4 mr-1" />
                    Peso Effettivo
                  </label>
                  <p className="text-nordic-800 mt-1">
                    {order.actual_weight ? `${order.actual_weight} kg` : 'Non specificato'}
                  </p>
                </div>
              )}
              {order.delivery_details && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">
                    <SafeIcon icon={FiTrello} className="inline w-4 h-4 mr-1" />
                    Dettagli Consegna
                  </label>
                  <p className="text-nordic-800 mt-1">{order.delivery_details}</p>
                </div>
              )}
            </div>
          </div>

          {/* Commercial Terms */}
          <div className="bg-white border border-nordic-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
              <SafeIcon icon={FiDollarSign} className="w-5 h-5" />
              Condizioni Commerciali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-nordic-700">Prezzo Base</label>
                <p className="text-lg font-semibold text-nordic-800 mt-1">
                  {formatCurrency(order.price)}/KG
                </p>
              </div>
              {order.discount && parseFloat(order.discount) > 0 && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Sconto</label>
                  <p className="text-lg font-semibold text-orange-600 mt-1">
                    {order.discount}%
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-nordic-700">Prezzo Finale</label>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {formatCurrency(calculateFinalPrice())}/KG
                </p>
              </div>
              {order.invoice_amount !== undefined && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Importo Fattura</label>
                  <p className="text-lg font-semibold text-purple-600 mt-1">
                    {formatCurrency(order.invoice_amount || 0)}
                  </p>
                </div>
              )}
              {order.deliveryDate && (
                <div>
                  <label className="text-sm font-medium text-nordic-700">Data Consegna</label>
                  <p className="text-nordic-800 mt-1 flex items-center gap-1">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    {new Date(order.deliveryDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
              {order.paymentTerms && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-nordic-700">Condizioni di Pagamento</label>
                  <p className="text-nordic-800 mt-1">{order.paymentTerms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-nordic-50 rounded-lg p-4">
              <h4 className="font-semibold text-nordic-800 mb-2">Informazioni Ordine</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-nordic-600">Data Creazione:</span>
                  <span className="text-nordic-800">{new Date(order.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                {order.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-nordic-600">Ultimo Aggiornamento:</span>
                    <span className="text-nordic-800">{new Date(order.updatedAt).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-nordic-600">Pubblicato su App:</span>
                  <span className={order.publishToApp ? 'text-green-600' : 'text-nordic-500'}>
                    {order.publishToApp ? 'Sì' : 'No'}
                  </span>
                </div>
                {order.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-nordic-600">Numero Fattura:</span>
                    <span className="text-nordic-800">{order.invoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {order.attachments && (order.attachments.images?.length > 0 || order.attachments.notes?.length > 0) && (
              <div className="bg-nordic-50 rounded-lg p-4">
                <h4 className="font-semibold text-nordic-800 mb-2 flex items-center gap-2">
                  <SafeIcon icon={FiFileText} className="w-4 h-4" />
                  Allegati
                </h4>
                <div className="space-y-2 text-sm">
                  {order.attachments.images?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-nordic-600">Immagini:</span>
                      <span className="text-nordic-800">{order.attachments.images.length}</span>
                    </div>
                  )}
                  {order.attachments.notes?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-nordic-600">Note:</span>
                      <span className="text-nordic-800">{order.attachments.notes.length}</span>
                    </div>
                  )}
                  {order.attachments.lastUpdated && (
                    <div className="text-xs text-nordic-500 mt-2">
                      Ultimo aggiornamento: {new Date(order.attachments.lastUpdated).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderPreviewModal;