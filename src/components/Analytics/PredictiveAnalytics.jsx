import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';

const { FiTrendingUp, FiTarget, FiZap, FiActivity, FiBarChart3, FiCalendar } = FiIcons;

const PredictiveAnalytics = () => {
  const { orders, clients, vendors } = useOrderStore();
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const predictions = useMemo(() => {
    // Generate predictive data based on historical trends
    const now = new Date();
    const cutoffMonths = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    
    // Filter historical data
    const historicalOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const monthsAgo = new Date(now.getFullYear(), now.getMonth() - cutoffMonths, now.getDate());
      return orderDate >= monthsAgo;
    });

    // Group by month
    const monthlyData = {};
    historicalOrders.forEach(order => {
      const monthKey = new Date(order.createdAt).toLocaleDateString('it-IT', { year: 'numeric', month: 'short' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          orders: 0,
          revenue: 0,
          avgPrice: 0,
          totalPrice: 0
        };
      }
      monthlyData[monthKey].orders++;
      monthlyData[monthKey].totalPrice += order.price;
      monthlyData[monthKey].revenue += order.price * (1 - (order.discount || 0) / 100);
    });

    // Calculate averages
    Object.values(monthlyData).forEach(data => {
      data.avgPrice = data.totalPrice / data.orders || 0;
    });

    const historical = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month + ' 1, 2024') - new Date(b.month + ' 1, 2024')
    );

    // Simple linear regression for prediction
    const predictFutureMonths = (data, months = 3) => {
      if (data.length < 2) return [];
      
      const xValues = data.map((_, index) => index);
      const yValues = data.map(d => d[selectedMetric] || d.orders);
      
      // Calculate trend
      const n = data.length;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
      const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Generate future predictions
      const predictions = [];
      for (let i = 1; i <= months; i++) {
        const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthKey = futureDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'short' });
        const predictedValue = Math.max(0, slope * (n + i - 1) + intercept);
        
        predictions.push({
          month: monthKey,
          [selectedMetric]: Math.round(predictedValue * 100) / 100,
          isPrediction: true,
          confidence: Math.max(0.6, 1 - (i * 0.1)) // Decreasing confidence
        });
      }
      
      return predictions;
    };

    const futureData = predictFutureMonths(historical, 3);
    
    // Combine historical and predicted data
    const combinedData = [
      ...historical.map(d => ({ ...d, isPrediction: false, confidence: 1 })),
      ...futureData
    ];

    // Calculate growth rate
    const recentAvg = historical.slice(-3).reduce((sum, d) => sum + (d[selectedMetric] || d.orders), 0) / 3;
    const olderAvg = historical.slice(0, 3).reduce((sum, d) => sum + (d[selectedMetric] || d.orders), 0) / 3;
    const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    return {
      data: combinedData,
      growthRate,
      trend: growthRate > 0 ? 'positive' : growthRate < 0 ? 'negative' : 'stable',
      nextMonthPrediction: futureData[0]?.[selectedMetric] || 0,
      confidence: futureData[0]?.confidence || 0
    };
  }, [orders, timeRange, selectedMetric]);

  const marketInsights = useMemo(() => {
    // Analyze market patterns
    const productAnalysis = {};
    const priceAnalysis = {};
    const seasonalAnalysis = {};

    orders.forEach(order => {
      const product = order.product.split(' ')[0];
      const month = new Date(order.createdAt).getMonth();
      
      // Product performance
      if (!productAnalysis[product]) {
        productAnalysis[product] = { count: 0, totalRevenue: 0, avgPrice: 0 };
      }
      productAnalysis[product].count++;
      productAnalysis[product].totalRevenue += order.price;
      
      // Price trends
      const priceRange = order.price < 0.5 ? 'low' : order.price < 1.0 ? 'medium' : 'high';
      priceAnalysis[priceRange] = (priceAnalysis[priceRange] || 0) + 1;
      
      // Seasonal patterns
      const season = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4';
      seasonalAnalysis[season] = (seasonalAnalysis[season] || 0) + 1;
    });

    // Calculate averages
    Object.values(productAnalysis).forEach(data => {
      data.avgPrice = data.totalRevenue / data.count;
    });

    const topProducts = Object.entries(productAnalysis)
      .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(([product, data]) => ({ product, ...data }));

    return {
      topProducts,
      priceDistribution: priceAnalysis,
      seasonalTrends: seasonalAnalysis,
      marketVolatility: Math.random() * 0.3 + 0.1 // Mock volatility index
    };
  }, [orders]);

  const metrics = [
    {
      id: 'orders',
      name: 'Ordini',
      icon: FiBarChart3,
      color: 'text-blue-600',
      format: (value) => Math.round(value)
    },
    {
      id: 'revenue',
      name: 'Fatturato',
      icon: FiTrendingUp,
      color: 'text-green-600',
      format: (value) => `€${value.toFixed(0)}`
    },
    {
      id: 'avgPrice',
      name: 'Prezzo Medio',
      icon: FiTarget,
      color: 'text-purple-600',
      format: (value) => `€${value.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-nordic-800">Analisi Predittiva</h2>
        <div className="flex gap-3">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border border-nordic-300 rounded-lg focus:ring-2 focus:ring-sage-500"
          >
            {metrics.map(metric => (
              <option key={metric.id} value={metric.id}>{metric.name}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-nordic-300 rounded-lg focus:ring-2 focus:ring-sage-500"
          >
            <option value="3months">3 Mesi</option>
            <option value="6months">6 Mesi</option>
            <option value="12months">12 Mesi</option>
          </select>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <SafeIcon icon={FiZap} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Previsione Prossimo Mese</h3>
              <p className="text-sm text-nordic-500">
                {metrics.find(m => m.id === selectedMetric)?.name}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-nordic-800">
              {metrics.find(m => m.id === selectedMetric)?.format(predictions.nextMonthPrediction)}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-nordic-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${predictions.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-nordic-600">
                {Math.round(predictions.confidence * 100)}% fiducia
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`${predictions.trend === 'positive' ? 'bg-green-500' : predictions.trend === 'negative' ? 'bg-red-500' : 'bg-gray-500'} p-3 rounded-lg`}>
              <SafeIcon icon={FiActivity} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Trend di Crescita</h3>
              <p className="text-sm text-nordic-500">Ultimi {timeRange}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-2xl font-bold ${predictions.trend === 'positive' ? 'text-green-600' : predictions.trend === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
              {predictions.growthRate > 0 ? '+' : ''}{predictions.growthRate.toFixed(1)}%
            </p>
            <p className="text-sm text-nordic-600">
              {predictions.trend === 'positive' ? 'Crescita positiva' : 
               predictions.trend === 'negative' ? 'Trend negativo' : 'Stabile'}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <SafeIcon icon={FiTarget} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Volatilità Mercato</h3>
              <p className="text-sm text-nordic-500">Indice di stabilità</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-nordic-800">
              {(marketInsights.marketVolatility * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-nordic-600">
              {marketInsights.marketVolatility < 0.2 ? 'Mercato stabile' : 
               marketInsights.marketVolatility < 0.3 ? 'Moderata volatilità' : 'Alta volatilità'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Prediction Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <h3 className="text-lg font-semibold text-nordic-800 mb-4">
          Analisi Predittiva - {metrics.find(m => m.id === selectedMetric)?.name}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictions.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => [
                metrics.find(m => m.id === selectedMetric)?.format(value),
                props.payload.isPrediction ? 'Previsione' : 'Storico'
              ]}
              labelFormatter={(label, payload) => {
                const point = payload?.[0]?.payload;
                return point?.isPrediction ? `${label} (Previsto)` : label;
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#5f7a5f"
              fill="#5f7a5f"
              fillOpacity={0.3}
              strokeDasharray={(entry) => entry?.isPrediction ? "5 5" : "0"}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-nordic-500">
          <span className="inline-block w-3 h-3 bg-sage-500 rounded mr-2"></span>
          Dati storici
          <span className="inline-block w-3 h-3 border-2 border-sage-500 border-dashed rounded ml-4 mr-2"></span>
          Previsioni
        </div>
      </motion.div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Top Prodotti per Fatturato</h3>
          <div className="space-y-3">
            {marketInsights.topProducts.map((product, index) => (
              <div key={product.product} className="flex items-center justify-between p-3 bg-nordic-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-sage-700">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-nordic-800">{product.product}</p>
                    <p className="text-sm text-nordic-500">{product.count} ordini</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-nordic-800">€{product.totalRevenue.toFixed(0)}</p>
                  <p className="text-sm text-nordic-500">€{product.avgPrice.toFixed(2)}/kg</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <h3 className="text-lg font-semibold text-nordic-800 mb-4">Analisi Stagionale</h3>
          <div className="space-y-4">
            {Object.entries(marketInsights.seasonalTrends).map(([quarter, count]) => (
              <div key={quarter} className="flex items-center justify-between">
                <span className="font-medium text-nordic-700">{quarter}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-nordic-200 rounded-full h-2">
                    <div 
                      className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / Math.max(...Object.values(marketInsights.seasonalTrends))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-nordic-800 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Raccomandazioni</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Aumentare stock nei trimestri di picco</li>
              <li>• Pianificare promozioni nei periodi meno attivi</li>
              <li>• Ottimizzare la supply chain per la stagionalità</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;