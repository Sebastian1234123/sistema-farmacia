import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProducts() {
  console.log('🧪 Probando acceso a productos...\n');

  try {
    // 1. Verificar si hay productos en la base de datos (sin RLS)
    console.log('1. Verificando productos en la base de datos...');
    const { data: allProducts, error: allError, count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (allError) {
      console.error('❌ Error al obtener productos:', allError);
    } else {
      console.log(`✅ Total de productos en BD: ${totalCount}`);
      console.log(`✅ Productos obtenidos: ${allProducts?.length || 0}`);
      
      if (allProducts && allProducts.length > 0) {
        console.log('\n📋 Primeros 3 productos:');
        allProducts.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.code}) - Stock: ${product.stock_quantity}`);
        });
      }
    }

    // 2. Verificar políticas RLS
    console.log('\n2. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'products' })
      .catch(() => ({ data: null, error: 'Función no disponible' }));

    if (policiesError) {
      console.log('ℹ️  No se pudo verificar políticas RLS directamente');
    } else {
      console.log('✅ Políticas RLS verificadas');
    }

    // 3. Verificar si RLS está habilitado
    console.log('\n3. Verificando estado de RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'products' })
      .catch(() => ({ data: null, error: 'Función no disponible' }));

    if (rlsError) {
      console.log('ℹ️  No se pudo verificar estado de RLS directamente');
    } else {
      console.log(`✅ RLS habilitado: ${rlsStatus?.rls_enabled || 'No disponible'}`);
    }

    // 4. Intentar obtener productos con autenticación simulada
    console.log('\n4. Probando acceso con diferentes métodos...');
    
    // Método 1: Sin autenticación
    const { data: noAuthData, error: noAuthError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    console.log(`   Sin autenticación: ${noAuthData?.length || 0} productos`);
    if (noAuthError) {
      console.log(`   Error: ${noAuthError.message}`);
    }

    // Método 2: Con autenticación (si hay usuario en localStorage)
    const storedUser = localStorage.getItem('pharmacy_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log(`   Usuario en localStorage: ${user.email}`);
        
        // Intentar establecer el usuario en Supabase
        const { data: authData, error: authError } = await supabase
          .from('products')
          .select('*')
          .limit(5);

        console.log(`   Con autenticación: ${authData?.length || 0} productos`);
        if (authError) {
          console.log(`   Error: ${authError.message}`);
        }
      } catch (e) {
        console.log('   Error al parsear usuario de localStorage');
      }
    } else {
      console.log('   No hay usuario en localStorage');
    }

    // 5. Verificar estructura de la tabla
    console.log('\n5. Verificando estructura de la tabla...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .catch(() => ({ data: null, error: 'Función no disponible' }));

    if (columnsError) {
      console.log('ℹ️  No se pudo verificar estructura de la tabla directamente');
    } else {
      console.log('✅ Estructura de tabla verificada');
    }

    // 6. Resumen y recomendaciones
    console.log('\n📊 RESUMEN:');
    console.log(`   - Total de productos en BD: ${totalCount || 0}`);
    console.log(`   - Productos accesibles: ${allProducts?.length || 0}`);
    
    if (totalCount > 0 && (allProducts?.length || 0) === 0) {
      console.log('\n⚠️  PROBLEMA DETECTADO:');
      console.log('   Hay productos en la base de datos pero no son accesibles.');
      console.log('   Esto puede deberse a:');
      console.log('   1. Políticas RLS muy restrictivas');
      console.log('   2. Usuario no autenticado correctamente');
      console.log('   3. Permisos insuficientes');
      console.log('\n🔧 SOLUCIONES:');
      console.log('   1. Verificar que el usuario esté autenticado');
      console.log('   2. Revisar las políticas RLS en Supabase');
      console.log('   3. Asegurar que las políticas permitan acceso a usuarios autenticados');
    } else if (totalCount === 0) {
      console.log('\nℹ️  No hay productos en la base de datos.');
      console.log('   Agrega algunos productos de prueba primero.');
    } else {
      console.log('\n✅ Todo funciona correctamente.');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testProducts(); 