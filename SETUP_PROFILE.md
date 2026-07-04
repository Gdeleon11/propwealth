# PropWealth - Configuración de Perfil de Usuario

## Descripción General

Se ha implementado un sistema completo de edición de perfil de usuario que permite a los usuarios:
- Cambiar su nombre y datos personales
- Cambiar idioma (español/inglés)
- Cambiar moneda (USD, MXN, EUR, GBP)
- Cambiar zona horaria

## Cambios Realizados

### 1. Base de Datos

#### Tabla `users` Actualizada
Se ha creado/actualizado la tabla `users` con los siguientes campos:
- `id` (UUID, primary key)
- `email` (TEXT, unique)
- `name` (TEXT)
- `image` (TEXT)
- `google_id` (TEXT)
- `preferred_language` (TEXT, default: 'es')
- `currency` (TEXT, default: 'USD')
- `timezone` (TEXT, default: 'America/Mexico_City')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### Índices Creados
- `idx_users_email` - Para búsquedas rápidas por email
- `idx_users_google_id` - Para búsquedas rápidas por Google ID

### 2. API Endpoints

#### GET `/api/user/profile`
Obtiene el perfil del usuario autenticado.

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "Eduardo Pérez",
  "image": "https://...",
  "preferred_language": "es",
  "currency": "USD",
  "timezone": "America/Mexico_City"
}
```

**Errores:**
- 401: Unauthorized (sin sesión)
- 404: User not found
- 500: Server error

#### PATCH `/api/user/profile`
Actualiza el perfil del usuario autenticado.

**Request Body:**
```json
{
  "name": "Nuevo Nombre",
  "preferred_language": "en",
  "currency": "MXN",
  "timezone": "America/New_York"
}
```

Todos los campos son opcionales.

**Response (200):** Retorna el perfil actualizado

**Errores:**
- 400: Validación fallida
- 401: Unauthorized
- 404: User not found
- 500: Server error

### 3. Frontend

#### Componente Settings.tsx
- Carga datos reales del perfil desde la API
- Interfaz intuitiva para editar:
  - Nombre (input text)
  - Idioma (select dropdown)
  - Moneda (select dropdown)
  - Zona horaria (select dropdown)
- Modal reutilizable para edición
- Estados de carga y error
- Integración con NextAuth para actualizar sesión

### 4. Autenticación (NextAuth)

Se ha actualizado la sesión para incluir:
- `preferred_language`
- `currency`
- `timezone`

Estos datos se cargan automáticamente en cada sesión.

## Instrucciones de Instalación

### Paso 1: Ejecutar la Migración en Neon

1. Abre la consola SQL de Neon: https://console.neon.tech/
2. Selecciona tu proyecto "PropWealth"
3. Abre el SQL Editor
4. Copia y pega el contenido de `migrations/001_create_users_table.sql`
5. Ejecuta la migración

O si prefieres usar el schema completo, usa `neon-schema.sql` que ya incluye la tabla users.

### Paso 2: Verificar la Instalación

Ejecuta en la consola SQL de Neon:
```sql
SELECT * FROM users LIMIT 1;
```

Deberías ver la estructura de la tabla sin errores.

### Paso 3: Probar la Funcionalidad

1. Inicia la aplicación: `npm run dev`
2. Ve a `http://localhost:3000/settings`
3. Inicia sesión con Google OAuth
4. Haz clic en "EDITAR" para cambiar tu nombre
5. Haz clic en cualquier preferencia para cambiarla
6. Los cambios se guardan en tiempo real en la base de datos

## Opciones Disponibles

### Idiomas
- `es` - Español
- `en` - English

### Monedas
- `USD` - Dólar Estadounidense
- `MXN` - Peso Mexicano
- `EUR` - Euro
- `GBP` - Libra Esterlina

### Zonas Horarias
- `America/Mexico_City` - UTC-5, Ciudad de México
- `America/New_York` - UTC-4, New York
- `America/Los_Angeles` - UTC-7, Los Angeles
- `Europe/London` - UTC+0, Londres
- `Europe/Madrid` - UTC+1, Madrid

(Pueden añadirse más opciones fácilmente)

## Notas Importantes

1. **Sesión**: Después de actualizar el perfil, la sesión se actualiza automáticamente con `updateSession()` de NextAuth.

2. **Validación**: 
   - El nombre no puede estar vacío
   - Solo se aceptan idiomas válidos ('es', 'en')
   - Las monedas y zonas horarias se validan contra opciones predefinidas

3. **Errores**: Los errores se muestran en el modal de edición.

4. **Base de datos**: Todos los datos se almacenan en PostgreSQL (Neon) con timestamps de creación y actualización.

## Estructura de Archivos

```
PropWealth/
├── app/
│   └── api/
│       └── user/
│           └── profile/
│               └── route.ts          (API endpoints)
├── components/
│   └── Settings.tsx                  (UI component)
├── migrations/
│   └── 001_create_users_table.sql   (Migration)
├── neon-schema.sql                   (Schema completo)
└── setup-database.sql                (Setup alternativo)
```

## Troubleshooting

### Error: "User not found"
- Verifica que el usuario se creó correctamente en la tabla `users`
- Confirma que estás autenticado con la misma cuenta de Google

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` está configurado correctamente en `.env.local`
- Comprueba que tienes acceso a Neon

### Los cambios no se guardan
- Abre la consola del navegador (F12) para ver errores
- Verifica que la API está respondiendo correctamente
- Asegúrate de que la tabla `users` existe en la base de datos

## Expansiones Futuras

1. Agregar más zonas horarias
2. Soportar más idiomas
3. Editar imagen de perfil
4. Preferencias adicionales (tema, notificaciones, etc.)
5. Historial de cambios
6. Validación de email adicional
