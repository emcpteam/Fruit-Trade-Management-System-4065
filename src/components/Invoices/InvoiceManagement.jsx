import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import emailService from '@/utils/emailService';

const { FiFileText, FiPlus, FiSend, FiDownload, FiEye, FiCheck } = FiIcons;

const InvoiceManagement = () => {
  const { orders, clients, vendors, updateOrder } = useOrderStore();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Filter only completed orders that haven't been invoiced
  const invoiceableOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'pending'
  );

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente non trovato';
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Fornitore non trovato';
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const generateInvoice = async (data) => {
    setIsGenerating(true);
    try {
      // Mock invoice generation
      const invoiceNumber = `INV-${Date.now()}`;
      const selectedOrderData = orders.filter(order => selectedOrders.includes(order.id));
      
      // Calculate totals
      const subtotal = selectedOrderData.reduce((sum, order) => {
        return sum + (order.price * (1 - (order.discount || 0) / 100));
      }, 0);
      
      const vatAmount = subtotal * 0.22; // 22% VAT
      const total = subtotal + vatAmount;

      // Update orders status to invoiced
      selectedOrders.forEach(orderId => {
        updateOrder(orderId, { status: 'invoiced', invoiceNumber });
      });

      // Send email notification (mock)
      if (data.sendEmail) {
        const client = clients.find(c => c.id === parseInt(data.clientId));
        if (client && client.email) {
          const result = await emailService.sendInvoiceNotification({
            number: invoiceNumber,
            amount: total
          }, client);
          
          if (result.success) {
            toast.success(`Fattura ${invoiceNumber} generata e inviata via email!`);
          } else {
            toast.success(`Fattura ${invoiceNumber} generata!`);
            toast.error(result.message);
          }
        }
      } else {
        toast.success(`Fattura ${invoiceNumber} generata con successo!`);
      }

      setSelectedOrders([]);
      setShowInvoiceForm(false);
      reset();
    } catch (error) {
      toast.error('Errore durante la generazione della fattura');
    } finally {
      setIsGenerating(false);
    }
  };

  const bulkMarkAsInvoiced = () => {
    if (selectedOrders.length === 0) {
      toast.error('Seleziona almeno un ordine');
      return;
    }

    selectedOrders.forEach(orderId => {
      updateOrder(orderId, { status: 'invoiced' });
    });

    toast.success(`${selectedOrders.length} ordini marcati come fatturati`);
    setSelectedOrders([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Gestione Fatture</h1>
        <div className="flex gap-3">
          {selectedOrders.length > 0 && (
            <>
              <button
                onClick={bulkMarkAsInvoiced}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                Marca come Fatturati ({selectedOrders.length})
              </button>
              <button
                onClick={() => setShowInvoiceForm(true)}
                className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
                Genera Fattura ({selectedOrders.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Generation Modal */}
      {showInvoiceForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-nordic-800">Genera Fattura</h2>
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="text-nordic-400 hover:text-nordic-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(generateInvoice)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Cliente Fatturazione *
                  </label>
                  <select
                    {...register('clientId', { required: 'Cliente obbligatorio' })}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Data Fattura *
                  </label>
                  <input
                    {...register('invoiceDate', { required: 'Data fattura obbligatoria' })}
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                  {errors.invoiceDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.invoiceDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Note Fattura
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Note aggiuntive per la fattura..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    {...register('sendEmail')}
                    type="checkbox"
                    className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                  />
                  <span className="text-sm font-medium text-nordic-700">
                    Invia fattura via email al cliente
                  </span>
                </label>
              </div>

              {/* Selected Orders Summary */}
              <div className="bg-nordic-50 rounded-lg p-4">
                <h3 className="font-medium text-nordic-800 mb-2">
                  Ordini selezionati ({selectedOrders.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orders.filter(order => selectedOrders.includes(order.id)).map(order => (
                    <div key={order.id} className="flex justify-between text-sm">
                      <span>#{order.orderNumber} - {order.product}</span>
                      <span>€{order.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-4 py-2 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiFileText} className="w-4 h-4" />
                  )}
                  Genera Fattura
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Orders List for Invoicing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-nordic-200"
      >
        <div className="p-6 border-b border-nordic-200">
          <h2 className="text-lg font-semibold text-nordic-800">Ordini da Fatturare</h2>
          <p className="text-sm text-nordic-500 mt-1">
            Seleziona gli ordini da includere nella fattura
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-nordic-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(invoiceableOrders.map(order => order.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Ordine</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Prodotto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Prezzo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Stato</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nordic-200">
              {invoiceableOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-nordic-500">
                    Nessun ordine disponibile per la fatturazione
                  </td>
                </tr>
              ) : (
                invoiceableOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-nordic-50 ${selectedOrders.includes(order.id) ? 'bg-sage-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleOrderSelection(order.id)}
                        className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-nordic-800">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">{getClientName(order.clientId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">{order.product}</div>
                      <div className="text-sm text-nordic-500">{order.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">€{order.price}</div>
                      {order.discount && (
                        <div className="text-sm text-nordic-500">Sconto {order.discount}%</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status === 'pending' ? 'In Attesa' :
                         order.status === 'completed' ? 'Completato' : 'Fatturato'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-nordic-800">
                        {new Date(order.createdAt).toLocaleDateString('it-IT')}
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

export default InvoiceManagement;