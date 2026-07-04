# PropWealth - Sistema de Perfil de Usuario - Quick Start

## 🚀 En 3 Pasos

### Paso 1: Crear la Tabla en Neon (2 minutos)
```
1. Ve a: https://console.neon.tech/
2. Abre SQL Editor
3. Copia TODO el contenido de: neon-schema.sql
4. Click "Execute"
5. ✅ Listo
```

### Paso 2: Reiniciar Dev Server (30 segundos)
```bash
# En terminal, en la carpeta del proyecto:
npm run dev
```

### Paso 3: Probar en la App (1 minuto)
```
1. Ve a: http://localhost:3000/settings
2. Haz login con Google
3. Haz clic en "EDITAR" para cambiar nombre
4. Haz clic en "Idioma" / "Moneda" / "Zona horaria" para cambiar preferencias
5. ✅ Los cambios se guardan automáticamente en Neon
```

---

## ✅ Verificación Rápida

### En Neon Console SQL Editor:
```sql
-- Ver que la tabla existe
SELECT COUNT(*) FROM users;

-- Ver tu usuario
SELECT email, name, preferred_language, currency, timezone 
FROM users 
WHERE email = 'tu-email@gmail.com';
```

### En la App:
- Cambios se guardan sin recargar
- Sin errores en consola (F12)
- Datos se muestran correctamente

---

## 📁 Qué se Agregó

```
components/Settings.tsx          ← Completamente actualizado
app/api/user/profile/route.ts    ← NUEVA API
app/api/auth/.../route.ts        ← Actualizado para cargar preferencias
neon-schema.sql                  ← Tabla users agregada
setup-database.sql               ← Tabla users agregada
migrations/001_...sql            ← Migración opcional
SETUP_PROFILE.md                 ← Guía completa
PROFILE_IMPLEMENTATION.md        ← Detalles técnicos
```

---

## 🎯 Funcionalidades Implementadas

✅ **Nombre**
- Input de texto libre
- Se muestra en perfil
- Se guarda en BD

✅ **Idioma**
- Dropdown: Español / English
- Default: Español
- Se guarda en BD

✅ **Moneda**
- Dropdown: USD, MXN, EUR, GBP
- Default: USD
- Se guarda en BD

✅ **Zona Horaria**
- Dropdown: 5 opciones principales
- Default: America/Mexico_City
- Se guarda en BD

---

## 🔧 Endpoints API

### GET /api/user/profile
Obtiene el perfil del usuario actual.

```bash
curl http://localhost:3000/api/user/profile
```

Response:
```json
{
  "id": "...",
  "email": "user@gmail.com",
  "name": "Eduardo Pérez",
  "image": "https://...",
  "preferred_language": "es",
  "currency": "USD",
  "timezone": "America/Mexico_City"
}
```

### PATCH /api/user/profile
Actualiza el perfil (cualquier campo es opcional).

```bash
curl -X PATCH http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre", "currency": "MXN"}'
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "User not found" | Inicia sesión nuevamente con Google |
| "Database connection failed" | Verifica DATABASE_URL en .env.local |
| Modal no se abre | F12 → Console → Busca errores rojos |
| Los cambios no se guardan | F12 → Network → Busca POST /api/user/profile |

---

## 📊 Estructura de Datos

### Tabla users
```
id                  UUID         (generado automáticamente)
email              TEXT         (único)
name               TEXT         (tu nombre)
image              TEXT         (foto de perfil)
google_id          TEXT         (de OAuth)
preferred_language TEXT         (es / en)
currency           TEXT         (USD / MXN / EUR / GBP)
timezone           TEXT         (zona horaria)
created_at         TIMESTAMP    (cuándo se creó)
updated_at         TIMESTAMP    (cuándo se actualizó)
```

---

## 🔐 Seguridad

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Solo pueden editar su propio perfil
- ✅ Validación en servidor
- ✅ SQL injection protegido (Neon)

---

## 💡 Ejemplos de Uso

### Cambiar nombre desde el cliente
```javascript
// En Settings.tsx - ya está implementado
const handleSaveField = async (field, value) => {
  await fetch('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name: value })
  })
}
```

### Desde cualquier componente
```javascript
import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session } = useSession()
  
  // Acceso a preferencias
  const language = session?.user?.preferred_language // 'es' o 'en'
  const currency = session?.user?.currency           // 'USD', 'MXN', etc.
  const timezone = session?.user?.timezone           // 'America/Mexico_City', etc.
}
```

---

## 📝 Notas Importantes

1. **Sin Caché**: Los datos se cargan siempre que abres Settings
2. **Auto-actualización**: Después de cambiar, la sesión se actualiza automáticamente
3. **Validación**: El servidor valida todos los campos
4. **Defaults**: Si no estableces un valor, se usa el default

---

## 🚀 Próximos Pasos (Opcionales)

1. Agregar más idiomas (francés, portugués, etc.)
2. Agregar más zonas horarias
3. Permitir upload de foto de perfil
4. Agregar más preferencias (tema, notificaciones, etc.)
5. Historial de cambios

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde se guardan los datos?**
R: En Neon PostgreSQL, tabla `users`.

**P: ¿Necesito hacer algo especial después de cambiar?**
R: No, todo es automático. La sesión se actualiza después de cada cambio.

**P: ¿Puedo cambiar el email?**
R: Actualmente no. El email viene de Google OAuth y no es editable.

**P: ¿Los cambios son inmediatos?**
R: Sí. Se guardan en Neon y la sesión se actualiza al instante.

**P: ¿Qué pasa si hay un error?**
R: Se muestra un mensaje de error en el modal. Puedes intentar de nuevo.

---

## 📞 Soporte

Para problemas más complejos, revisar:
- `SETUP_PROFILE.md` - Guía detallada
- `PROFILE_IMPLEMENTATION.md` - Detalles técnicos
- Console del navegador (F12) - Errores
- Logs del servidor - Errores del backend

¡Listo para usar! 🎉
