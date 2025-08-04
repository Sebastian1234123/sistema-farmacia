import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Truck, FileText, DollarSign, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  contact_person: string;
  is_active: boolean;
}

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  status: string;
  order_date: string;
  expected_delivery: string;
  notes: string;
}

interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SupplierInvoice {
  id: number;
  invoice_number: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

export function PurchaseList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    contact_person: ''
  });

  const [orderForm, setOrderForm] = useState({
    supplier_id: '',
    expected_delivery: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (suppliersError) throw suppliersError;
      setSuppliers(suppliersData || []);

      // Load purchase orders with supplier names
      const { data: ordersData, error: ordersError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers!inner(name)
        `)
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;
      setPurchaseOrders(ordersData?.map(order => ({
        ...order,
        supplier_name: order.suppliers.name
      })) || []);

      // Load supplier invoices with supplier names
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('supplier_invoices')
        .select(`
          *,
          suppliers!inner(name)
        `)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;
      setSupplierInvoices(invoicesData?.map(invoice => ({
        ...invoice,
        supplier_name: invoice.suppliers.name
      })) || []);

      // Load products for order items
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, current_stock')
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: number) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          products!inner(name)
        `)
        .eq('purchase_order_id', orderId);

      if (error) throw error;
      setOrderItems(data?.map(item => ({
        ...item,
        product_name: item.products.name
      })) || []);
    } catch (error: any) {
      toast.error('Error al cargar items: ' + error.message);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierForm])
        .select()
        .single();

      if (error) throw error;

      toast.success('Proveedor creado exitosamente');
      setShowSupplierModal(false);
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        contact_person: ''
      });
      loadData();
    } catch (error: any) {
      toast.error('Error al crear proveedor: ' + error.message);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderNumber = `PO-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([{
          ...orderForm,
          order_number: orderNumber,
          order_date: new Date().toISOString(),
          status: 'pending',
          total_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Orden de compra creada exitosamente');
      setShowOrderModal(false);
      setOrderForm({
        supplier_id: '',
        expected_delivery: '',
        notes: ''
      });
      loadData();
    } catch (error: any) {
      toast.error('Error al crear orden: ' + error.message);
    }
  };

  const deleteSupplier = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Proveedor eliminado exitosamente');
      loadData();
    } catch (error: any) {
      toast.error('Error al eliminar proveedor: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'received': return 'Recibida';
      case 'cancelled': return 'Cancelada';
      default: return status;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Compras</h1>
          <p className="text-gray-600">Administra proveedores, órdenes de compra y facturas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Package className="w-4 h-4" />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Órdenes de Compra
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Facturas de Proveedores
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {purchaseOrders
            .filter(order => 
              order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{order.order_number}</h3>
                    <p className="text-gray-600">Proveedor: {order.supplier_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        loadOrderItems(order.id);
                        setShowOrderDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers
            .filter(supplier => 
              supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                  </div>
                  <button
                    onClick={() => deleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.address}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {supplierInvoices
            .filter(invoice => 
              invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                    <p className="text-gray-600">Proveedor: {invoice.supplier_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${invoice.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Proveedor</h2>
            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({...supplierForm, contact_person: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  type="text"
                  value={supplierForm.tax_id}
                  onChange={(e) => setSupplierForm({...supplierForm, tax_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Crear Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Orden de Compra</h2>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <select
                  required
                  value={orderForm.supplier_id}
                  onChange={(e) => setOrderForm({...orderForm, supplier_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Entrega Esperada
                </label>
                <input
                  type="date"
                  required
                  value={orderForm.expected_delivery}
                  onChange={(e) => setOrderForm({...orderForm, expected_delivery: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Orden
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles de Orden - {selectedOrder.order_number}</h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Proveedor</p>
                <p className="font-medium">{selectedOrder.supplier_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Orden</p>
                <p className="font-medium">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entrega Esperada</p>
                <p className="font-medium">{new Date(selectedOrder.expected_delivery).toLocaleDateString()}</p>
              </div>
            </div>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay items en esta orden</p>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Items de la Orden</h3>
                {orderItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.unit_price.toFixed(2)} c/u</p>
                        <p className="text-sm text-gray-600">Total: ${item.total_price.toFixed(2)}</p>
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