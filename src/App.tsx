import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Auth/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductList } from './components/Products/ProductList';
import { SalesList } from './components/Sales/SalesList';

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
        return <div className="p-6">Módulo de Clientes - En desarrollo</div>;
      case 'purchases':
        return <div className="p-6">Módulo de Compras - En desarrollo</div>;
      case 'prescriptions':
        return <div className="p-6">Módulo de Recetas - En desarrollo</div>;
      case 'reports':
        return <div className="p-6">Módulo de Reportes - En desarrollo</div>;
      case 'settings':
        return <div className="p-6">Configuración del Sistema - En desarrollo</div>;
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