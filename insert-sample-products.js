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

const sampleProducts = [
  {
    code: 'MED001',
    name: 'Paracetamol 500mg x 20 tabletas',
    active_ingredient: 'Paracetamol',
    laboratory: 'Laboratorios Bayer',
    category: 'generic',
    price: 8.50,
    cost: 5.20,
    stock_quantity: 150,
    min_stock: 20,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED002',
    name: 'Ibuprofeno 400mg x 10 tabletas',
    active_ingredient: 'Ibuprofeno',
    laboratory: 'Pfizer Perú',
    category: 'brand',
    price: 12.80,
    cost: 8.50,
    stock_quantity: 80,
    min_stock: 15,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED003',
    name: 'Amoxicilina 500mg x 12 cápsulas',
    active_ingredient: 'Amoxicilina',
    laboratory: 'AC Farma',
    category: 'generic',
    price: 18.90,
    cost: 12.30,
    stock_quantity: 45,
    min_stock: 10,
    requires_prescription: true,
    is_active: true
  },
  {
    code: 'MED004',
    name: 'Loratadina 10mg x 10 tabletas',
    active_ingredient: 'Loratadina',
    laboratory: 'Bayer',
    category: 'otc',
    price: 15.60,
    cost: 9.80,
    stock_quantity: 120,
    min_stock: 25,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED005',
    name: 'Omeprazol 20mg x 14 cápsulas',
    active_ingredient: 'Omeprazol',
    laboratory: 'Pfizer Perú',
    category: 'generic',
    price: 22.40,
    cost: 14.70,
    stock_quantity: 65,
    min_stock: 12,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED006',
    name: 'Diclofenaco Gel 30g',
    active_ingredient: 'Diclofenaco',
    laboratory: 'AC Farma',
    category: 'otc',
    price: 16.80,
    cost: 11.20,
    stock_quantity: 90,
    min_stock: 18,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED007',
    name: 'Clonazepam 2mg x 30 tabletas',
    active_ingredient: 'Clonazepam',
    laboratory: 'Pfizer Perú',
    category: 'controlled',
    price: 35.50,
    cost: 22.80,
    stock_quantity: 25,
    min_stock: 5,
    requires_prescription: true,
    is_active: true
  },
  {
    code: 'MED008',
    name: 'Vitamina C 1000mg x 30 tabletas',
    active_ingredient: 'Ácido Ascórbico',
    laboratory: 'Bayer',
    category: 'otc',
    price: 28.90,
    cost: 18.50,
    stock_quantity: 200,
    min_stock: 30,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED009',
    name: 'Acetaminofén Jarabe 120ml',
    active_ingredient: 'Paracetamol',
    laboratory: 'AC Farma',
    category: 'generic',
    price: 14.20,
    cost: 9.10,
    stock_quantity: 75,
    min_stock: 15,
    requires_prescription: false,
    is_active: true
  },
  {
    code: 'MED010',
    name: 'Alcohol Medicinal 250ml',
    active_ingredient: 'Alcohol Etílico',
    laboratory: 'Droguería Alfaro',
    category: 'otc',
    price: 6.50,
    cost: 3.80,
    stock_quantity: 300,
    min_stock: 50,
    requires_prescription: false,
    is_active: true
  }
];

async function insertSampleProducts() {
  console.log('🚀 Insertando productos de muestra...\n');

  try {
    // Autenticarse primero usando la función personalizada
    console.log('🔐 Autenticando usuario...');
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_email: 'admin@farmacia.com',
        user_password: 'admin123'
      });

    if (authError || !authData || authData.length === 0) {
      console.error('❌ Error de autenticación:', authError?.message || 'Credenciales inválidas');
      console.log('💡 Usando credenciales de prueba: admin@farmacia.com / admin123');
      return;
    }

    console.log('✅ Usuario autenticado:', authData[0].email);

    // Verificar si ya hay productos
    const { data: existingProducts, error: countError } = await supabase
      .from('products')
      .select('code', { count: 'exact' });

    if (countError) {
      console.error('❌ Error al verificar productos existentes:', countError);
      return;
    }

    console.log(`📊 Productos existentes: ${existingProducts?.length || 0}`);

    if (existingProducts && existingProducts.length > 0) {
      console.log('ℹ️  Ya hay productos en la base de datos. Saltando inserción.');
      return;
    }

    // Insertar productos de muestra
    console.log('📦 Insertando productos...');
    
    for (const product of sampleProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error al insertar ${product.code}:`, error.message);
      } else {
        console.log(`✅ ${product.code} - ${product.name} insertado correctamente`);
      }
    }

    // Verificar productos insertados
    const { data: finalProducts, error: finalError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (finalError) {
      console.error('❌ Error al verificar productos finales:', finalError);
    } else {
      console.log(`\n🎉 Total de productos en la base de datos: ${finalProducts?.length || 0}`);
      
      if (finalProducts && finalProducts.length > 0) {
        console.log('\n📋 Productos disponibles:');
        finalProducts.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.code}) - S/ ${product.price} - Stock: ${product.stock_quantity}`);
        });
      }
    }

    console.log('\n✅ Proceso completado. Ahora puedes probar la funcionalidad de productos en la aplicación.');

  } catch (error) {
    console.error('❌ Error durante la inserción:', error);
  }
}

insertSampleProducts(); 