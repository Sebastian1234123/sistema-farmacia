/*
  # Fix Existing Policies and Ensure Authentication Works
  
  1. Safely drop existing policies if they exist
  2. Recreate policies for custom authentication
  3. Ensure all functions are properly set up
*/

-- Safely drop existing policies (ignore if they don't exist)
DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read all data') THEN
        DROP POLICY "Users can read all data" ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        DROP POLICY "Users can update own profile" ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
        DROP POLICY "Users can insert own profile" ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert profiles') THEN
        DROP POLICY "Users can insert profiles" ON users;
    END IF;
END $$;

-- Create new policies for custom authentication
CREATE POLICY "Users can read all data" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert profiles" ON users 
  FOR INSERT WITH CHECK (true);

-- Ensure password_hash column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash text;
    END IF;
END $$;

-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate authentication functions
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION authenticate_user(user_email text, user_password text)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role text,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active
  FROM users u
  WHERE u.email = user_email 
    AND u.is_active = true
    AND verify_password(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(text) TO anon;
GRANT EXECUTE ON FUNCTION hash_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO anon;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated;

-- Update existing users with hashed passwords if they don't have them
UPDATE users 
SET password_hash = hash_password('admin123')
WHERE email = 'admin@farmacia.com' AND password_hash IS NULL;

UPDATE users 
SET password_hash = hash_password('farmacia123')
WHERE email = 'farmaceutico@farmacia.com' AND password_hash IS NULL;

UPDATE users 
SET password_hash = hash_password('cajero123')
WHERE email = 'cajero@farmacia.com' AND password_hash IS NULL;

-- Insert test users if they don't exist
INSERT INTO users (id, email, full_name, role, is_active, password_hash) VALUES
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@farmacia.com',
  'Administrador del Sistema',
  'admin',
  true,
  hash_password('admin123')
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'farmaceutico@farmacia.com',
  'Dr. Juan Pérez',
  'pharmacist',
  true,
  hash_password('farmacia123')
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'cajero@farmacia.com',
  'María González',
  'cashier',
  true,
  hash_password('cajero123')
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  password_hash = EXCLUDED.password_hash; 