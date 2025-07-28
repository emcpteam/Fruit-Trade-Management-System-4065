import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';

const { FiBook, FiCalendar, FiSearch, FiFilter } = FiIcons;

const ChronologicalRegister = () => {
  const { orders, clients, vendors } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber?.toString().includes(searchTerm) ||
                         getClientName(order.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getVendorName(order.vendorId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
                       new Date(order.createdAt).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente non trovato';
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Fornitore non trovato';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800 flex items-center gap-2">
          <SafeIcon icon={FiBook} className="w-8 h-8" />
          Registro Cronologico
        </h1>
        <div className="text-sm text-nordic-500">
          Totale ordini: {filteredOrders.length}
        </div>
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
                placeholder="Cerca per prodotto, numero ordine, cliente o fornitore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
              className="px-4 py-2 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
            >
              Pulisci Filtri
            </button>
          )}
        </div>
      </motion.div>

      {/* Register Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-nordic-200"
      >
        <div className="p-6 border-b border-nordic-200">
          <h2 className="text-lg font-semibold text-nordic-800">Registro Ordini</h2>
          <p className="text-sm text-nordic-500 mt-1">
            Elenco cronologico di tutti gli ordini processati
          </p>
        </div>

        <div className="divide-y divide-nordic-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-nordic-500">
              {searchTerm || dateFilter ? 'Nessun ordine trovato per i filtri selezionati' : 'Nessun ordine presente nel registro'}
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-nordic-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-lg font-semibold text-nordic-800">
                        Ordine #{order.orderNumber}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status === 'pending' ? 'In Attesa' :
                         order.status === 'completed' ? 'Completato' : 'Fatturato'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-nordic-700">Prodotto:</span>
                        <div className="text-nordic-600">{order.product}</div>
                      </div>
                      <div>
                        <span className="font-medium text-nordic-700">Cliente:</span>
                        <div className="text-nordic-600">{getClientName(order.clientId)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-nordic-700">Fornitore:</span>
                        <div className="text-nordic-600">{getVendorName(order.vendorId)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-nordic-700">Quantità:</span>
                        <div className="text-nordic-600">{order.quantity}</div>
                      </div>
                      <div>
                        <span className="font-medium text-nordic-700">Prezzo:</span>
                        <div className="text-nordic-600">€{order.price}/KG</div>
                      </div>
                      <div>
                        <span className="font-medium text-nordic-700">Consegna:</span>
                        <div className="text-nordic-600">
                          {new Date(order.deliveryDate).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>

                    {order.publishToApp && (
                      <div className="mt-3 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        📱 Pubblicato su app mobile
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-nordic-800">
                      {new Date(order.createdAt).toLocaleDateString('it-IT')}
                    </div>
                    <div className="text-xs text-nordic-500">
                      {new Date(order.createdAt).toLocaleTimeString('it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChronologicalRegister;