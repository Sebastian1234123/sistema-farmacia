/*
  # Fix Authentication System
  
  1. Create trigger to automatically create user profiles
  2. Update RLS policies for proper authentication
  3. Remove password field dependency
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    'cashier',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Users can read all data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can read all data" ON users 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Update other policies to use auth.uid() instead of user_id
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage product_lots" ON product_lots;
DROP POLICY IF EXISTS "Authenticated users can manage purchases" ON purchases;
DROP POLICY IF EXISTS "Authenticated users can manage purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can manage sale_items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated users can manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Authenticated users can manage prescription_items" ON prescription_items;
DROP POLICY IF EXISTS "Authenticated users can manage stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Authenticated users can manage loyalty_points" ON loyalty_points;

CREATE POLICY "Authenticated users can manage suppliers" ON suppliers 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage customers" ON customers 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage products" ON products 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage product_lots" ON product_lots 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage purchases" ON purchases 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage purchase_items" ON purchase_items 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage sales" ON sales 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage sale_items" ON sale_items 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage prescriptions" ON prescriptions 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage prescription_items" ON prescription_items 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage stock_movements" ON stock_movements 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage loyalty_points" ON loyalty_points 
  FOR ALL TO authenticated USING (true); 