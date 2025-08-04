# Sistema de Facturación para Farmacias 💊

Un sistema completo de gestión y facturación diseñado específicamente para farmacias, desarrollado con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características Principales

### 📊 Dashboard Inteligente
- Métricas en tiempo real de ventas diarias y mensuales
- Alertas de stock bajo y productos próximos a vencer
- Estadísticas de clientes y productos
- Gráficos y análisis de tendencias

### 💊 Gestión de Productos
- Registro completo de medicamentos y productos
- Control de stock con alertas automáticas
- Gestión de lotes y fechas de vencimiento
- Categorización por tipo (genéricos, marca, OTC, controlados)
- Historial de movimientos de inventario

### 🧾 Sistema de Facturación
- Emisión de facturas electrónicas
- Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- Devoluciones y anulaciones controladas
- Numeración automática de facturas
- Impresión de recibos

### 👥 Gestión de Clientes
- Registro de clientes con historial de compras
- Programa de fidelización con puntos
- Gestión de datos personales y contacto
- Historial de recetas médicas

### 🏪 Módulo de Compras
- Gestión de proveedores
- Órdenes de compra y recepción
- Control de facturas de proveedores
- Historial de compras y precios

### 📋 Recetas Médicas
- Digitalización de recetas
- Control de medicamentos con receta
- Validación de prescripciones
- Seguimiento de medicamentos controlados

### 📈 Reportes y Análisis
- Reportes de ventas por período
- Análisis de productos más vendidos
- Control de mermas y vencimientos
- Estadísticas de clientes frecuentes

### 🔐 Seguridad y Usuarios
- Sistema de roles (administrador, farmacéutico, cajero)
- Autenticación segura con Supabase Auth
- Auditoría completa de acciones
- Políticas de seguridad a nivel de base de datos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Notificaciones**: React Hot Toast
- **Fechas**: date-fns

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- Cuenta en Supabase
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sistema-facturacion-farmacia.git
cd sistema-facturacion-farmacia
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**
   - Crear un nuevo proyecto en [Supabase](https://supabase.com)
   - Copiar las credenciales del proyecto
   - Crear archivo `.env` con las variables:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Configurar la base de datos**
   - Ejecutar las migraciones en Supabase SQL Editor:
     - `supabase/migrations/create_pharmacy_schema.sql`
     - `supabase/migrations/insert_sample_data.sql`

5. **Crear usuario administrador**
   - Ir a Authentication > Users en Supabase Dashboard
   - Crear usuario con email: `admin@farmacia.com`
   - Contraseña: `admin123` (cambiar en producción)

6. **Ejecutar la aplicación**
```bash
npm run dev
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `suppliers` - Proveedores
- `customers` - Clientes
- `products` - Productos y medicamentos
- `product_lots` - Lotes con fechas de vencimiento
- `sales` / `sale_items` - Ventas y sus items
- `purchases` / `purchase_items` - Compras y sus items
- `prescriptions` / `prescription_items` - Recetas médicas
- `stock_movements` - Movimientos de inventario
- `loyalty_points` - Puntos de fidelización

### Características de Seguridad
- Row Level Security (RLS) habilitado
- Políticas basadas en roles de usuario
- Triggers automáticos para actualización de stock
- Auditoría completa de cambios

## 👤 Usuarios y Roles

### Administrador
- Acceso completo al sistema
- Gestión de usuarios y configuración
- Reportes avanzados y análisis

### Farmacéutico
- Gestión de productos y stock
- Validación de recetas
- Ventas y atención al cliente

### Cajero
- Registro de ventas
- Atención al cliente básica
- Consulta de productos

## 🚀 Despliegue

### Netlify (Recomendado)
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Variables de Entorno en Producción
```env
VITE_SUPABASE_URL=tu_supabase_url_produccion
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_produccion
```

## 📱 Características Adicionales

### Responsive Design
- Optimizado para tablets y dispositivos móviles
- Interfaz adaptable para puntos de venta (POS)

### Alertas Inteligentes
- Stock bajo automático
- Productos próximos a vencer
- Notificaciones en tiempo real

### Búsqueda Avanzada
- Búsqueda por código, nombre o principio activo
- Filtros por categoría y estado
- Resultados instantáneos

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@farmaciasystem.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/sistema-facturacion-farmacia/issues)

## 🔄 Roadmap

### Próximas Características
- [ ] Integración con SUNAT (Perú)
- [ ] App móvil para inventario
- [ ] Sincronización offline
- [ ] Reportes PDF avanzados
- [ ] Integración con balanzas electrónicas
- [ ] Sistema de alertas por SMS/WhatsApp

---

**Desarrollado con ❤️ para farmacias modernas**