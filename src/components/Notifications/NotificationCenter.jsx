import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const { FiBell, FiX, FiCheck, FiTrash, FiMail, FiPackage, FiDollarSign, FiUsers } = FiIcons;

const NotificationCenter = () => {
  const { notifications, addNotification, markNotificationAsRead, deleteNotification } = useOrderStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications for demo
      if (Math.random() > 0.95) { // 5% chance every second
        const notificationTypes = [
          {
            type: 'order_created',
            title: 'Nuovo Ordine Creato',
            message: `Ordine #${Math.floor(Math.random() * 1000) + 500} creato da utente mobile`,
            icon: FiPackage,
            color: 'bg-blue-500'
          },
          {
            type: 'order_inquiry',
            title: 'Richiesta da App Mobile',
            message: 'Un utente ha mostrato interesse per un ordine',
            icon: FiMail,
            color: 'bg-green-500'
          },
          {
            type: 'payment_received',
            title: 'Pagamento Ricevuto',
            message: 'Pagamento confermato per fattura INV-2024-001',
            icon: FiDollarSign,
            color: 'bg-purple-500'
          }
        ];

        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        addNotification({
          id: Date.now(),
          ...randomNotification,
          timestamp: new Date(),
          read: false
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
      case 'order_updated':
        return FiPackage;
      case 'order_inquiry':
      case 'email_sent':
        return FiMail;
      case 'payment_received':
      case 'invoice_generated':
        return FiDollarSign;
      case 'user_registered':
        return FiUsers;
      default:
        return FiBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_created':
        return 'bg-blue-500';
      case 'order_inquiry':
        return 'bg-green-500';
      case 'payment_received':
        return 'bg-purple-500';
      case 'order_updated':
        return 'bg-orange-500';
      default:
        return 'bg-nordic-500';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    toast.success('Notifica eliminata');
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    toast.success('Tutte le notifiche contrassegnate come lette');
  };

  const clearAllNotifications = () => {
    if (window.confirm('Sei sicuro di voler eliminare tutte le notifiche?')) {
      notifications.forEach(notification => {
        deleteNotification(notification.id);
      });
      toast.success('Tutte le notifiche eliminate');
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-nordic-600 hover:text-nordic-800 hover:bg-nordic-100 rounded-lg transition-colors"
      >
        <SafeIcon icon={FiBell} className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-xl border border-nordic-200 shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-nordic-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-nordic-800">
                  Notifiche
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {unreadCount} non lette
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-nordic-400 hover:text-nordic-600 rounded"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-nordic-100 text-nordic-600 hover:bg-nordic-200'
                  }`}
                >
                  Tutte
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'unread'
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-nordic-100 text-nordic-600 hover:bg-nordic-200'
                  }`}
                >
                  Non lette
                </button>
                <button
                  onClick={() => setFilter('order_inquiry')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'order_inquiry'
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-nordic-100 text-nordic-600 hover:bg-nordic-200'
                  }`}
                >
                  Richieste
                </button>
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <SafeIcon icon={FiCheck} className="w-3 h-3" />
                    Segna tutte come lette
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <SafeIcon icon={FiTrash} className="w-3 h-3" />
                    Elimina tutte
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-nordic-500">
                  <SafeIcon icon={FiBell} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna notifica</p>
                </div>
              ) : (
                <div className="divide-y divide-nordic-100">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-nordic-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${colorClass} p-2 rounded-lg flex-shrink-0`}>
                            <SafeIcon icon={IconComponent} className="w-4 h-4 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-nordic-800' : 'text-nordic-600'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    title="Segna come letta"
                                  >
                                    <SafeIcon icon={FiCheck} className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Elimina"
                                >
                                  <SafeIcon icon={FiTrash} className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-nordic-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-nordic-400">
                              {new Date(notification.timestamp).toLocaleString('it-IT')}
                            </p>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-4"></div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;