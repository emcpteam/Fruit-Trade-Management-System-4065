import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import { exportOrdersToExcel } from '@/utils/excelExporter';
import { generateOrderContract, downloadPDF } from '@/utils/pdfGenerator';
import emailService from '@/utils/emailService';
import toast from 'react-hot-toast';
import OrderImageManager from './OrderImageManager';
import OrderPhotoUploader from './OrderPhotoUploader';
import OrderPreviewModal from './OrderPreviewModal';
import OrderEditModal from './OrderEditModal';

const { FiSearch, FiFilter, FiEye, FiDownload, FiEdit, FiMail, FiFileText, FiPaperclip, FiCamera, FiPlus } = FiIcons;

const OrderArchive = () => {
  const { orders, clients, updateOrder } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showImageManager, setShowImageManager] = useState(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNumber?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Compratore non trovato';
  };

  const getSellerName = (sellerId) => {
    const seller = clients.find(c => c.id === sellerId);
    return seller ? seller.name : 'Venditore non trovato';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'In Attesa', class: 'bg-orange-100 text-orange-800' },
      completed: { label: 'Completato', class: 'bg-green-100 text-green-800' },
      invoiced: { label: 'Fatturato', class: 'bg-blue-100 text-blue-800' }
    };
    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      exportOrdersToExcel(filteredOrders, clients, clients, 'Archivio_Ordini');
      toast.success('Export Excel completato!');
    } catch (error) {
      toast.error('Errore durante l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      updateOrder(orderId, { status: newStatus });
      const order = orders.find(o => o.id === orderId);
      const buyer = clients.find(c => c.id === order.buyerId);
      const seller = clients.find(c => c.id === order.sellerId);

      // Send email notifications to both buyer and seller
      if (buyer && buyer.email) {
        const result = await emailService.sendOrderUpdate(order, buyer, 'buyer', newStatus);
        if (result.success) {
          toast.success(`Stato aggiornato e notifica inviata al compratore: ${buyer.email}`);
        } else {
          toast.error(`Errore nell'invio email al compratore: ${result.message}`);
        }
      }

      if (seller && seller.email) {
        const result = await emailService.sendOrderUpdate(order, seller, 'seller', newStatus);
        if (result.success) {
          toast.success(`Stato aggiornato e notifica inviata al venditore: ${seller.email}`);
        } else {
          toast.error(`Errore nell'invio email al venditore: ${result.message}`);
        }
      }

      if (!buyer?.email && !seller?.email) {
        toast.success('Stato aggiornato');
      }
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento');
    }
  };

  const sendOrderEmail = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const buyer = clients.find(c => c.id === order.buyerId);
      const seller = clients.find(c => c.id === order.sellerId);
      
      let emailsSent = 0;
      let emailErrors = 0;

      if (buyer?.email) {
        const buyerResult = await emailService.sendOrderConfirmation(order, buyer, 'buyer');
        if (buyerResult.success) {
          emailsSent++;
        } else {
          emailErrors++;
        }
      }

      if (seller?.email) {
        const sellerResult = await emailService.sendOrderConfirmation(order, seller, 'seller');
        if (sellerResult.success) {
          emailsSent++;
        } else {
          emailErrors++;
        }
      }

      if (emailsSent > 0) {
        toast.success(`${emailsSent} email inviate con successo`);
      }
      
      if (emailErrors > 0) {
        toast.error(`${emailErrors} email non inviate`);
      }
      
      if (!buyer?.email && !seller?.email) {
        toast.error('Nessun indirizzo email disponibile');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio email');
    }
  };

  // Handle order preview
  const handlePreviewOrder = (order) => {
    setShowPreviewModal(order);
  };

  // Handle order edit
  const handleEditOrder = (order) => {
    setShowEditModal(order);
  };

  // Handle order download (PDF)
  const handleDownloadOrder = (order) => {
    try {
      const buyer = clients.find(c => c.id === order.buyerId);
      const seller = clients.find(c => c.id === order.sellerId);
      
      if (!buyer || !seller) {
        toast.error('Dati compratore o venditore mancanti per generare il PDF');
        return;
      }

      const pdf = generateOrderContract(order, buyer, seller);
      const fileName = `Contratto_${order.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdf, fileName);
      toast.success('PDF scaricato con successo!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Errore durante la generazione del PDF');
    }
  };

  const handleImageUpdate = (orderId, updates) => {
    updateOrder(orderId, updates);
    toast.success('Allegati ordine aggiornati');
  };

  const handlePhotoUpdate = (orderId, attachments) => {
    updateOrder(orderId, { attachments });
    toast.success('Foto ordine aggiornate');
  };

  const handleOrderUpdate = (orderId, updates) => {
    updateOrder(orderId, updates);
    toast.success('Ordine aggiornato con successo!');
    setShowEditModal(null);
  };

  const getAttachmentCount = (order) => {
    return (order.attachments?.images?.length || 0) + (order.attachments?.notes?.length || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Archivio Ordini</h1>
        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SafeIcon icon={FiDownload} className="w-5 h-5" />
          )}
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per prodotto o numero ordine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="pending">In Attesa</option>
              <option value="completed">Completato</option>
              <option value="invoiced">Fatturato</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Image Manager Modal */}
      {showImageManager && (
        <OrderImageManager
          order={showImageManager}
          onClose={() => setShowImageManager(null)}
          onUpdate={handleImageUpdate}
        />
      )}

      {/* Photo Uploader Modal */}
      {showPhotoUploader && (
        <OrderPhotoUploader
          attachments={showPhotoUploader.attachments || { images: [], notes: [] }}
          onClose={() => setShowPhotoUploader(null)}
          onUpdate={(attachments) => handlePhotoUpdate(showPhotoUploader.id, attachments)}
          orderInfo={{ 
            orderNumber: showPhotoUploader.orderNumber,
            product: showPhotoUploader.product, 
            isNew: false 
          }}
        />
      )}

      {/* Order Preview Modal */}
      {showPreviewModal && (
        <OrderPreviewModal
          order={showPreviewModal}
          buyer={clients.find(c => c.id === showPreviewModal.buyerId)}
          seller={clients.find(c => c.id === showPreviewModal.sellerId)}
          onClose={() => setShowPreviewModal(null)}
          onEdit={() => {
            setShowPreviewModal(null);
            setShowEditModal(showPreviewModal);
          }}
          onDownload={() => handleDownloadOrder(showPreviewModal)}
        />
      )}

      {/* Order Edit Modal */}
      {showEditModal && (
        <OrderEditModal
          order={showEditModal}
          clients={clients}
          onClose={() => setShowEditModal(null)}
          onUpdate={handleOrderUpdate}
        />
      )}

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-nordic-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-nordic-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Ordine</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Prodotto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Compratore</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Venditore</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Prezzo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Peso Eff.</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Stato</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Foto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Data</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nordic-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-nordic-500">
                    Nessun ordine trovato
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-nordic-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-nordic-800">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">{order.product}</div>
                      <div className="text-sm text-nordic-500">{order.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">{getClientName(order.buyerId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">{getSellerName(order.sellerId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">€{order.price}</div>
                      {order.discount && (
                        <div className="text-sm text-nordic-500">Sconto {order.discount}%</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">
                        {order.actual_weight ? `${order.actual_weight} kg` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-nordic-300 rounded focus:ring-1 focus:ring-sage-500"
                      >
                        <option value="pending">In Attesa</option>
                        <option value="completed">Completato</option>
                        <option value="invoiced">Fatturato</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* Quick Photo Upload */}
                        <button
                          onClick={() => setShowPhotoUploader(order)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Aggiungi/Gestisci foto"
                        >
                          <SafeIcon icon={FiCamera} className="w-4 h-4" />
                        </button>
                        
                        {/* Attachment Manager */}
                        <button
                          onClick={() => setShowImageManager(order)}
                          className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                            getAttachmentCount(order) > 0
                              ? 'text-blue-600 hover:bg-blue-50 bg-blue-50'
                              : 'text-nordic-500 hover:bg-nordic-100'
                          }`}
                          title="Gestisci allegati ordine"
                        >
                          <SafeIcon icon={FiPaperclip} className="w-3 h-3" />
                          {getAttachmentCount(order) || 0}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">
                        {new Date(order.createdAt).toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sendOrderEmail(order.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Invia Email"
                        >
                          <SafeIcon icon={FiMail} className="w-4 h-4" />
                        </button>
                        
                        {/* Preview Button */}
                        <button
                          onClick={() => handlePreviewOrder(order)}
                          className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                          title="Anteprima Ordine"
                        >
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </button>
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                          title="Modifica Ordine"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        
                        {/* Download Button */}
                        <button
                          onClick={() => handleDownloadOrder(order)}
                          className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                          title="Scarica PDF"
                        >
                          <SafeIcon icon={FiDownload} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderArchive;