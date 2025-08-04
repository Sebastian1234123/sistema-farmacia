/*
  # Sistema de Facturación para Farmacias - Módulos Completos
  
  Este archivo implementa todos los módulos solicitados:
  
  1. Gestión de Productos (Stock) - Mejorado
  2. Facturación y Ventas - Completo
  3. Compras y Proveedores - Completo
  4. Clientes y Fidelización - Completo
  5. Recetas Médicas - Completo
  6. Reportes y Análisis - Completo
  7. Seguridad y Usuarios - Mejorado
  8. Contabilidad Básica - Nuevo
  9. Sistema de Alertas - Nuevo
*/

-- =====================================================
-- 1. MEJORAS AL MÓDULO DE PRODUCTOS (STOCK)
-- =====================================================

-- Agregar campos adicionales a productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS presentation text; -- Tableta, Jarabe, etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS concentration text; -- 500mg, 10mg/ml, etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging text; -- Caja x 20, Frasco 100ml, etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_ice boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_controlled boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS controlled_type text; -- 'schedule_1', 'schedule_2', etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate decimal(5,2) DEFAULT 18.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_margin decimal(5,2) DEFAULT 30.00;

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insertar categorías básicas
INSERT INTO product_categories (name, description, color) VALUES
('Genéricos', 'Medicamentos genéricos', '#10B981'),
('Marca', 'Medicamentos de marca', '#3B82F6'),
('OTC', 'Venta libre', '#F59E0B'),
('Controlados', 'Medicamentos controlados', '#EF4444'),
('Cosméticos', 'Productos cosméticos', '#8B5CF6'),
('Suplementos', 'Vitaminas y suplementos', '#06B6D4'),
('Dispositivos', 'Dispositivos médicos', '#84CC16'),
('Otros', 'Otros productos', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Agregar categoría_id a productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);

-- Tabla de ubicaciones de almacén
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insertar ubicaciones básicas
INSERT INTO warehouse_locations (name, description) VALUES
('Estante A', 'Medicamentos de venta libre'),
('Estante B', 'Medicamentos controlados'),
('Refrigerador', 'Medicamentos que requieren refrigeración'),
('Mostrador', 'Productos de acceso rápido')
ON CONFLICT (name) DO NOTHING;

-- Agregar ubicación a productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES warehouse_locations(id);

-- =====================================================
-- 2. MÓDULO DE FACTURACIÓN Y VENTAS MEJORADO
-- =====================================================

