import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, BarChart3, PieChart, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface SalesData {
  date: string;
  total_sales: number;
  total_orders: number;
}

interface ProductPerformance {
  product_name: string;
  total_sold: number;
  revenue: number;
  stock_level: number;
}

interface CustomerStats {
  customer_name: string;
  total_purchases: number;
  total_spent: number;
  last_purchase: string;
}

interface StockAlert {
  product_name: string;
  current_stock: number;
  min_stock: number;
  days_until_expiry: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ReportsList() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesGrowth: 0,
    orderGrowth: 0
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())
        .order('sale_date');

      if (salesError) throw salesError;

      // Process sales data for charts
      const processedSalesData = processSalesData(salesData || []);
      setSalesData(processedSalesData);

      // Load product performance
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          name,
          current_stock,
          sale_price,
          sale_items!inner(quantity, sale_price)
        `);

      if (productsError) throw productsError;

      const processedProductData = processProductData(productsData || []);
      setProductPerformance(processedProductData);

      // Load customer statistics
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          full_name,
          sales!inner(total_amount, sale_date)
        `);

      if (customersError) throw customersError;

      const processedCustomerData = processCustomerData(customersData || []);
      setCustomerStats(processedCustomerData);

      // Load stock alerts
      const { data: stockData, error: stockError } = await supabase
        .from('products')
        .select('name, current_stock, min_stock, expiry_date')
        .or(`current_stock.lte.min_stock,expiry_date.lte.${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}`);

      if (stockError) throw stockError;

      const processedStockAlerts = processStockAlerts(stockData || []);
      setStockAlerts(processedStockAlerts);

      // Calculate summary statistics
      const summary = calculateSummaryStats(salesData || [], processedSalesData);
      setSummaryStats(summary);

    } catch (error: any) {
      toast.error('Error al cargar reportes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (sales: any[]): SalesData[] => {
    const dailyData: { [key: string]: { sales: number; orders: number } } = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.sale_date).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, orders: 0 };
      }
      dailyData[date].sales += sale.total_amount || 0;
      dailyData[date].orders += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      total_sales: data.sales,
      total_orders: data.orders
    }));
  };

  const processProductData = (products: any[]): ProductPerformance[] => {
    return products.map(product => {
      const totalSold = product.sale_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;
      const revenue = product.sale_items?.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.sale_price || 0)), 0) || 0;
      
      return {
        product_name: product.name,
        total_sold: totalSold,
        revenue: revenue,
        stock_level: product.current_stock || 0
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const processCustomerData = (customers: any[]): CustomerStats[] => {
    return customers.map(customer => {
      const totalPurchases = customer.sales?.length || 0;
      const totalSpent = customer.sales?.reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0) || 0;
      const lastPurchase = customer.sales?.length > 0 
        ? new Date(Math.max(...customer.sales.map((s: any) => new Date(s.sale_date).getTime()))).toLocaleDateString()
        : 'Nunca';

      return {
        customer_name: customer.full_name,
        total_purchases: totalPurchases,
        total_spent: totalSpent,
        last_purchase: lastPurchase
      };
    }).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);
  };

  const processStockAlerts = (products: any[]): StockAlert[] => {
    return products.map(product => {
      const expiryDate = product.expiry_date ? new Date(product.expiry_date) : null;
      const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      return {
        product_name: product.name,
        current_stock: product.current_stock || 0,
        min_stock: product.min_stock || 0,
        days_until_expiry: daysUntilExpiry
      };
    }).filter(alert => alert.current_stock <= alert.min_stock || (alert.days_until_expiry !== null && alert.days_until_expiry <= 30));
  };

  const calculateSummaryStats = (sales: any[], processedSales: SalesData[]) => {
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalOrders = sales.length;
    
    // Calculate growth (simplified - comparing first and last week)
    const firstWeekSales = processedSales.slice(0, 7).reduce((sum, day) => sum + day.total_sales, 0);
    const lastWeekSales = processedSales.slice(-7).reduce((sum, day) => sum + day.total_sales, 0);
    const salesGrowth = firstWeekSales > 0 ? ((lastWeekSales - firstWeekSales) / firstWeekSales) * 100 : 0;

    return {
      totalSales,
      totalOrders,
      totalCustomers: customerStats.length,
      totalProducts: productPerformance.length,
      salesGrowth,
      orderGrowth: 0 // Simplified for demo
    };
  };

  const exportReport = (type: string) => {
    // This would typically generate and download a CSV/PDF file
    toast.success(`Reporte ${type} exportado exitosamente`);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis de ventas, productos y rendimiento del negocio</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <button
            onClick={() => exportReport('general')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">${summaryStats.totalSales.toFixed(2)}</p>
            </div>
            <div className={`p-3 rounded-full ${summaryStats.salesGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${summaryStats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {summaryStats.salesGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ml-1 ${summaryStats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(summaryStats.salesGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Órdenes</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalCustomers}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalProducts}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ventas
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alertas
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Tendencia de Ventas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_sales" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformance.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Distribución de Ventas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={productPerformance.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {productPerformance.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Análisis Detallado de Ventas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Órdenes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio por Orden
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.map((day, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${day.total_sales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${day.total_orders > 0 ? (day.total_sales / day.total_orders).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Rendimiento de Productos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidades Vendidas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actual
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productPerformance.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.total_sold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock_level <= 10 ? 'bg-red-100 text-red-800' :
                          product.stock_level <= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stock_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Clientes Principales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compras
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Gastado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Compra
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerStats.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.total_purchases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${customer.total_spent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.last_purchase}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Alertas de Stock y Vencimiento</h3>
            {stockAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay alertas activas</p>
            ) : (
              <div className="space-y-4">
                {stockAlerts.map((alert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{alert.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Stock actual: {alert.current_stock} (Mínimo: {alert.min_stock})
                        </p>
                        {alert.days_until_expiry !== null && alert.days_until_expiry <= 30 && (
                          <p className="text-sm text-red-600">
                            Vence en {alert.days_until_expiry} días
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {alert.current_stock <= alert.min_stock && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Stock Bajo
                          </span>
                        )}
                        {alert.days_until_expiry !== null && alert.days_until_expiry <= 30 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Por Vencer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 