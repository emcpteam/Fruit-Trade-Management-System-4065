import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import { exportOrdersToExcel, exportClientsToExcel, exportVendorsToExcel, exportFinancialReport } from '@/utils/excelExporter';
import emailService from '@/utils/emailService';
import toast from 'react-hot-toast';

const { FiDownload, FiFileText, FiUsers, FiTruck, FiDollarSign, FiCalendar, FiMail, FiSend } = FiIcons;

const ReportsCenter = () => {
  const { orders, clients, vendors } = useOrderStore();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const reports = [
    {
      id: 'orders',
      title: 'Report Ordini',
      description: 'Esporta tutti gli ordini con dettagli completi',
      icon: FiFileText,
      color: 'bg-blue-500',
      action: () => exportOrdersToExcel(getFilteredOrders(), clients, vendors, 'Report_Ordini')
    },
    {
      id: 'clients',
      title: 'Anagrafica Clienti',
      description: 'Lista completa clienti con contatti',
      icon: FiUsers,
      color: 'bg-green-500',
      action: () => exportClientsToExcel(clients, 'Anagrafica_Clienti')
    },
    {
      id: 'vendors',
      title: 'Anagrafica Fornitori',
      description: 'Lista completa fornitori con contatti',
      icon: FiTruck,
      color: 'bg-purple-500',
      action: () => exportVendorsToExcel(vendors, 'Anagrafica_Fornitori')
    },
    {
      id: 'financial',
      title: 'Report Finanziario',
      description: 'Analisi prezzi e valori degli ordini',
      icon: FiDollarSign,
      color: 'bg-orange-500',
      action: () => exportFinancialReport(getFilteredOrders(), clients, vendors, 'Report_Finanziario')
    }
  ];

  const getFilteredOrders = () => {
    if (!dateRange.start && !dateRange.end) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
      const end = dateRange.end ? new Date(dateRange.end) : new Date();
      
      return orderDate >= start && orderDate <= end;
    });
  };

  const handleExport = async (reportAction) => {
    setIsExporting(true);
    try {
      await reportAction();
      toast.success('Report esportato con successo!');
    } catch (error) {
      toast.error('Errore durante l\'esportazione');
    } finally {
      setIsExporting(false);
    }
  };

  const sendBulkEmails = async () => {
    try {
      const clientsWithEmail = clients.filter(client => client.email);
      
      if (clientsWithEmail.length === 0) {
        toast.error('Nessun cliente con email trovato');
        return;
      }

      const result = await emailService.sendBulkNotifications(
        clientsWithEmail,
        'newsletter',
        { subject: 'Aggiornamenti dal nostro sistema' }
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Errore durante l\'invio delle email');
    }
  };

  const stats = [
    { label: 'Ordini Totali', value: orders.length, color: 'text-blue-600' },
    { label: 'Clienti Attivi', value: clients.length, color: 'text-green-600' },
    { label: 'Fornitori', value: vendors.length, color: 'text-purple-600' },
    { 
      label: 'Valore Medio Ordini', 
      value: `€${(orders.reduce((sum, o) => sum + o.price, 0) / orders.length || 0).toFixed(2)}`, 
      color: 'text-orange-600' 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Centro Reportistica</h1>
        <button
          onClick={sendBulkEmails}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiSend} className="w-5 h-5" />
          Invia Newsletter
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-nordic-200"
          >
            <div className="text-center">
              <p className="text-sm text-nordic-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <h3 className="text-lg font-semibold text-nordic-800 mb-4 flex items-center gap-2">
          <SafeIcon icon={FiCalendar} className="w-5 h-5" />
          Filtro Periodo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-nordic-700 mb-2">
              Data Inizio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nordic-700 mb-2">
              Data Fine
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>
        </div>
        {(dateRange.start || dateRange.end) && (
          <div className="mt-4">
            <p className="text-sm text-nordic-600">
              Ordini filtrati: {getFilteredOrders().length} di {orders.length}
            </p>
          </div>
        )}
      </motion.div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white rounded-xl border border-nordic-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <SafeIcon icon={report.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800">{report.title}</h3>
                  <p className="text-sm text-nordic-500">{report.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleExport(report.action)}
                disabled={isExporting}
                className="w-full bg-sage-600 text-white py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <SafeIcon icon={FiDownload} className="w-5 h-5" />
                    Esporta Excel
                  </>
                )}
              </button>

              {report.id === 'orders' && (
                <div className="text-xs text-nordic-500 text-center">
                  {dateRange.start || dateRange.end 
                    ? `Include ${getFilteredOrders().length} ordini nel periodo selezionato`
                    : `Include tutti i ${orders.length} ordini`
                  }
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <h3 className="text-lg font-semibold text-nordic-800 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport(() => exportOrdersToExcel(
              orders.filter(o => o.status === 'pending'), 
              clients, vendors, 'Ordini_In_Attesa'
            ))}
            className="p-4 border border-nordic-200 rounded-lg hover:bg-nordic-50 transition-colors text-left"
          >
            <h4 className="font-medium text-nordic-800">Ordini in Attesa</h4>
            <p className="text-sm text-nordic-500">
              {orders.filter(o => o.status === 'pending').length} ordini
            </p>
          </button>

          <button
            onClick={() => handleExport(() => exportOrdersToExcel(
              orders.filter(o => o.publishToApp), 
              clients, vendors, 'Ordini_App_Mobile'
            ))}
            className="p-4 border border-nordic-200 rounded-lg hover:bg-nordic-50 transition-colors text-left"
          >
            <h4 className="font-medium text-nordic-800">Ordini App Mobile</h4>
            <p className="text-sm text-nordic-500">
              {orders.filter(o => o.publishToApp).length} ordini pubblicati
            </p>
          </button>

          <button
            onClick={() => handleExport(() => exportOrdersToExcel(
              orders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), 
              clients, vendors, 'Ordini_Ultimo_Mese'
            ))}
            className="p-4 border border-nordic-200 rounded-lg hover:bg-nordic-50 transition-colors text-left"
          >
            <h4 className="font-medium text-nordic-800">Ultimo Mese</h4>
            <p className="text-sm text-nordic-500">
              {orders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} ordini recenti
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsCenter;