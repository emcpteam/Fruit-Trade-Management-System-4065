import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

const {
  FiHome, FiUsers, FiTruck, FiFileText, FiBarChart3, FiSettings, FiLogOut,
  FiPlus, FiArchive, FiTrendingUp, FiMail, FiShield, FiKey, FiTag, FiPackage, FiDatabase
} = FiIcons;

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, canAccessModule } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'new-order', label: 'Nuovo Ordine', icon: FiPlus },
    { id: 'orders', label: 'Archivio Ordini', icon: FiArchive },
    { id: 'clients', label: 'Clienti', icon: FiUsers },
    { id: 'vendors', label: 'Fornitori', icon: FiTruck },
    { id: 'warehouse', label: 'Magazzino Digitale', icon: FiPackage },
    { id: 'register', label: 'Registro Cronologico', icon: FiFileText },
    { id: 'invoices', label: 'Fatturazione', icon: FiBarChart3 },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
    { id: 'reports', label: 'Reportistica', icon: FiMail },
    { id: 'suggestions', label: 'Suggerimenti', icon: FiTag, adminOnly: true },
    { id: 'api-keys', label: 'Chiavi API', icon: FiKey, adminOnly: true },
    { id: 'roles', label: 'Gestione Ruoli', icon: FiShield, adminOnly: true },
    { id: 'settings', label: 'Impostazioni', icon: FiSettings },
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return canAccessModule(item.id);
  });

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r border-nordic-200 h-screen flex flex-col"
    >
      <div className="p-6 border-b border-nordic-200">
        <h1 className="text-xl font-semibold text-nordic-800">Trade Manager</h1>
        <p className="text-sm text-nordic-500 mt-1">
          Benvenuto, {user?.name}
          <span className="ml-2 px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full capitalize">
            {user?.role}
          </span>
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-sage-100 text-sage-700 border border-sage-200'
                : 'text-nordic-600 hover:bg-nordic-50 hover:text-nordic-800'
            }`}
          >
            <SafeIcon icon={item.icon} className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-nordic-200">
        {/* System Status */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-800">Sistema Online</span>
          </div>
          <p className="text-xs text-green-600 mt-1">API Mobile: Attiva</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <SafeIcon icon={FiLogOut} className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;