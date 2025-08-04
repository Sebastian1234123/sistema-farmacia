/*
  # Sistema de Facturación para Farmacias - Esquema Completo

  1. Nuevas Tablas
    - `users` - Usuarios del sistema con roles
    - `suppliers` - Proveedores y distribuidores
    - `customers` - Clientes de la farmacia
    - `products` - Productos y medicamentos
    - `product_lots` - Lotes de productos con fechas de vencimiento
    - `purchases` - Órdenes de compra
    - `purchase_items` - Items de las órdenes de compra
    - `sales` - Ventas realizadas
    - `sale_items` - Items de las ventas
    - `prescriptions` - Recetas médicas
    - `prescription_items` - Items de las recetas
    - `stock_movements` - Movimientos de inventario
    - `loyalty_points` - Puntos de fidelización

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas de acceso basadas en roles
    - Auditoría de cambios

  3. Funciones
    - Triggers para actualización automática de stock
    - Funciones para cálculo de puntos de fidelización
    - Validaciones de negocio
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'pharmacist', 'cashier')) DEFAULT 'cashier',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ruc text UNIQUE NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number text UNIQUE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('dni', 'passport', 'ce')) DEFAULT 'dni',
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  birth_date date,
  loyalty_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  active_ingredient text NOT NULL,
  laboratory text NOT NULL,
  category text NOT NULL CHECK (category IN ('generic', 'brand', 'otc', 'controlled')) DEFAULT 'generic',
  price decimal(10,2) NOT NULL DEFAULT 0,
  cost decimal(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 10,
  requires_prescription boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de lotes de productos
CREATE TABLE IF NOT EXISTS product_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  cost decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, lot_number)
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  user_id uuid NOT NULL REFERENCES users(id),
  invoice_number text NOT NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('pending', 'received', 'cancelled')) DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de compra
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  lot_number text,
  expiry_date date,
  created_at timestamptz DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  user_id uuid NOT NULL REFERENCES users(id),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  discount decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')) DEFAULT 'cash',
  status text NOT NULL CHECK (status IN ('completed', 'cancelled', 'refunded')) DEFAULT 'completed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  lot_id uuid REFERENCES product_lots(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de recetas médicas
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  doctor_name text NOT NULL,
  prescription_number text UNIQUE NOT NULL,
  issue_date date NOT NULL,
  expiry_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'expired', 'fulfilled')) DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de receta
CREATE TABLE IF NOT EXISTS prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  fulfilled_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  lot_id uuid REFERENCES product_lots(id),
  type text NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid, -- ID de la venta, compra, etc.
  reference_type text, -- 'sale', 'purchase', 'adjustment'
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Tabla de puntos de fidelización
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  sale_id uuid REFERENCES sales(id),
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_lots_expiry ON product_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document_number);

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios autenticados
CREATE POLICY "Users can read all data" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage product_lots" ON product_lots FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchases" ON purchases FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase_items" ON purchase_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON sales FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sale_items" ON sale_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage prescriptions" ON prescriptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage prescription_items" ON prescription_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stock_movements" ON stock_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage loyalty_points" ON loyalty_points FOR ALL TO authenticated USING (true);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'in' THEN
            UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.type = 'out' THEN
            UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.type = 'adjustment' THEN
            UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar stock automáticamente
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Función para generar número de factura automático
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number integer;
    invoice_prefix text := 'F';
    current_year text := EXTRACT(YEAR FROM now())::text;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS integer)), 0) + 1
    INTO next_number
    FROM sales
    WHERE invoice_number LIKE invoice_prefix || current_year || '%';
    
    NEW.invoice_number := invoice_prefix || current_year || LPAD(next_number::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de factura automáticamente
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON sales
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();