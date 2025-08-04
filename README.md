# 🏥 PharmaSys - Sistema de Facturación para Farmacias

Un sistema completo y moderno para la gestión integral de farmacias, construido con React, TypeScript, Tailwind CSS y Supabase. Incluye todos los módulos necesarios para una operación farmacéutica profesional.

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Ejecutar el script de configuración
npm run setup

# O crear manualmente el archivo .env
```

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Configurar Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Ve a **Settings > API** y copia la URL y anon key
4. Actualiza el archivo `.env` con tus valores

### 3. Configurar Base de Datos

En el **SQL Editor** de Supabase, ejecuta las migraciones en orden:

1. **Esquema principal**: `supabase/migrations/20250804130016_blue_boat.sql`
2. **Datos de ejemplo**: `supabase/migrations/20250804130100_flat_cottage.sql`
3. **Usuarios de prueba**: `supabase/migrations/20250804134311_misty_tree.sql`
4. **Autenticación personalizada**: `supabase/migrations/20250804150000_add_password_to_users.sql`
5. **Módulos completos**: `supabase/migrations/20250804170000_complete_pharmacy_modules.sql`
6. **Datos de ejemplo completos**: `supabase/migrations/20250804180000_sample_data_complete.sql`

### 4. Instalar Dependencias y Ejecutar

```bash
npm install
npm run dev
```

### 5. Iniciar Sesión

Usa las credenciales de prueba:
- **Administrador**: `admin@farmacia.com` / `admin123`
- **Farmacéutico**: `farmaceutico@farmacia.com` / `farmacia123`
- **Cajero**: `cajero@farmacia.com` / `cajero123`

## 📋 Módulos del Sistema

### 🔐 1. Gestión de Productos (Stock)
- ✅ **Registro completo de medicamentos**: Nombre, código, principio activo, laboratorio
- ✅ **Control de stock**: Cantidad disponible, stock mínimo, alertas automáticas
- ✅ **Gestión de lotes**: Fechas de vencimiento con alertas de caducidad
- ✅ **Categorización**: Genéricos, marca, OTC, controlados, cosméticos, suplementos
- ✅ **Ubicaciones**: Estantes, refrigerador, mostrador
- ✅ **Códigos de barras**: Soporte para escáneres
- ✅ **Medicamentos controlados**: Registro especial con validaciones
- ✅ **Historial de movimientos**: Entradas, salidas, ajustes de inventario

### 💰 2. Facturación y Ventas
- ✅ **Facturas electrónicas**: Conforme a normativas tributarias (SUNAT, SAT, AFIP)
- ✅ **Configuración fiscal**: Impresoras fiscales, facturación electrónica
- ✅ **Métodos de pago**: Efectivo, tarjeta, transferencia
- ✅ **Devoluciones**: Sistema completo de devoluciones y anulaciones
- ✅ **Promociones**: Descuentos por porcentaje o monto fijo
- ✅ **Numeración automática**: Facturas con prefijos configurables
- ✅ **Puntos de fidelización**: Cálculo automático de puntos por compra

### 🛒 3. Compras y Proveedores
- ✅ **Registro de proveedores**: Farmacéuticas, distribuidores con datos completos
- ✅ **Órdenes de compra**: Creación, aprobación, seguimiento
- ✅ **Recepción de mercadería**: Control de recepción por lotes
- ✅ **Facturas de proveedores**: Conciliación y control de pagos
- ✅ **Historial de compras**: Análisis de precios y tendencias
- ✅ **Límites de crédito**: Control de saldos con proveedores

### 👥 4. Clientes y Fidelización
- ✅ **Registro completo**: Datos básicos, contacto de emergencia, alergias
- ✅ **Historial de compras**: Seguimiento completo de transacciones
- ✅ **Programa de fidelización**: Puntos, descuentos recurrentes
- ✅ **Clientes VIP**: Tratamiento especial para clientes frecuentes
- ✅ **Recordatorios**: Renovación de medicación, citas, promociones
- ✅ **Condiciones crónicas**: Seguimiento de tratamientos

### 📋 5. Recetas Médicas
- ✅ **Digitalización**: Gestión de recetas físicas y electrónicas
- ✅ **Validación**: Control de recetas por farmacéuticos
- ✅ **Medicamentos controlados**: Registro especial con validaciones
- ✅ **Dispensación**: Control de cantidades dispensadas
- ✅ **Seguridad**: Validación de licencias médicas
- ✅ **Prioridades**: Urgente, alta, normal, baja

### 📊 6. Reportes y Análisis
- ✅ **Ventas**: Diarias, semanales, mensuales
- ✅ **Productos más vendidos**: Análisis de rentabilidad
- ✅ **Control de mermas**: Pérdidas por vencimiento
- ✅ **Clientes frecuentes**: Análisis de comportamiento
- ✅ **Stock**: Valorización de inventario
- ✅ **Proveedores**: Análisis de compras y pagos

### 🔒 7. Seguridad y Usuarios
- ✅ **Roles y permisos**: Admin, farmacéutico, cajero
- ✅ **Auditoría**: Registro completo de acciones
- ✅ **Autenticación segura**: Contraseñas hasheadas con bcrypt
- ✅ **Sesiones**: Control de acceso y tiempo de sesión
- ✅ **Permisos granulares**: Control por módulo y acción

### 💼 8. Contabilidad Básica
- ✅ **Plan de cuentas**: Estructura contable completa
- ✅ **Transacciones**: Registro automático de ventas y compras
- ✅ **Asientos contables**: Doble partida automática
- ✅ **Balance**: Estados financieros básicos
- ✅ **Conciliación**: Control de caja y bancos

### 🚨 9. Sistema de Alertas
- ✅ **Stock bajo**: Alertas automáticas por productos
- ✅ **Vencimientos**: Alertas por lotes próximos a vencer
- ✅ **Pagos vencidos**: Control de cuentas por cobrar
- ✅ **Recetas**: Vencimiento de prescripciones
- ✅ **Notificaciones**: Sistema, email, SMS
- ✅ **Configuración**: Días de anticipación personalizables

## 🔐 Sistema de Autenticación Personalizado

Este sistema utiliza autenticación personalizada con la tabla `users` de la base de datos:

### Características de Seguridad:
- **Contraseñas hasheadas**: Usando bcrypt con salt
- **Función de autenticación**: `authenticate_user()` en la base de datos
- **Sesiones persistentes**: Almacenadas en localStorage
- **Validación de usuarios activos**: Solo usuarios con `is_active = true`

### Funciones Disponibles:
- `signIn(email, password)`: Iniciar sesión
- `signUp(email, password, fullName)`: Registrar nuevo usuario
- `signOut()`: Cerrar sesión
- `updateProfile(updates)`: Actualizar perfil
- `changePassword(currentPassword, newPassword)`: Cambiar contraseña

## 🔧 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Asegúrate de que los valores no tengan espacios extra

### Error: "Credenciales inválidas"
- Verifica que el usuario existe en la tabla `users`
- Confirma que la contraseña es correcta
- Asegúrate de que el usuario esté activo (`is_active = true`)

### Error: "Database error"
- Verifica que hayas ejecutado todas las migraciones
- Confirma que la extensión `pgcrypto` esté habilitada
- Revisa los logs de Supabase para más detalles

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Storage)
- **Autenticación**: Personalizada con bcrypt
- **UI Components**: Lucide React, Recharts
- **Forms**: React Hook Form, Zod
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/          # Componentes de autenticación
│   │   ├── Login.tsx  # Inicio de sesión
│   │   └── Register.tsx # Registro de usuarios
│   ├── Dashboard/     # Dashboard y estadísticas
│   ├── Layout/        # Header y Sidebar
│   ├── Products/      # Gestión de productos
│   ├── Sales/         # Gestión de ventas
│   ├── Purchases/     # Gestión de compras
│   ├── Customers/     # Gestión de clientes
│   ├── Prescriptions/ # Gestión de recetas
│   ├── Reports/       # Reportes y análisis
│   ├── Alerts/        # Sistema de alertas
│   └── Accounting/    # Contabilidad básica
├── hooks/             # Custom hooks
│   └── useAuth.ts     # Hook de autenticación personalizada
├── lib/               # Configuración de Supabase
├── types/             # Tipos TypeScript
└── App.tsx            # Componente principal
```

