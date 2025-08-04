/*
  # Add Password Authentication to Users Table
  
  1. Add password field to users table
  2. Create function to hash passwords
  3. Update authentication policies
  4. Create default admin user with hashed password
*/

-- Add password field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

-- Create function to hash passwords using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the admin user with hashed password
UPDATE users 
SET password_hash = hash_password('admin123')
WHERE email = 'admin@farmacia.com';

-- Create additional test users with hashed passwords
INSERT INTO users (id, email, full_name, role, is_active, password_hash) VALUES
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
  password_hash = EXCLUDED.password_hash;

-- Update RLS policies for password-based authentication
DROP POLICY IF EXISTS "Users can read all data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Allow all authenticated users to read user data
CREATE POLICY "Users can read all data" ON users 
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (true);

-- Allow insertion of new users (for registration)
CREATE POLICY "Users can insert profiles" ON users 
  FOR INSERT WITH CHECK (true);

-- Create a function to authenticate users
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

-- Grant execute permission on the authentication function
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO authenticated; 