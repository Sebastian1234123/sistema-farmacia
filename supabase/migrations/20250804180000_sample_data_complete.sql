/*
  # Datos de Ejemplo Completos para Sistema de Farmacia
  
  Este archivo inserta datos de ejemplo para todos los módulos:
  
  1. Configuración de facturación
  2. Productos mejorados con categorías
  3. Promociones y descuentos
  4. Órdenes de compra
  5. Facturas de proveedores
  6. Recordatorios
  7. Alertas de ejemplo
  8. Configuración contable
*/

-- =====================================================
-- 1. CONFIGURACIÓN DE FACTURACIÓN
-- =====================================================

INSERT INTO billing_config (
  pharmacy_name,
  pharmacy_address,
  pharmacy_phone,
  pharmacy_email,
  tax_id,
  invoice_prefix,
  invoice_start_number,
  electronic_billing_enabled,
  electronic_billing_provider
) VALUES (
  'Farmacia Central',
  'Av. Principal 123, Centro Comercial, Lima',
  '+51-1-234-5678',
  'ventas@farmaciacentral.com',
  '20123456789',
  'F',
  1,
  true,
  'SUNAT'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. PRODUCTOS MEJORADOS CON CATEGORÍAS
-- =====================================================

-- Obtener IDs de categorías
DO $$
DECLARE
    generic_id uuid;
    brand_id uuid;
    otc_id uuid;
    controlled_id uuid;
    cosmetic_id uuid;
    supplement_id uuid;
    device_id uuid;
    other_id uuid;
    
    estante_a_id uuid;
    estante_b_id uuid;
    refrigerador_id uuid;
    mostrador_id uuid;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO generic_id FROM product_categories WHERE name = 'Genéricos';
    SELECT id INTO brand_id FROM product_categories WHERE name = 'Marca';
    SELECT id INTO otc_id FROM product_categories WHERE name = 'OTC';
    SELECT id INTO controlled_id FROM product_categories WHERE name = 'Controlados';
    SELECT id INTO cosmetic_id FROM product_categories WHERE name = 'Cosméticos';
    SELECT id INTO supplement_id FROM product_categories WHERE name = 'Suplementos';
    SELECT id INTO device_id FROM product_categories WHERE name = 'Dispositivos';
    SELECT id INTO other_id FROM product_categories WHERE name = 'Otros';
    
    -- Obtener IDs de ubicaciones
    SELECT id INTO estante_a_id FROM warehouse_locations WHERE name = 'Estante A';
    SELECT id INTO estante_b_id FROM warehouse_locations WHERE name = 'Estante B';
    SELECT id INTO refrigerador_id FROM warehouse_locations WHERE name = 'Refrigerador';
    SELECT id INTO mostrador_id FROM warehouse_locations WHERE name = 'Mostrador';
    
    -- Actualizar productos existentes con categorías y ubicaciones
    UPDATE products SET 
        category_id = generic_id,
        location_id = estante_a_id,
        barcode = '7891234567890',
        presentation = 'Tableta',
        concentration = '500mg',
        packaging = 'Caja x 20 tabletas',
        tax_rate = 18.00,
        profit_margin = 30.00
    WHERE code = 'MED001';
    
    UPDATE products SET 
        category_id = brand_id,
        location_id = estante_a_id,
        barcode = '7891234567891',
        presentation = 'Tableta',
        concentration = '400mg',
        packaging = 'Caja x 10 tabletas',
        tax_rate = 18.00,
        profit_margin = 35.00
    WHERE code = 'MED002';
    
    UPDATE products SET 
        category_id = controlled_id,
        location_id = estante_b_id,
        barcode = '7891234567892',
        presentation = 'Cápsula',
        concentration = '500mg',
        packaging = 'Caja x 12 cápsulas',
        requires_prescription = true,
        is_controlled = true,
        controlled_type = 'schedule_2',
        tax_rate = 18.00,
        profit_margin = 25.00
    WHERE code = 'MED003';
    
    UPDATE products SET 
        category_id = otc_id,
        location_id = mostrador_id,
        barcode = '7891234567893',
        presentation = 'Tableta',
        concentration = '10mg',
        packaging = 'Caja x 10 tabletas',
        tax_rate = 18.00,
        profit_margin = 40.00
    WHERE code = 'MED004';
    
    UPDATE products SET 
        category_id = generic_id,
        location_id = estante_a_id,
        barcode = '7891234567894',
        presentation = 'Cápsula',
        concentration = '20mg',
        packaging = 'Caja x 14 cápsulas',
        tax_rate = 18.00,
        profit_margin = 30.00
    WHERE code = 'MED005';
    
    UPDATE products SET 
        category_id = otc_id,
        location_id = mostrador_id,
        barcode = '7891234567895',
        presentation = 'Gel',
        concentration = '30g',
        packaging = 'Tubo 30g',
        tax_rate = 18.00,
        profit_margin = 45.00
    WHERE code = 'MED006';
    
    UPDATE products SET 
        category_id = controlled_id,
        location_id = estante_b_id,
        barcode = '7891234567896',
        presentation = 'Tableta',
        concentration = '2mg',
        packaging = 'Caja x 30 tabletas',
        requires_prescription = true,
        is_controlled = true,
        controlled_type = 'schedule_1',
        tax_rate = 18.00,
        profit_margin = 20.00
    WHERE code = 'MED007';
    
    UPDATE products SET 
        category_id = supplement_id,
        location_id = mostrador_id,
        barcode = '7891234567897',
        presentation = 'Tableta',
        concentration = '1000mg',
        packaging = 'Caja x 30 tabletas',
        tax_rate = 18.00,
        profit_margin = 50.00
    WHERE code = 'MED008';
    
    UPDATE products SET 
        category_id = generic_id,
        location_id = refrigerador_id,
        barcode = '7891234567898',
        presentation = 'Jarabe',
        concentration = '120ml',
        packaging = 'Frasco 120ml',
        requires_ice = true,
        tax_rate = 18.00,
        profit_margin = 35.00
    WHERE code = 'MED009';
    
    UPDATE products SET 
        category_id = other_id,
        location_id = mostrador_id,
        barcode = '7891234567899',
        presentation = 'Líquido',
        concentration = '250ml',
        packaging = 'Frasco 250ml',
        tax_rate = 18.00,
        profit_margin = 60.00
    WHERE code = 'MED010';
    
    UPDATE products SET 
        category_id = device_id,
        location_id = mostrador_id,
        barcode = '7891234567900',
        presentation = 'Gasas',
        concentration = '10x10cm',
        packaging = 'Caja x 10 unidades',
        tax_rate = 18.00,
        profit_margin = 55.00
    WHERE code = 'MED011';
    
    UPDATE products SET 
        category_id = other_id,
        location_id = refrigerador_id,
        barcode = '7891234567901',
        presentation = 'Solución',
        concentration = '500ml',
        packaging = 'Frasco 500ml',
        requires_ice = true,
        tax_rate = 18.00,
        profit_margin = 40.00
    WHERE code = 'MED012';
    
    UPDATE products SET 
        category_id = generic_id,
        location_id = estante_a_id,
        barcode = '7891234567902',
        presentation = 'Tableta',
        concentration = '850mg',
        packaging = 'Caja x 30 tabletas',
        requires_prescription = true,
        tax_rate = 18.00,
        profit_margin = 25.00
    WHERE code = 'MED013';
    
    UPDATE products SET 
        category_id = generic_id,
        location_id = estante_a_id,
        barcode = '7891234567903',
        presentation = 'Tableta',
        concentration = '10mg',
        packaging = 'Caja x 30 tabletas',
        requires_prescription = true,
        tax_rate = 18.00,
        profit_margin = 30.00
    WHERE code = 'MED014';
    
    UPDATE products SET 
        category_id = generic_id,
        location_id = estante_a_id,
        barcode = '7891234567904',
        presentation = 'Tableta',
        concentration = '20mg',
        packaging = 'Caja x 30 tabletas',
        requires_prescription = true,
        tax_rate = 18.00,
        profit_margin = 35.00
    WHERE code = 'MED015';
END $$;

-- =====================================================
-- 3. PROMOCIONES Y DESCUENTOS
-- =====================================================

INSERT INTO promotions (
  name,
  description,
  discount_type,
  discount_value,
  min_purchase_amount,
  max_discount_amount,
  start_date,
  end_date,
  is_active
) VALUES 
(
  'Descuento 10% en Genéricos',
  'Descuento del 10% en todos los medicamentos genéricos',
  'percentage',
  10.00,
  50.00,
  100.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  true
),
(
  'Descuento Fijo en Vitaminas',
  'Descuento de S/ 5.00 en suplementos vitamínicos',
  'fixed_amount',
  5.00,
  30.00,
  5.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '15 days',
  true
),
(
  'Promoción de Verano',
  'Descuento del 15% en productos de cuidado personal',
  'percentage',
  15.00,
  100.00,
  50.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  true
) ON CONFLICT DO NOTHING;

-- Asignar productos a promociones
DO $$
DECLARE
    genericos_promo_id uuid;
    vitaminas_promo_id uuid;
    verano_promo_id uuid;
    genericos_cat_id uuid;
    suplementos_cat_id uuid;
    cosmeticos_cat_id uuid;
BEGIN
    -- Obtener IDs de promociones
    SELECT id INTO genericos_promo_id FROM promotions WHERE name = 'Descuento 10% en Genéricos';
    SELECT id INTO vitaminas_promo_id FROM promotions WHERE name = 'Descuento Fijo en Vitaminas';
    SELECT id INTO verano_promo_id FROM promotions WHERE name = 'Promoción de Verano';
    
    -- Obtener IDs de categorías
    SELECT id INTO genericos_cat_id FROM product_categories WHERE name = 'Genéricos';
    SELECT id INTO suplementos_cat_id FROM product_categories WHERE name = 'Suplementos';
    SELECT id INTO cosmeticos_cat_id FROM product_categories WHERE name = 'Cosméticos';
    
    -- Asignar productos genéricos a promoción
    INSERT INTO promotion_products (promotion_id, product_id)
    SELECT genericos_promo_id, id FROM products WHERE category_id = genericos_cat_id
    ON CONFLICT DO NOTHING;
    
    -- Asignar suplementos a promoción de vitaminas
    INSERT INTO promotion_products (promotion_id, product_id)
    SELECT vitaminas_promo_id, id FROM products WHERE category_id = suplementos_cat_id
    ON CONFLICT DO NOTHING;
    
    -- Asignar cosméticos a promoción de verano
    INSERT INTO promotion_products (promotion_id, product_id)
    SELECT verano_promo_id, id FROM products WHERE category_id = cosmeticos_cat_id
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 4. ÓRDENES DE COMPRA
-- =====================================================

DO $$
DECLARE
    supplier_id uuid;
    user_id uuid;
    order_id uuid;
BEGIN
    -- Obtener proveedor y usuario
    SELECT id INTO supplier_id FROM suppliers LIMIT 1;
    SELECT id INTO user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Crear orden de compra
    INSERT INTO purchase_orders (
        order_number,
        supplier_id,
        user_id,
        order_date,
        expected_delivery_date,
        status,
        subtotal,
        tax,
        total,
        notes
    ) VALUES (
        'OC-2025-001',
        supplier_id,
        user_id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        'ordered',
        1500.00,
        270.00,
        1770.00,
        'Pedido de medicamentos de uso común'
    ) RETURNING id INTO order_id;
    
    -- Agregar items a la orden
    INSERT INTO purchase_order_items (
        purchase_order_id,
        product_id,
        quantity,
        unit_cost,
        subtotal
    )
    SELECT 
        order_id,
        p.id,
        50,
        p.cost,
        p.cost * 50
    FROM products p
    WHERE p.code IN ('MED001', 'MED002', 'MED004', 'MED008')
    LIMIT 4;
END $$;

-- =====================================================
-- 5. FACTURAS DE PROVEEDORES
-- =====================================================

DO $$
DECLARE
    supplier_id uuid;
    purchase_order_id uuid;
BEGIN
    -- Obtener proveedor y orden de compra
    SELECT id INTO supplier_id FROM suppliers LIMIT 1;
    SELECT id INTO purchase_order_id FROM purchase_orders LIMIT 1;
    
    -- Crear factura de proveedor
    INSERT INTO supplier_invoices (
        invoice_number,
        supplier_id,
        purchase_order_id,
        invoice_date,
        due_date,
        subtotal,
        tax,
        total,
        status
    ) VALUES (
        'FAC-2025-001',
        supplier_id,
        purchase_order_id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        1500.00,
        270.00,
        1770.00,
        'pending'
    );
END $$;

-- =====================================================
-- 6. RECORDATORIOS
-- =====================================================

DO $$
DECLARE
    customer_id uuid;
BEGIN
    -- Obtener cliente
    SELECT id INTO customer_id FROM customers LIMIT 1;
    
    -- Crear recordatorios
    INSERT INTO reminders (
        customer_id,
        type,
        title,
        message,
        reminder_date,
        reminder_time,
        status
    ) VALUES 
    (
        customer_id,
        'medication_renewal',
        'Renovación de Medicación',
        'Su medicación para diabetes necesita renovación. Visite su médico.',
        CURRENT_DATE + INTERVAL '7 days',
        '09:00:00',
        'pending'
    ),
    (
        customer_id,
        'promotion',
        'Promoción Especial',
        'Descuento del 15% en productos de cuidado personal válido hasta fin de mes.',
        CURRENT_DATE + INTERVAL '3 days',
        '10:00:00',
        'pending'
    ),
    (
        customer_id,
        'custom',
        'Recordatorio de Cita',
        'Tiene una cita programada para el próximo lunes a las 10:00 AM.',
        CURRENT_DATE + INTERVAL '5 days',
        '08:00:00',
        'pending'
    );
END $$;

-- =====================================================
-- 7. ALERTAS DE EJEMPLO
-- =====================================================

DO $$
DECLARE
    product_id uuid;
    lot_id uuid;
BEGIN
    -- Obtener producto y lote
    SELECT id INTO product_id FROM products WHERE code = 'MED001' LIMIT 1;
    SELECT id INTO lot_id FROM product_lots WHERE product_id = product_id LIMIT 1;
    
    -- Crear alertas de ejemplo
    INSERT INTO alerts (
        alert_type,
        title,
        message,
        severity,
        reference_id,
        reference_type,
        is_read
    ) VALUES 
    (
        'low_stock',
        'Stock Bajo: Paracetamol 500mg',
        'El producto Paracetamol 500mg tiene solo 15 unidades en stock. Mínimo recomendado: 20 unidades.',
        'high',
        product_id,
        'product',
        false
    ),
    (
        'expiry',
        'Vencimiento Próximo: Lote MED001-001',
        'El lote MED001-001 vence en 25 días. Considere aplicar descuentos para liquidar stock.',
        'medium',
        lot_id,
        'lot',
        false
    ),
    (
        'custom',
        'Mantenimiento Programado',
        'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 6:00 AM.',
        'low',
        NULL,
        'system',
        false
    );
END $$;

-- =====================================================
-- 8. CONFIGURACIÓN CONTABLE
-- =====================================================

-- Crear transacciones contables de ejemplo
DO $$
DECLARE
    caja_account_id uuid;
    ventas_account_id uuid;
    costo_ventas_account_id uuid;
    user_id uuid;
    transaction_id uuid;
BEGIN
    -- Obtener IDs de cuentas
    SELECT id INTO caja_account_id FROM accounting_accounts WHERE account_code = '1000';
    SELECT id INTO ventas_account_id FROM accounting_accounts WHERE account_code = '4000';
    SELECT id INTO costo_ventas_account_id FROM accounting_accounts WHERE account_code = '5000';
    SELECT id INTO user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Crear transacción de venta
    INSERT INTO accounting_transactions (
        transaction_date,
        reference_number,
        description,
        transaction_type,
        total_amount,
        created_by
    ) VALUES (
        CURRENT_DATE,
        'TXN-001',
        'Venta de medicamentos',
        'sale',
        150.00,
        user_id
    ) RETURNING id INTO transaction_id;
    
    -- Crear asientos contables
    INSERT INTO accounting_entries (
        transaction_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES 
    (
        transaction_id,
        caja_account_id,
        150.00,
        0.00,
        'Ingreso por venta'
    ),
    (
        transaction_id,
        ventas_account_id,
        0.00,
        150.00,
        'Venta de productos'
    );
END $$;

-- =====================================================
-- 9. ACTUALIZAR PRODUCTOS CON STOCK BAJO PARA PROBAR ALERTAS
-- =====================================================

-- Actualizar algunos productos para que tengan stock bajo
UPDATE products 
SET stock_quantity = 5 
WHERE code IN ('MED001', 'MED004', 'MED008');

-- =====================================================
-- 10. CREAR LOTES CON VENCIMIENTO PRÓXIMO
-- =====================================================

-- Crear lotes que vencen pronto para probar alertas
DO $$
DECLARE
    product_id uuid;
BEGIN
    -- Obtener producto
    SELECT id INTO product_id FROM products WHERE code = 'MED001' LIMIT 1;
    
    -- Crear lote que vence en 25 días
    INSERT INTO product_lots (
        product_id,
        lot_number,
        expiry_date,
        quantity,
        cost
    ) VALUES (
        product_id,
        'LOTE-VENC-001',
        CURRENT_DATE + INTERVAL '25 days',
        100,
        5.20
    );
    
    -- Obtener otro producto
    SELECT id INTO product_id FROM products WHERE code = 'MED002' LIMIT 1;
    
    -- Crear lote que vence en 5 días
    INSERT INTO product_lots (
        product_id,
        lot_number,
        expiry_date,
        quantity,
        cost
    ) VALUES (
        product_id,
        'LOTE-VENC-002',
        CURRENT_DATE + INTERVAL '5 days',
        50,
        8.50
    );
END $$;

-- =====================================================
-- 11. CONFIGURACIÓN INICIAL COMPLETA
-- =====================================================

-- Insertar configuración de alertas personalizada
UPDATE alert_config 
SET days_before_alert = 5, notification_method = 'all'
WHERE alert_type = 'low_stock';

UPDATE alert_config 
SET days_before_alert = 15, notification_method = 'email'
WHERE alert_type = 'expiry';

-- Marcar el usuario admin como super admin
UPDATE users 
SET is_super_admin = true, 
    employee_id = 'EMP-001',
    hire_date = CURRENT_DATE - INTERVAL '1 year'
WHERE email = 'admin@farmacia.com';

-- Actualizar información de clientes
UPDATE customers 
SET emergency_contact = 'María González',
    emergency_phone = '+51-987-654-321',
    allergies = 'Penicilina',
    chronic_conditions = 'Diabetes tipo 2',
    preferred_payment_method = 'cash',
    is_vip = true
WHERE email = 'maria.gonzalez@email.com';

UPDATE customers 
SET emergency_contact = 'Ana Rodríguez',
    emergency_phone = '+51-912-345-678',
    preferred_payment_method = 'card',
    is_vip = false
WHERE email = 'juan.rodriguez@email.com'; 