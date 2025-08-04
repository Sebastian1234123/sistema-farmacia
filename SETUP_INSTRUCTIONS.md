# 🚀 Instrucciones de Configuración - Sistema de Farmacia

## 📋 Pasos para Configurar el Sistema Completo

### 1. 🔗 Conectar Supabase
- Haz clic en el botón **"Connect to Supabase"** en la parte superior derecha
- Esto configurará automáticamente las variables de entorno

### 2. 🗄️ Crear Base de Datos
Ve a tu **Supabase Dashboard** → **SQL Editor** y ejecuta los siguientes archivos en orden:

#### a) Crear Esquema Principal
```sql
-- Ejecutar: supabase/migrations/create_pharmacy_schema.sql
```
Este archivo crea todas las tablas, funciones, triggers y políticas de seguridad.

#### b) Insertar Datos de Ejemplo
```sql
-- Ejecutar: supabase/migrations/insert_sample_data.sql
```
Este archivo inserta proveedores, clientes y productos de ejemplo.

#### c) Crear Usuario Administrador
```sql
-- Ejecutar: supabase/migrations/create_admin_user.sql
```
Este archivo crea los perfiles de usuario en la base de datos.

### 3. 👤 Crear Usuarios en Supabase Auth
Ve a **Authentication** → **Users** en Supabase Dashboard y crea estos usuarios:

#### Usuario Administrador
- **Email**: `admin@farmacia.com`
- **Contraseña**: `admin123`
- **User ID**: `00000000-0000-0000-0000-000000000001`

#### Usuario Farmacéutico (Opcional)
- **Email**: `farmaceutico@farmacia.com`
- **Contraseña**: `farmacia123`
- **User ID**: `00000000-0000-0000-0000-000000000002`

#### Usuario Cajero (Opcional)
- **Email**: `cajero@farmacia.com`
- **Contraseña**: `cajero123`
- **User ID**: `00000000-0000-0000-0000-000000000003`

### 4. ✅ Verificar Configuración
1. Reinicia el servidor de desarrollo
2. Ve a la aplicación en el navegador
3. Inicia sesión con: `admin@farmacia.com` / `admin123`
4. Verifica que puedas acceder al dashboard

### 5. 📊 Datos Incluidos
El sistema viene con datos de ejemplo:

#### Proveedores
- Droguería Lima S.A.
- Farmacéutica del Pacífico
- Laboratorios Unidos

#### Clientes
- Juan Pérez Rodríguez
- María García López
- Carlos Mendoza Silva

#### Productos
- Paracetamol 500mg
- Ibuprofeno 400mg
- Amoxicilina 500mg
- Omeprazol 20mg
- Y más medicamentos comunes

### 6. 🔐 Roles y Permisos

#### Administrador
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del sistema
- Todos los reportes

#### Farmacéutico
- Gestión de productos y stock
- Validación de recetas
- Ventas y atención al cliente
- Reportes operativos

#### Cajero
- Registro de ventas
- Atención al cliente básica
- Consulta de productos
- Reportes básicos

### 7. 🚨 Notas Importantes

#### Seguridad
- Cambia las contraseñas por defecto en producción
- Las políticas RLS están habilitadas para seguridad
- Todos los cambios quedan auditados

#### Base de Datos
- Todas las tablas tienen triggers automáticos
- El stock se actualiza automáticamente con las ventas
- Las fechas se manejan con zona horaria

#### Funcionalidades
- Numeración automática de facturas
- Alertas de stock bajo
- Control de fechas de vencimiento
- Sistema de puntos de fidelización

### 8. 📱 Próximas Funcionalidades
- Integración con SUNAT (Perú)
- App móvil
- Reportes PDF
- Sincronización offline
- Alertas por WhatsApp

---

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Asegúrate de haber conectado Supabase correctamente
- Verifica que el archivo `.env` tenga las variables correctas

### Error: "Invalid login credentials"
- Verifica que hayas creado el usuario en Supabase Auth
- Asegúrate de usar el email y contraseña correctos
- Confirma que el User ID coincida con el de la base de datos

### Error: "Row Level Security"
- Verifica que las políticas RLS estén creadas correctamente
- Asegúrate de que el usuario tenga el rol correcto en la tabla users

---

**¡Sistema listo para usar! 🎉**