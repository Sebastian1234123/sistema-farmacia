/*
  # Datos de Ejemplo para Sistema de Farmacia

  1. Datos de Muestra
    - Usuarios del sistema
    - Proveedores
    - Clientes
    - Productos farmacéuticos
    - Lotes de productos
    - Ventas de ejemplo

  2. Configuración Inicial
    - Usuario administrador por defecto
    - Productos básicos de farmacia
    - Clientes de prueba
*/

-- Insertar usuarios de ejemplo (estos se crearán después de que el usuario se registre en Supabase Auth)
-- El trigger automáticamente creará el perfil cuando se registre un usuario

-- Insertar proveedores de ejemplo
INSERT INTO suppliers (name, ruc, contact_name, phone, email, address) VALUES
('Laboratorios Bayer S.A.', '20123456789', 'Carlos Mendoza', '+51-1-234-5678', 'ventas@bayer.pe', 'Av. Javier Prado Este 4200, San Isidro, Lima'),
('Pfizer Perú S.A.', '20987654321', 'Ana García', '+51-1-987-6543', 'contacto@pfizer.pe', 'Av. El Derby 254, Santiago de Surco, Lima'),
('Laboratorios AC Farma S.A.', '20456789123', 'Miguel Torres', '+51-1-456-7890', 'ventas@acfarma.pe', 'Av. Argentina 3093, Callao, Lima'),
('Droguería Alfaro S.A.', '20789123456', 'Laura Vásquez', '+51-1-789-1234', 'pedidos@alfaro.pe', 'Jr. Huancavelica 1234, Lima Centro, Lima')
ON CONFLICT (ruc) DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO customers (document_number, document_type, full_name, email, phone, address, birth_date) VALUES
('12345678', 'dni', 'María González Pérez', 'maria.gonzalez@email.com', '+51-987-654-321', 'Av. Los Olivos 123, San Martín de Porres', '1985-03-15'),
('87654321', 'dni', 'Juan Carlos Rodríguez', 'juan.rodriguez@email.com', '+51-912-345-678', 'Jr. Las Flores 456, Breña', '1978-11-22'),
('11223344', 'dni', 'Ana Lucía Fernández', 'ana.fernandez@email.com', '+51-998-877-665', 'Av. Universitaria 789, Los Olivos', '1992-07-08'),
('44332211', 'dni', 'Carlos Alberto Mendoza', 'carlos.mendoza@email.com', '+51-955-443-322', 'Calle Los Pinos 321, San Juan de Lurigancho', '1965-12-03'),
('55667788', 'dni', 'Rosa Elena Vargas', 'rosa.vargas@email.com', '+51-966-554-433', 'Av. Túpac Amaru 654, Independencia', '1990-04-18')
ON CONFLICT (document_number) DO NOTHING;

