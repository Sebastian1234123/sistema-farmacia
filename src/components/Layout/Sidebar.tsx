import React from 'react';
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  Receipt, 
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Pill
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'sales', label: 'Ventas', icon: Receipt },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'purchases', label: 'Compras', icon: ShoppingCart },
  { id: 'prescriptions', label: 'Recetas', icon: Pill },
  { id: 'reports', label: 'Reportes', icon: TrendingUp },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, collapsed }: SidebarProps) {
  const { signOut, user } = useAuth();

  return (
    <div className={`bg-slate-900 text-white h-screen transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">PharmaSys</h1>
              <p className="text-xs text-slate-400">Sistema de Facturación</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        {!collapsed && user && (
          <div className="mb-4">
            <p className="text-sm font-medium">{user.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}