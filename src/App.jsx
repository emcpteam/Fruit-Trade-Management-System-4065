import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import NewOrderForm from './components/Orders/NewOrderForm';
import OrderArchive from './components/Orders/OrderArchive';
import ClientManagement from './components/Clients/ClientManagement';
import VendorManagement from './components/Vendors/VendorManagement';
import DigitalWarehouse from './components/Warehouse/DigitalWarehouse';
import ChronologicalRegister from './components/Register/ChronologicalRegister';
import InvoiceManagement from './components/Invoices/InvoiceManagement';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import PredictiveAnalytics from './components/Analytics/PredictiveAnalytics';
import ReportsCenter from './components/Reports/ReportsCenter';
import RoleManager from './components/Permissions/RoleManager';
import SystemSettings from './components/Settings/SystemSettings';
import ApiKeyManager from './components/ApiKeys/ApiKeyManager';
import SuggestionManager from './components/Suggestions/SuggestionManager';

function App() {
  const { isAuthenticated, canAccessModule } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Supabase sync
  const { isInitialized } = useSupabaseSync();
  
  // Wait for data to be initialized
  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <Toaster position="top-right" />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nordic-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sage-500 mx-auto mb-4"></div>
          <p className="text-nordic-600">Caricamento dati in corso...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  const renderContent = () => {
    // Check permissions for each module
    if (!canAccessModule(activeTab)) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-nordic-700 mb-2">Accesso Negato</h2>
          <p className="text-nordic-500">Non hai i permessi per accedere a questa sezione.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'new-order': return <NewOrderForm />;
      case 'orders': return <OrderArchive />;
      case 'clients': return <ClientManagement />;
      case 'vendors': return <VendorManagement />;
      case 'warehouse': return <DigitalWarehouse />;
      case 'register': return <ChronologicalRegister />;
      case 'invoices': return <InvoiceManagement />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'predictive-analytics': return <PredictiveAnalytics />;
      case 'reports': return <ReportsCenter />;
      case 'suggestions': return <SuggestionManager />;
      case 'api-keys': return <ApiKeyManager />;
      case 'roles': return <RoleManager />;
      case 'settings': return <SystemSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-nordic-50 font-poppins">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#5f7a5f',
            },
          },
        }}
      />
    </div>
  );
}

export default App;