## 🔐 Roles y Permisos

### Administrador
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios y configuración
- ✅ Todos los reportes y análisis
- ✅ Configuración de facturación
- ✅ Gestión de contabilidad

### Farmacéutico
- ✅ Gestión de productos y stock
- ✅ Validación de recetas
- ✅ Ventas y atención al cliente
- ✅ Reportes operativos
- ✅ Control de medicamentos controlados

### Cajero
- ✅ Registro de ventas
- ✅ Atención al cliente básica
- ✅ Consulta de productos
- ✅ Reportes básicos
- ✅ Procesamiento de pagos

## 🚨 Notas Importantes

### Seguridad
- Las contraseñas se hashean usando bcrypt con salt
- Las sesiones se almacenan en localStorage (considera usar cookies en producción)
- Todos los cambios quedan auditados
- Las políticas RLS están habilitadas para seguridad

### Base de Datos
- Todas las tablas tienen triggers automáticos
- El stock se actualiza automáticamente con las ventas
- Las fechas se manejan con zona horaria
- La extensión `pgcrypto` es requerida para el hashing

### Autenticación
- Función `authenticate_user()` para validar credenciales
- Función `hash_password()` para hashear contraseñas
- Función `verify_password()` para verificar contraseñas
- Usuarios inactivos no pueden autenticarse

### Funcionalidades Automáticas
- **Alertas de stock**: Se generan automáticamente
- **Alertas de vencimiento**: 30 y 7 días antes
- **Puntos de fidelización**: Se calculan automáticamente
- **Numeración de facturas**: Secuencial automático
- **Asientos contables**: Doble partida automática

## 📱 Próximas Funcionalidades

- ✅ Integración con SUNAT (Perú) - Configurado
- 🔄 App móvil para consultas
- 🔄 Reportes PDF avanzados
- 🔄 Sincronización offline
- 🔄 Alertas por WhatsApp
- 🔄 Autenticación con JWT tokens
- 🔄 Recuperación de contraseñas
- 🔄 Integración con balanzas electrónicas
- 🔄 Códigos QR para productos
- 🔄 Backup automático en la nube

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Sistema completo listo para usar! 🎉**

### 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@pharmasys.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/pharmasys/issues)

### 🎯 Características Destacadas

- **Escalable**: Diseñado para crecer con tu farmacia
- **Seguro**: Autenticación robusta y auditoría completa
- **Flexible**: Se adapta a diferentes tipos de farmacias
- **Completo**: Todos los módulos necesarios en un solo sistema
- **Moderno**: Interfaz intuitiva y responsive
- **Confiable**: Base de datos PostgreSQL con Supabase