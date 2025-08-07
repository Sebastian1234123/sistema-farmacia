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

// Definir interfaces más flexibles para los datos de Supabase (opcional)

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dailySales: 0,
    monthlySales: 0,
    lowStockProducts: 0,
    expiringSoonProducts: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [expiringSoonProducts, setExpiringSoonProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('🔍 Fetching dashboard stats...');

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

      // Fetch low stock products with details
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock')
        .lte('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })
        .limit(5);

      // **SOLUCIÓN MEJORADA PARA PRODUCTOS POR VENCER**
      
      // 1. Usar fechas más específicas y en formato correcto
      const todayDate = new Date();
      const futureDate = new Date();
      futureDate.setDate(todayDate.getDate() + 30);
      
      // Formatear fechas en formato YYYY-MM-DD
      const todayString = todayDate.toISOString().split('T')[0];
      const futureString = futureDate.toISOString().split('T')[0];

      console.log('📅 Buscando productos que vencen entre:', todayString, 'y', futureString);

      // 2. Primero verificar si hay datos en product_lots
      const { data: allLots, error: allLotsError } = await supabase
        .from('product_lots')
        .select('id, lot_number, expiry_date, quantity, product_id')
        .limit(10); // Solo para verificar

      console.log('🔍 Verificando datos existentes en product_lots:', { allLots, allLotsError });

      // **CONSULTA SIMPLIFICADA PARA DEBUG - REMOVER FILTROS UNO POR UNO**
      
      console.log('🔍 PASO 1: Consulta básica sin filtros');
      const { data: step1, error: error1 } = await supabase
        .from('product_lots')
        .select('id, lot_number, expiry_date, quantity, product_id')
        .order('expiry_date', { ascending: true });
        
      console.log('PASO 1 - Todos los lotes:', { step1, error1, count: step1?.length });
      
      console.log('🔍 PASO 2: Solo filtro de fecha NOT NULL');
      const { data: step2, error: error2 } = await supabase
        .from('product_lots')
        .select('id, lot_number, expiry_date, quantity, product_id')
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true });
        
      console.log('PASO 2 - Con fechas válidas:', { step2, error2, count: step2?.length });
      
      console.log('🔍 PASO 3: Agregar filtro de rango de fechas');
      const { data: step3, error: error3 } = await supabase
        .from('product_lots')
        .select('id, lot_number, expiry_date, quantity, product_id')
        .not('expiry_date', 'is', null)
        .gte('expiry_date', todayString)
        .lte('expiry_date', futureString)
        .order('expiry_date', { ascending: true });
        
      console.log('PASO 3 - En rango de fechas:', { 
        step3, 
        error3, 
        count: step3?.length,
        fechasUsadas: { desde: todayString, hasta: futureString }
      });
      
      console.log('🔍 PASO 4: Agregar filtro de cantidad');
      const { data: step4, error: error4 } = await supabase
        .from('product_lots')
        .select('id, lot_number, expiry_date, quantity, product_id')
        .not('expiry_date', 'is', null)
        .gte('expiry_date', todayString)
        .lte('expiry_date', futureString)
        .gt('quantity', 0)
        .order('expiry_date', { ascending: true });
        
      console.log('PASO 4 - Con cantidad > 0:', { step4, error4, count: step4?.length });

      // 3. Consulta mejorada para productos por vencer (USAR PASO 4 PARA AHORA)
      let expiringData = step4;
      let expiringError = error4;

      // 4. Si tenemos datos, obtener los nombres de productos por separado
      let finalExpiringProducts: any[] = [];
      
      if (expiringData && expiringData.length > 0) {
        console.log('✅ Encontramos lotes por vencer, obteniendo nombres de productos...');
        
        // Obtener IDs únicos de productos
        const productIds = [...new Set(expiringData.map(lot => lot.product_id))];
        console.log('🔍 Product IDs a buscar:', productIds);
        
        // Obtener información de productos
        const { data: productsInfo, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
          
        console.log('🏷️ Información de productos obtenida:', { productsInfo, productsError });

        // Combinar datos
        finalExpiringProducts = expiringData.map((lot: any) => ({
          ...lot,
          products: {
            name: productsInfo?.find((p: any) => p.id === lot.product_id)?.name || `Producto ID: ${lot.product_id}`
          }
        }));
        
        console.log('🎯 PRODUCTOS FINALES POR VENCER:', finalExpiringProducts);
      } else {
        console.log('❌ No se encontraron lotes en el rango de fechas');
      }

      // 5. Debug final
      console.log('✅ Productos por vencer finales:', finalExpiringProducts);

      // Fetch total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Count low stock products
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 10);

      // Count expiring lots (usando la misma lógica mejorada)
      const { count: expiringCount } = await supabase
        .from('product_lots')
        .select('*', { count: 'exact', head: true })
        .not('expiry_date', 'is', null)
        .gte('expiry_date', todayString)
        .lte('expiry_date', futureString)
        .gt('quantity', 0);

      console.log('📊 Stats calculadas:', {
        dailySales: dailySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        monthlySales: monthlySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        lowStock: lowStockCount,
        expiring: expiringCount,
        expiringProductsFound: finalExpiringProducts.length
      });

      setStats({
        dailySales: dailySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        monthlySales: monthlySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0,
        lowStockProducts: lowStockCount || 0,
        expiringSoonProducts: expiringCount || 0,
        totalCustomers: customersCount || 0,
        totalProducts: productsCount || 0,
      });

      setLowStockProducts(lowStockData || []);
      setExpiringSoonProducts(finalExpiringProducts || []);
      
    } catch (error) {
      console.error('💥 Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.log('Error formateando fecha:', dateString);
      return 'Fecha inválida';
    }
  };

  // **FUNCIÓN DE DEBUG MEJORADA PARA VERIFICAR DATOS**
  const debugExpiringProducts = async () => {
    console.log('🔍 INICIANDO DEBUG DETALLADO DE PRODUCTOS POR VENCER...');
    
    // Obtener fecha actual y futura
    const todayDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(todayDate.getDate() + 30);
    
    const todayString = todayDate.toISOString().split('T')[0];
    const futureString = futureDate.toISOString().split('T')[0];
    
    console.log('📅 Fechas de búsqueda:', {
      hoy: todayString,
      futuro: futureString,
      rangoEnTexto: `Del ${todayString} al ${futureString}`
    });
    
    // Verificar TODOS los product_lots
    const { data: allLots } = await supabase
      .from('product_lots')
      .select('*')
      .order('expiry_date', { ascending: true });
    
    console.log('📋 TODOS los lotes en BD:', allLots);
    
    // Verificar lotes en el rango de fechas
    const { data: lotsInRange } = await supabase
      .from('product_lots')
      .select('*')
      .gte('expiry_date', todayString)
      .lte('expiry_date', futureString)
      .order('expiry_date', { ascending: true });
      
    console.log('📦 Lotes en rango de 30 días:', lotsInRange);
    
    // Verificar sin filtro de cantidad
    const { data: lotsInRangeNoQtyFilter } = await supabase
      .from('product_lots')
      .select('*')
      .not('expiry_date', 'is', null)
      .gte('expiry_date', todayString)
      .lte('expiry_date', futureString)
      .order('expiry_date', { ascending: true });
      
    console.log('📦 Lotes en rango SIN filtro de cantidad:', lotsInRangeNoQtyFilter);
    
    // Verificar productos
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    console.log('🏷️ Muestra de productos:', products);
    
    // Consulta con JOIN como en el código principal
    const { data: withJoin, error: joinError } = await supabase
      .from('product_lots')
      .select(`
        id, 
        lot_number, 
        expiry_date, 
        quantity,
        product_id,
        products!inner (
          id,
          name
        )
      `)
      .not('expiry_date', 'is', null)
      .gte('expiry_date', todayString)
      .lte('expiry_date', futureString)
      .gt('quantity', 0)
      .order('expiry_date', { ascending: true });
      
    console.log('🔗 Consulta con JOIN:', { withJoin, joinError });
  };

  // Agregar botón de debug (temporal)
  useEffect(() => {
    // Ejecutar debug automáticamente en desarrollo
    if (process.env.NODE_ENV === 'development') {
      debugExpiringProducts();
    }
  }, []);

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
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product: any, index: number) => (
                <div key={product?.id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product?.name || 'Producto sin nombre'}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {product?.stock_quantity || 0} unidades (Mín: {product?.min_stock || 0})
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                    Bajo Stock
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay productos con stock bajo</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Productos Por Vencer (30 días)</h3>
            {/* Botón de debug temporal */}
            <button 
              onClick={debugExpiringProducts}
              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              Debug
            </button>
          </div>
          <div className="space-y-3">
            {expiringSoonProducts && expiringSoonProducts.length > 0 ? (
              expiringSoonProducts.map((lot: any, index: number) => (
                <div key={lot?.id || index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {lot?.products?.name || `Producto ID: ${lot?.product_id || 'N/A'}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Lote: {lot?.lot_number || 'N/A'} | 
                      Vence: {formatDate(lot?.expiry_date)} | 
                      Cantidad: {lot?.quantity || 'N/A'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                    Por Vencer
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay productos por vencer próximamente</p>
                <p className="text-xs mt-1">
                  Revisa los logs de consola para más información
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}