import React from 'react';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import NotificationCenter from '@/components/Notifications/NotificationCenter';

const { FiUser } = FiIcons;

const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-nordic-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-nordic-800">
            Sistema di Gestione Commerciale
          </h2>
          <p className="text-sm text-nordic-500">
            Gestione ordini, clienti e fornitori
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-nordic-50 rounded-lg">
            <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="w-4 h-4 text-sage-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-nordic-800">{user?.name}</p>
              <p className="text-xs text-nordic-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;