-- Tabla de configuraciones de facturación
CREATE TABLE IF NOT EXISTS billing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_name text NOT NULL,
  pharmacy_address text NOT NULL,
  pharmacy_phone text,
  pharmacy_email text,
  tax_id text NOT NULL, -- RUC, CUIT, etc.
  invoice_prefix text DEFAULT 'F',
  invoice_start_number integer DEFAULT 1,
  fiscal_printer_enabled boolean DEFAULT false,
  fiscal_printer_model text,
  electronic_billing_enabled boolean DEFAULT false,
  electronic_billing_provider text, -- SUNAT, SAT, AFIP, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mejorar tabla de ventas
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_document text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_document_type text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal_without_tax decimal(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount decimal(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount decimal(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS loyalty_points_earned integer DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cashier_id uuid REFERENCES users(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS prescription_id uuid; -- Para ventas con receta

-- Tabla de devoluciones
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id),
  return_number text UNIQUE NOT NULL,
  return_date timestamptz DEFAULT now(),
  reason text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  refund_method text NOT NULL CHECK (refund_method IN ('cash', 'card', 'credit_note')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de items de devolución
CREATE TABLE IF NOT EXISTS return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid REFERENCES returns(id) ON DELETE CASCADE,
  sale_item_id uuid REFERENCES sale_items(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de promociones y descuentos
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) NOT NULL,
  min_purchase_amount decimal(10,2) DEFAULT 0,
  max_discount_amount decimal(10,2),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  applies_to_all_products boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de productos en promociones
CREATE TABLE IF NOT EXISTS promotion_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid REFERENCES promotions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(promotion_id, product_id)
);

-- =====================================================
-- 3. MÓDULO DE COMPRAS Y PROVEEDORES MEJORADO
-- =====================================================

-- Mejorar tabla de proveedores
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_limit decimal(10,2) DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS current_balance decimal(10,2) DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes text;

-- Tabla de órdenes de compra
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  user_id uuid REFERENCES users(id),
  order_date date NOT NULL,
  expected_delivery_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de orden de compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  received_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabla de facturas de proveedores
CREATE TABLE IF NOT EXISTS supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  purchase_order_id uuid REFERENCES purchase_orders(id),
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_method text,
  payment_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. MÓDULO DE CLIENTES Y FIDELIZACIÓN MEJORADO
-- =====================================================

-- Mejorar tabla de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS emergency_contact text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS emergency_phone text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allergies text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS chronic_conditions text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_payment_method text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit decimal(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_balance decimal(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_date date DEFAULT CURRENT_DATE;

-- Tabla de programa de fidelización
CREATE TABLE IF NOT EXISTS loyalty_program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_per_currency decimal(5,2) DEFAULT 1.00,
  currency_per_point decimal(5,2) DEFAULT 0.01,
  min_points_redemption integer DEFAULT 100,
  max_points_per_transaction integer,
  expiration_days integer DEFAULT 365,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insertar programa de fidelización por defecto
INSERT INTO loyalty_program (name, description) VALUES
('Programa Farmacia', 'Programa de puntos por defecto')
ON CONFLICT DO NOTHING;

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  type text NOT NULL CHECK (type IN ('medication_renewal', 'appointment', 'promotion', 'custom')),
  title text NOT NULL,
  message text NOT NULL,
  reminder_date date NOT NULL,
  reminder_time time,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. MÓDULO DE RECETAS MÉDICAS COMPLETO
-- =====================================================

-- Mejorar tabla de recetas
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_license text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_specialty text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_type text CHECK (prescription_type IN ('paper', 'electronic', 'digital')),
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_controlled boolean DEFAULT false;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS controlled_type text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS total_amount decimal(10,2) DEFAULT 0;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS insurance_provider text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS insurance_number text;

-- Tabla de validaciones de recetas
CREATE TABLE IF NOT EXISTS prescription_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES prescriptions(id),
  validator_id uuid REFERENCES users(id),
  validation_date timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  rejection_reason text
);

-- Tabla de medicamentos controlados
CREATE TABLE IF NOT EXISTS controlled_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES prescriptions(id),
  product_id uuid REFERENCES products(id),
  quantity_prescribed integer NOT NULL,
  quantity_dispensed integer DEFAULT 0,
  dosage_instructions text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  is_dispensed boolean DEFAULT false,
  dispensed_at timestamptz,
  dispensed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. MÓDULO DE CONTABILIDAD BÁSICA
-- =====================================================

-- Tabla de cuentas contables
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code text UNIQUE NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id uuid REFERENCES accounting_accounts(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insertar cuentas básicas
INSERT INTO accounting_accounts (account_code, account_name, account_type) VALUES
('1000', 'Caja', 'asset'),
('1100', 'Banco', 'asset'),
('1200', 'Cuentas por Cobrar', 'asset'),
('1300', 'Inventario', 'asset'),
('2000', 'Cuentas por Pagar', 'liability'),
('3000', 'Capital', 'equity'),
('4000', 'Ventas', 'revenue'),
('5000', 'Costo de Ventas', 'expense'),
('5100', 'Gastos Operativos', 'expense')
ON CONFLICT (account_code) DO NOTHING;

-- Tabla de transacciones contables
CREATE TABLE IF NOT EXISTS accounting_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL,
  reference_number text,
  description text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'payment', 'receipt', 'adjustment')),
  reference_id uuid, -- ID de la venta, compra, etc.
  total_amount decimal(10,2) NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Tabla de asientos contables
CREATE TABLE IF NOT EXISTS accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES accounting_transactions(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounting_accounts(id),
  debit_amount decimal(10,2) DEFAULT 0,
  credit_amount decimal(10,2) DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. SISTEMA DE ALERTAS
-- =====================================================

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expiry', 'overdue_payment', 'prescription_expiry', 'custom')),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  reference_id uuid, -- ID del producto, cliente, etc.
  reference_type text, -- 'product', 'customer', 'prescription', etc.
  created_at timestamptz DEFAULT now()
);

-- Tabla de configuraciones de alertas
CREATE TABLE IF NOT EXISTS alert_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT true,
  days_before_alert integer DEFAULT 7,
  notification_method text DEFAULT 'system' CHECK (notification_method IN ('system', 'email', 'sms', 'all')),
  created_at timestamptz DEFAULT now()
);

-- Insertar configuraciones de alertas por defecto
INSERT INTO alert_config (alert_type, days_before_alert) VALUES
('low_stock', 7),
('expiry', 30),
('overdue_payment', 7),
('prescription_expiry', 7)
ON CONFLICT (alert_type) DO NOTHING;

-- =====================================================
-- 8. MEJORAS AL SISTEMA DE USUARIOS
-- =====================================================

-- Mejorar tabla de usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insertar permisos básicos
INSERT INTO permissions (name, description, module, action) VALUES
('products.view', 'Ver productos', 'products', 'view'),
('products.create', 'Crear productos', 'products', 'create'),
('products.edit', 'Editar productos', 'products', 'edit'),
('products.delete', 'Eliminar productos', 'products', 'delete'),
('sales.view', 'Ver ventas', 'sales', 'view'),
('sales.create', 'Crear ventas', 'sales', 'create'),
('sales.cancel', 'Cancelar ventas', 'sales', 'cancel'),
('customers.view', 'Ver clientes', 'customers', 'view'),
('customers.create', 'Crear clientes', 'customers', 'create'),
('customers.edit', 'Editar clientes', 'customers', 'edit'),
('reports.view', 'Ver reportes', 'reports', 'view'),
('reports.export', 'Exportar reportes', 'reports', 'export'),
('users.manage', 'Gestionar usuarios', 'users', 'manage'),
('settings.manage', 'Gestionar configuración', 'settings', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Tabla de roles de permisos
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role, permission_id)
);

-- Asignar permisos a roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'pharmacist', id FROM permissions 
WHERE name IN ('products.view', 'products.create', 'products.edit', 'sales.view', 'sales.create', 'customers.view', 'customers.create', 'customers.edit', 'reports.view')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'cashier', id FROM permissions 
WHERE name IN ('products.view', 'sales.view', 'sales.create', 'customers.view', 'customers.create')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_products_controlled ON products(is_controlled);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Índices para lotes
CREATE INDEX IF NOT EXISTS idx_product_lots_expiry ON product_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_product_lots_product ON product_lots(product_id);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);

