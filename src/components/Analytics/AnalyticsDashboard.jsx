import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';

const { FiTrendingUp, FiDollarSign, FiUsers, FiPackage, FiCalendar, FiDownload } = FiIcons;

const COLORS = ['#5f7a5f', '#7d917d', '#a4b3a4', '#c7d0c7'];

const AnalyticsDashboard = () => {
  const { orders, clients, vendors } = useOrderStore();
  const [timeFilter, setTimeFilter] = useState('all');

  const analytics = useMemo(() => {
    const now = new Date();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (timeFilter) {
        case 'week':
          return now - orderDate <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now - orderDate <= 30 * 24 * 60 * 60 * 1000;
        case 'quarter':
          return now - orderDate <= 90 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    // Basic metrics
    const totalOrders = filteredOrders.length;
    const avgPrice = filteredOrders.reduce((sum, order) => sum + order.price, 0) / totalOrders || 0;
    const totalValue = filteredOrders.reduce((sum, order) => {
      return sum + (order.price * (1 - (order.discount || 0) / 100));
    }, 0);

    // Orders by status
    const statusData = [
      { name: 'In Attesa', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { name: 'Completati', value: filteredOrders.filter(o => o.status === 'completed').length, color: '#10b981' },
      { name: 'Fatturati', value: filteredOrders.filter(o => o.status === 'invoiced').length, color: '#3b82f6' }
    ];

    // Monthly orders trend
    const monthlyData = {};
    filteredOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('it-IT', { year: 'numeric', month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const trendData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      ordini: count
    }));

    // Top clients
    const clientStats = {};
    filteredOrders.forEach(order => {
      const client = clients.find(c => c.id === order.clientId);
      if (client) {
        clientStats[client.name] = (clientStats[client.name] || 0) + 1;
      }
    });

    const topClients = Object.entries(clientStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, ordini: count }));

    // Product categories
    const productStats = {};
    filteredOrders.forEach(order => {
      const category = order.product?.split(' ')[0] || 'Altro';
      productStats[category] = (productStats[category] || 0) + 1;
    });

    const productData = Object.entries(productStats)
      .slice(0, 5)
      .map(([product, count]) => ({ name: product, value: count }));

    return {
      totalOrders,
      avgPrice,
      totalValue,
      statusData,
      trendData,
      topClients,
      productData
    };
  }, [orders, clients, timeFilter]);

  const metrics = [
    {
      title: 'Ordini Totali',
      value: analytics.totalOrders,
      icon: FiPackage,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Prezzo Medio',
      value: `€${analytics.avgPrice.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Valore Totale',
      value: `€${analytics.totalValue.toFixed(0)}`,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Clienti Attivi',
      value: clients.length,
      icon: FiUsers,
      color: 'bg-orange-500',
      change: '+3%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Analytics & Reportistica</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-nordic-300 rounded-lg focus:ring-2 focus:ring-sage-500"
          >
            <option value="all">Tutti i periodi</option>
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="quarter">Ultimo trimestre</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-nordic-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nordic-500 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-nordic-800">{metric.value}</p>
                <p className="text-sm text-green-600 mt-1">{metric.change}</p>
              </div>
              <div className={`${metric.color} p-3 rounded-lg`}>
                <SafeIcon icon={metric.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Trend Ordini</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ordini" stroke="#5f7a5f" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Distribuzione Stati</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Top Clienti</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topClients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ordini" fill="#5f7a5f" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Product Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Categorie Prodotti</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;