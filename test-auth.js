#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Ejecuta: npm run setup');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log('🧪 Probando sistema de autenticación personalizado...\n');

  // Test 1: Verificar que las funciones existen
  console.log('1. Verificando funciones de autenticación...');
  try {
    // Test hash_password function
    const { data: hashData, error: hashError } = await supabase
      .rpc('hash_password', { password: 'test123' });

    if (hashError) {
      console.error('❌ Error: Función hash_password no encontrada');
      console.log('   Ejecuta la migración: 20250804150000_add_password_to_users.sql');
    } else {
      console.log('✅ Función hash_password encontrada');
    }

    // Test verify_password function
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('verify_password', { password: 'test123', hash: hashData });

    if (verifyError) {
      console.error('❌ Error: Función verify_password no encontrada');
    } else {
      console.log('✅ Función verify_password encontrada');
    }

  } catch (error) {
    console.error('❌ Error al verificar funciones:', error.message);
  }

  // Test 2: Verificar usuarios de prueba
  console.log('\n2. Verificando usuarios de prueba...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('email, full_name, role, is_active')
      .in('email', [
        'admin@farmacia.com',
        'farmaceutico@farmacia.com',
        'cajero@farmacia.com'
      ]);

    if (error) {
      console.error('❌ Error al verificar usuarios:', error.message);
      return;
    }

    console.log(`✅ ${users.length} usuarios de prueba encontrados:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.is_active ? 'Activo' : 'Inactivo'}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Probar autenticación
  console.log('\n3. Probando autenticación...');
  try {
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        user_email: 'admin@farmacia.com',
        user_password: 'admin123'
      });

    if (error) {
      console.error('❌ Error en autenticación:', error.message);
      console.log('   Asegúrate de haber ejecutado todas las migraciones');
      return;
    }

    if (data && data.length > 0) {
      const user = data[0];
      console.log('✅ Autenticación exitosa:');
      console.log(`   - Usuario: ${user.full_name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Rol: ${user.role}`);
    } else {
      console.log('❌ Autenticación fallida');
      console.log('   Verifica que el usuario admin@farmacia.com existe con contraseña admin123');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Probar autenticación fallida
  console.log('\n4. Probando autenticación con credenciales incorrectas...');
  try {
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        user_email: 'admin@farmacia.com',
        user_password: 'password_incorrecta'
      });

    if (error) {
      console.error('❌ Error en autenticación:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('✅ Autenticación fallida correctamente (credenciales incorrectas)');
    } else {
      console.log('❌ Error: Autenticación exitosa con credenciales incorrectas');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n🎉 Pruebas completadas!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Ve a http://localhost:5173');
  console.log('3. Inicia sesión con las credenciales de prueba');
}

testAuthentication().catch(console.error); 