import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';

const { FiFileText, FiUsers, FiTruck, FiDollarSign, FiTrendingUp, FiClock } = FiIcons;

const Dashboard = () => {
  const { orders, clients, vendors } = useOrderStore();

  const stats = [
    {
      title: 'Ordini Totali',
      value: orders.length,
      icon: FiFileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Clienti Attivi',
      value: clients.length,
      icon: FiUsers,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Fornitori',
      value: vendors.length,
      icon: FiTruck,
      color: 'bg-purple-500',
      change: '+2%'
    },
    {
      title: 'Ordini Pendenti',
      value: orders.filter(o => o.status === 'pending').length,
      icon: FiClock,
      color: 'bg-orange-500',
      change: '-8%'
    }
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Dashboard</h1>
        <div className="text-sm text-nordic-500">
          Ultimo aggiornamento: {new Date().toLocaleString('it-IT')}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-nordic-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nordic-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-nordic-800">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-nordic-200"
      >
        <div className="p-6 border-b border-nordic-200">
          <h2 className="text-lg font-semibold text-nordic-800">Ordini Recenti</h2>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="text-nordic-500 text-center py-8">Nessun ordine presente</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-nordic-50 rounded-lg">
                  <div>
                    <p className="font-medium text-nordic-800">
                      Ordine #{order.orderNumber}
                    </p>
                    <p className="text-sm text-nordic-500">
                      {order.product} - {order.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-nordic-600">
                      {new Date(order.createdAt).toLocaleDateString('it-IT')}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'pending' ? 'In Attesa' :
                       order.status === 'completed' ? 'Completato' : 'Fatturato'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;