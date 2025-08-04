/*
  # Crear Usuario Administrador

  1. Nuevo Usuario
    - Email: admin@farmacia.com
    - Contraseña: admin123
    - Rol: admin
    - Nombre: Administrador del Sistema

  2. Configuración
    - Usuario activo por defecto
    - Permisos completos de administrador
    - Perfil completo en tabla users
*/

-- Insertar usuario administrador en la tabla users
-- Nota: El ID debe coincidir con el usuario creado en Supabase Auth
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@farmacia.com',
  'Administrador del Sistema',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Crear algunos usuarios adicionales de ejemplo
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'farmaceutico@farmacia.com',
  'Dr. Juan Pérez',
  'pharmacist',
  true,
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'cajero@farmacia.com',
  'María González',
  'cashier',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();