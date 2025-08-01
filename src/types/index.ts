export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pharmacist' | 'cashier';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  active_ingredient: string;
  laboratory: string;
  category: 'generic' | 'brand' | 'otc' | 'controlled';
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock: number;
  requires_prescription: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductLot {
  id: string;
  product_id: string;
  lot_number: string;
  expiry_date: string;
  quantity: number;
  cost: number;
  created_at: string;
}

export interface Customer {
  id: string;
  document_number: string;
  document_type: 'dni' | 'passport' | 'ce';
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_id?: string;
  user_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  lot_id?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  user_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  customer_id: string;
  doctor_name: string;
  prescription_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'fulfilled';
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  product_id: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  lot_id?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  user_id: string;
  created_at: string;
}

export interface DashboardStats {
  dailySales: number;
  monthlySales: number;
  lowStockProducts: number;
  expiringSoonProducts: number;
  totalCustomers: number;
  totalProducts: number;
}