-- Insertar productos farmacéuticos de ejemplo
INSERT INTO products (code, name, active_ingredient, laboratory, category, price, cost, stock_quantity, min_stock, requires_prescription) VALUES
('MED001', 'Paracetamol 500mg x 20 tabletas', 'Paracetamol', 'Laboratorios Bayer', 'generic', 8.50, 5.20, 150, 20, false),
('MED002', 'Ibuprofeno 400mg x 10 tabletas', 'Ibuprofeno', 'Pfizer Perú', 'brand', 12.80, 8.50, 80, 15, false),
('MED003', 'Amoxicilina 500mg x 12 cápsulas', 'Amoxicilina', 'AC Farma', 'generic', 18.90, 12.30, 45, 10, true),
('MED004', 'Loratadina 10mg x 10 tabletas', 'Loratadina', 'Bayer', 'otc', 15.60, 9.80, 120, 25, false),
('MED005', 'Omeprazol 20mg x 14 cápsulas', 'Omeprazol', 'Pfizer Perú', 'generic', 22.40, 14.70, 65, 12, false),
('MED006', 'Diclofenaco Gel 30g', 'Diclofenaco', 'AC Farma', 'otc', 16.80, 11.20, 90, 18, false),
('MED007', 'Clonazepam 2mg x 30 tabletas', 'Clonazepam', 'Pfizer Perú', 'controlled', 35.50, 22.80, 25, 5, true),
('MED008', 'Vitamina C 1000mg x 30 tabletas', 'Ácido Ascórbico', 'Bayer', 'otc', 28.90, 18.50, 200, 30, false),
('MED009', 'Acetaminofén Jarabe 120ml', 'Paracetamol', 'AC Farma', 'generic', 14.20, 9.10, 75, 15, false),
('MED010', 'Alcohol Medicinal 250ml', 'Alcohol Etílico', 'Droguería Alfaro', 'otc', 6.50, 3.80, 300, 50, false),
('MED011', 'Gasas Estériles 10x10cm x 10 unidades', 'Gasa de Algodón', 'Droguería Alfaro', 'otc', 8.90, 5.40, 180, 25, false),
('MED012', 'Suero Fisiológico 500ml', 'Cloruro de Sodio', 'AC Farma', 'otc', 12.30, 7.80, 95, 20, false),
('MED013', 'Metformina 850mg x 30 tabletas', 'Metformina', 'Bayer', 'generic', 24.60, 16.20, 55, 10, true),
('MED014', 'Enalapril 10mg x 30 tabletas', 'Enalapril', 'Pfizer Perú', 'generic', 19.80, 12.90, 70, 12, true),
('MED015', 'Simvastatina 20mg x 30 tabletas', 'Simvastatina', 'AC Farma', 'generic', 32.40, 21.10, 40, 8, true)
ON CONFLICT (code) DO NOTHING;

-- Insertar lotes de productos
INSERT INTO product_lots (product_id, lot_number, expiry_date, quantity, cost) 
SELECT 
    p.id,
    'LOTE' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    CURRENT_DATE + INTERVAL '18 months' + (RANDOM() * INTERVAL '12 months'),
    FLOOR(RANDOM() * 100) + 50,
    p.cost
FROM products p
ON CONFLICT (product_id, lot_number) DO NOTHING;

-- Insertar algunas ventas de ejemplo
DO $$
DECLARE
    customer_ids uuid[];
    product_ids uuid[];
    user_id uuid;
    sale_id uuid;
    i integer;
BEGIN
    -- Obtener IDs de clientes y productos
    SELECT ARRAY(SELECT id FROM customers LIMIT 5) INTO customer_ids;
    SELECT ARRAY(SELECT id FROM products LIMIT 10) INTO product_ids;
    
    -- Crear algunas ventas de ejemplo solo si hay un usuario autenticado
    SELECT id INTO user_id FROM users LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        FOR i IN 1..10 LOOP
            INSERT INTO sales (customer_id, user_id, subtotal, tax, total, payment_method, status)
            VALUES (
                customer_ids[1 + (i % array_length(customer_ids, 1))],
                user_id,
                ROUND((RANDOM() * 200 + 50)::numeric, 2),
                ROUND((RANDOM() * 36 + 9)::numeric, 2),
                ROUND((RANDOM() * 236 + 59)::numeric, 2),
                CASE WHEN RANDOM() < 0.5 THEN 'cash' ELSE 'card' END,
                'completed'
            ) RETURNING id INTO sale_id;
            
            -- Insertar items de venta
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
            SELECT 
                sale_id,
                product_ids[1 + (j % array_length(product_ids, 1))],
                FLOOR(RANDOM() * 3) + 1,
                p.price,
                p.price * (FLOOR(RANDOM() * 3) + 1)
            FROM generate_series(1, FLOOR(RANDOM() * 3) + 1) j
            JOIN products p ON p.id = product_ids[1 + (j % array_length(product_ids, 1))];
        END LOOP;
    END IF;
END $$;