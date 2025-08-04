/*
  # Inserción de Productos de Muestra
  
  Este archivo inserta productos de ejemplo directamente en la base de datos
  para que el sistema tenga datos con los que trabajar.
*/

-- Insertar productos farmacéuticos de ejemplo
INSERT INTO products (code, name, active_ingredient, laboratory, category, price, cost, stock_quantity, min_stock, requires_prescription, is_active) VALUES
('MED001', 'Paracetamol 500mg x 20 tabletas', 'Paracetamol', 'Laboratorios Bayer', 'generic', 8.50, 5.20, 150, 20, false, true),
('MED002', 'Ibuprofeno 400mg x 10 tabletas', 'Ibuprofeno', 'Pfizer Perú', 'brand', 12.80, 8.50, 80, 15, false, true),
('MED003', 'Amoxicilina 500mg x 12 cápsulas', 'Amoxicilina', 'AC Farma', 'generic', 18.90, 12.30, 45, 10, true, true),
('MED004', 'Loratadina 10mg x 10 tabletas', 'Loratadina', 'Bayer', 'otc', 15.60, 9.80, 120, 25, false, true),
('MED005', 'Omeprazol 20mg x 14 cápsulas', 'Omeprazol', 'Pfizer Perú', 'generic', 22.40, 14.70, 65, 12, false, true),
('MED006', 'Diclofenaco Gel 30g', 'Diclofenaco', 'AC Farma', 'otc', 16.80, 11.20, 90, 18, false, true),
('MED007', 'Clonazepam 2mg x 30 tabletas', 'Clonazepam', 'Pfizer Perú', 'controlled', 35.50, 22.80, 25, 5, true, true),
('MED008', 'Vitamina C 1000mg x 30 tabletas', 'Ácido Ascórbico', 'Bayer', 'otc', 28.90, 18.50, 200, 30, false, true),
('MED009', 'Acetaminofén Jarabe 120ml', 'Paracetamol', 'AC Farma', 'generic', 14.20, 9.10, 75, 15, false, true),
('MED010', 'Alcohol Medicinal 250ml', 'Alcohol Etílico', 'Droguería Alfaro', 'otc', 6.50, 3.80, 300, 50, false, true),
('MED011', 'Gasas Estériles 10x10cm x 10 unidades', 'Gasa de Algodón', 'Droguería Alfaro', 'otc', 8.90, 5.40, 180, 25, false, true),
('MED012', 'Suero Fisiológico 500ml', 'Cloruro de Sodio', 'AC Farma', 'otc', 12.30, 7.80, 95, 20, false, true),
('MED013', 'Metformina 850mg x 30 tabletas', 'Metformina', 'Bayer', 'generic', 24.60, 16.20, 55, 10, true, true),
('MED014', 'Enalapril 10mg x 30 tabletas', 'Enalapril', 'Pfizer Perú', 'generic', 19.80, 12.90, 70, 12, true, true),
('MED015', 'Simvastatina 20mg x 30 tabletas', 'Simvastatina', 'AC Farma', 'generic', 32.40, 21.10, 40, 8, true, true)
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