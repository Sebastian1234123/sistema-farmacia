import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Auth/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductList } from './components/Products/ProductList';
import { SalesList } from './components/Sales/SalesList';
import { CustomerList } from './components/Customers/CustomerList';
import { PurchaseList } from './components/Purchases/PurchaseList';
import { PrescriptionList } from './components/Prescriptions/PrescriptionList';
import { ReportsList } from './components/Reports/ReportsList';
import { SettingsList } from './components/Settings/SettingsList';

const tabTitles = {
  dashboard: 'Dashboard',
  products: 'Gestión de Productos',
  sales: 'Registro de Ventas',
  customers: 'Gestión de Clientes',
  purchases: 'Gestión de Compras',
  prescriptions: 'Recetas Médicas',
  reports: 'Reportes y Análisis',
  settings: 'Configuración del Sistema',
};

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductList />;
      case 'sales':
        return <SalesList />;
      case 'customers':
        return <CustomerList />;
      case 'purchases':
        return <PurchaseList />;
      case 'prescriptions':
        return <PrescriptionList />;
      case 'reports':
        return <ReportsList />;
      case 'settings':
        return <SettingsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={tabTitles[activeTab as keyof typeof tabTitles]}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;