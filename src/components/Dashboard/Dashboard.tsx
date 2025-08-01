import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dailySales: 0,
    monthlySales: 0,
    lowStockProducts: 0,
    expiringSoonProducts: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch daily sales
      const today = new Date().toISOString().split('T')[0];
      const { data: dailySalesData } = await supabase
        .from('sales')
        .select('total')
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // Fetch monthly sales
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];
      const { data: monthlySalesData } = await supabase
        .from('sales')
        .select('total')
        .eq('status', 'completed')
        .gte('created_at', `${firstDayOfMonth}T00:00:00`);

      // Fetch low stock products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id')
        .lt('stock_quantity', supabase.rpc('min_stock'));

      // Fetch expiring products (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { data: expiringData } = await supabase
        .from('product_lots')
        .select('id')
        .lte('expiry_date', thirtyDaysFromNow.toISOString());

      // Fetch total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      setStats({
        dailySales: dailySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        monthlySales: monthlySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        lowStockProducts: lowStockData?.length || 0,
        expiringSoonProducts: expiringData?.length || 0,
        totalCustomers: customersCount || 0,
        totalProducts: productsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Ventas del Día"
          value={`S/ ${stats.dailySales.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Ventas del Mes"
          value={`S/ ${stats.monthlySales.toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Total Clientes"
          value={stats.totalCustomers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Stock Bajo"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Por Vencer"
          value={stats.expiringSoonProducts}
          icon={Calendar}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Paracetamol 500mg</p>
                <p className="text-sm text-gray-600">Stock: 5 unidades</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                Bajo Stock
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Ibuprofeno 400mg</p>
                <p className="text-sm text-gray-600">Stock: 8 unidades</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                Bajo Stock
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Productos Por Vencer</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Amoxicilina 500mg</p>
                <p className="text-sm text-gray-600">Vence: 15/02/2025</p>
              </div>
              <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                Por Vencer
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Loratadina 10mg</p>
                <p className="text-sm text-gray-600">Vence: 20/02/2025</p>
              </div>
              <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                Por Vencer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}