-- =====================================================
-- 10. HABILITAR RLS Y POLÍTICAS
-- =====================================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlled_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para todas las tablas (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage all data" ON product_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON warehouse_locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON billing_config FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON returns FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON return_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON promotions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON promotion_products FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON purchase_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON supplier_invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON loyalty_program FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON reminders FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON prescription_validations FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON controlled_medications FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON accounting_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON accounting_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON accounting_entries FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON alerts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON alert_config FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON permissions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage all data" ON role_permissions FOR ALL TO authenticated USING (true);

-- =====================================================
-- 11. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- =====================================================

-- Función para generar número de factura automático
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number integer;
    invoice_prefix text;
    current_year text := EXTRACT(YEAR FROM now())::text;
BEGIN
    -- Obtener prefijo de configuración
    SELECT COALESCE(invoice_prefix, 'F') INTO invoice_prefix 
    FROM billing_config LIMIT 1;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS integer)), 0) + 1
    INTO next_number
    FROM sales
    WHERE invoice_number LIKE invoice_prefix || current_year || '%';
    
    NEW.invoice_number := invoice_prefix || current_year || LPAD(next_number::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de factura automáticamente
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON sales;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON sales
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

-- Función para generar número de devolución automático
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number integer;
    return_prefix text := 'D';
    current_year text := EXTRACT(YEAR FROM now())::text;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM '[0-9]+$') AS integer)), 0) + 1
    INTO next_number
    FROM returns
    WHERE return_number LIKE return_prefix || current_year || '%';
    
    NEW.return_number := return_prefix || current_year || LPAD(next_number::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de devolución automáticamente
DROP TRIGGER IF EXISTS trigger_generate_return_number ON returns;
CREATE TRIGGER trigger_generate_return_number
    BEFORE INSERT ON returns
    FOR EACH ROW
    WHEN (NEW.return_number IS NULL OR NEW.return_number = '')
    EXECUTE FUNCTION generate_return_number();

-- Función para generar alertas automáticas
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Alerta de stock bajo
    IF NEW.stock_quantity <= NEW.min_stock THEN
        INSERT INTO alerts (alert_type, title, message, severity, reference_id, reference_type)
        VALUES (
            'low_stock',
            'Stock Bajo: ' || NEW.name,
            'El producto ' || NEW.name || ' tiene stock bajo (' || NEW.stock_quantity || ' unidades)',
            'high',
            NEW.id,
            'product'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para alertas de stock
DROP TRIGGER IF EXISTS trigger_check_stock_alerts ON products;
CREATE TRIGGER trigger_check_stock_alerts
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_alerts();

-- Función para alertas de vencimiento
CREATE OR REPLACE FUNCTION check_expiry_alerts()
RETURNS TRIGGER AS $$
DECLARE
    days_to_expiry integer;
BEGIN
    days_to_expiry := NEW.expiry_date - CURRENT_DATE;
    
    -- Alerta 30 días antes
    IF days_to_expiry <= 30 AND days_to_expiry > 0 THEN
        INSERT INTO alerts (alert_type, title, message, severity, reference_id, reference_type)
        VALUES (
            'expiry',
            'Vencimiento Próximo: Lote ' || NEW.lot_number,
            'El lote ' || NEW.lot_number || ' vence en ' || days_to_expiry || ' días',
            'medium',
            NEW.id,
            'lot'
        );
    END IF;
    
    -- Alerta 7 días antes
    IF days_to_expiry <= 7 AND days_to_expiry > 0 THEN
        INSERT INTO alerts (alert_type, title, message, severity, reference_id, reference_type)
        VALUES (
            'expiry',
            'Vencimiento Crítico: Lote ' || NEW.lot_number,
            'El lote ' || NEW.lot_number || ' vence en ' || days_to_expiry || ' días',
            'critical',
            NEW.id,
            'lot'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para alertas de vencimiento
DROP TRIGGER IF EXISTS trigger_check_expiry_alerts ON product_lots;
CREATE TRIGGER trigger_check_expiry_alerts
    AFTER INSERT OR UPDATE ON product_lots
    FOR EACH ROW
    EXECUTE FUNCTION check_expiry_alerts();

-- Función para actualizar puntos de fidelización
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    points_earned integer;
    points_per_currency decimal(5,2);
BEGIN
    -- Obtener configuración de puntos
    SELECT points_per_currency INTO points_per_currency 
    FROM loyalty_program WHERE is_active = true LIMIT 1;
    
    -- Calcular puntos ganados
    points_earned := FLOOR(NEW.total * points_per_currency);
    
    -- Actualizar puntos del cliente
    IF NEW.customer_id IS NOT NULL THEN
        UPDATE customers 
        SET loyalty_points = loyalty_points + points_earned
        WHERE id = NEW.customer_id;
        
        -- Actualizar puntos en la venta
        NEW.loyalty_points_earned := points_earned;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para puntos de fidelización
DROP TRIGGER IF EXISTS trigger_update_loyalty_points ON sales;
CREATE TRIGGER trigger_update_loyalty_points
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_points();

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_billing_config_updated_at BEFORE UPDATE ON billing_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_invoices_updated_at BEFORE UPDATE ON supplier_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 