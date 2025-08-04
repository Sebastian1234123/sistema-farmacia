#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuración de Variables de Entorno para PharmaSys\n');

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env ya existe');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.log('✅ Variables de Supabase ya configuradas');
    process.exit(0);
  }
}

console.log('📝 Creando archivo .env...\n');

const envContent = `# Supabase Configuration
# Obtén estos valores desde tu dashboard de Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Instrucciones:
# 1. Ve a https://supabase.com/dashboard
# 2. Selecciona tu proyecto
# 3. Ve a Settings > API
# 4. Copia la URL del proyecto y la anon key
# 5. Reemplaza los valores de arriba con los tuyos
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ Archivo .env creado exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Settings > API');
console.log('4. Copia la URL del proyecto y la anon key');
console.log('5. Edita el archivo .env y reemplaza los valores');
console.log('6. Ejecuta: npm run dev');
console.log('\n🔑 Credenciales de prueba:');
console.log('Email: admin@farmacia.com');
console.log('Contraseña: admin123'); 