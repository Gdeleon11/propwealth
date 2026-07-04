# PropWealth - Checklist de Instalación

## Pre-Instalación

- [ ] Acceso a Neon Console (https://console.neon.tech/)
- [ ] DATABASE_URL en .env.local
- [ ] Node.js instalado (v18+)
- [ ] npm o yarn funcionando

---

## Paso 1: Base de Datos (2 minutos)

### Opción A: Schema Completo (RECOMENDADO)

- [ ] Abre `neon-schema.sql` en el editor
- [ ] Copia TODO el contenido
- [ ] Ve a Neon Console → SQL Editor
- [ ] Pega el contenido
- [ ] Click "Execute" (o Cmd+Enter)
- [ ] Espera confirmación

**Verificación:**
```sql
-- Pega esto en Neon SQL Editor:
SELECT COUNT(*) FROM users;
```
- [ ] Retorna 0 (tabla vacía pero existente)

### Opción B: Solo Tabla Users

- [ ] Abre `migrations/001_create_users_table.sql`
- [ ] Copia TODO el contenido
- [ ] Ve a Neon Console → SQL Editor
- [ ] Pega el contenido
- [ ] Click "Execute"
- [ ] Espera confirmación

**Verificación:**
```sql
-- Pega esto en Neon SQL Editor:
SELECT * FROM users LIMIT 1;
```
- [ ] Muestra estructura sin errores

### Opción C: Desde Terminal (avanzado)

- [ ] Tienes psql instalado
- [ ] DATABASE_URL disponible
- [ ] Ejecuta:
  ```bash
  psql $DATABASE_URL < migrations/001_create_users_table.sql
  ```
- [ ] No hay errores

---

## Paso 2: Backend (30 segundos)

### Verificar Archivos

- [ ] Existe: `app/api/user/profile/route.ts` (133 líneas)
- [ ] Existe: `app/api/auth/[...nextauth]/route.ts` (actualizado)
- [ ] Existe: `components/Settings.tsx` (370+ líneas)

### Verificar Código

En `app/api/auth/[...nextauth]/route.ts`:
- [ ] Línea ~52: `(session.user as any).preferred_language = ...`
- [ ] Línea ~53: `(session.user as any).currency = ...`
- [ ] Línea ~54: `(session.user as any).timezone = ...`

En `components/Settings.tsx`:
- [ ] Línea ~1: `'use client'`
- [ ] Línea ~4: `import { useSession } from 'next-auth/react'`
- [ ] Línea ~130: `const fetchProfile = async () => {`

---

## Paso 3: Dev Server (1 minuto)

### Iniciar

```bash
npm run dev
```

- [ ] Sin errores TypeScript
- [ ] Sin errores en consola
- [ ] Server corriendo en http://localhost:3000

### Verificar Rutas

- [ ] `http://localhost:3000/` → Funciona
- [ ] `http://localhost:3000/settings` → Carga (redirige a login si no autenticado)
- [ ] `http://localhost:3000/api/user/profile` → Error 401 (correcto, sin sesión)

---

## Paso 4: Testing en App (5 minutos)

### Login

- [ ] Ve a `http://localhost:3000/settings`
- [ ] Haz click en "Iniciar sesión"
- [ ] Selecciona "Google"
- [ ] Usa tu cuenta de Google
- [ ] Acepta permisos
- [ ] Redirige a `/settings`

### Verificar Datos

- [ ] Ves tu nombre (o "Usuario" si no está establecido)
- [ ] Ves tu email
- [ ] Ves avatar o inicial (si tiene imagen)
- [ ] Sección "PREFERENCIAS" visible

### Editar Nombre

- [ ] Haz click en botón "EDITAR"
- [ ] Se abre modal
- [ ] Input tiene tu nombre actual (o vacío)
- [ ] Escribe un nuevo nombre
- [ ] Click "GUARDAR"
- [ ] Modal se cierra
- [ ] Nombre actualizado en pantalla
- [ ] Sin errores en consola (F12)

### Editar Idioma

- [ ] Haz click en "Idioma"
- [ ] Se abre modal con dropdown
- [ ] Opciones: "Español", "English"
- [ ] Selecciona idioma diferente
- [ ] Click "GUARDAR"
- [ ] Modal se cierra
- [ ] Idioma actualizado en pantalla
- [ ] Sin errores

### Editar Moneda

- [ ] Haz click en "Moneda"
- [ ] Se abre modal con dropdown
- [ ] Opciones: USD, MXN, EUR, GBP
- [ ] Selecciona moneda diferente
- [ ] Click "GUARDAR"
- [ ] Modal se cierra
- [ ] Moneda actualizada
- [ ] Sin errores

### Editar Zona Horaria

- [ ] Haz click en "Zona horaria"
- [ ] Se abre modal con dropdown
- [ ] Opciones: 5 zonas horarias
- [ ] Selecciona diferente
- [ ] Click "GUARDAR"
- [ ] Modal se cierra
- [ ] Zona actualizada
- [ ] Sin errores

### Verificar en BD

En Neon SQL Editor:
```sql
SELECT name, preferred_language, currency, timezone 
FROM users 
WHERE email = 'tu@email.com';
```

- [ ] Retorna 1 fila
- [ ] `name` = lo que escribiste
- [ ] `preferred_language` = lo que seleccionaste
- [ ] `currency` = lo que seleccionaste
- [ ] `timezone` = lo que seleccionaste

### Verificar API

En navegador console (F12 → Console):
```javascript
fetch('/api/user/profile').then(r => r.json()).then(console.log)
```

- [ ] Retorna JSON con tu perfil
- [ ] `preferred_language`, `currency`, `timezone` presentes
- [ ] Valores correctos

---

## Paso 5: Limpiar (Opcional)

- [ ] Cierra dev server (Ctrl+C)
- [ ] Borra node_modules y reinstala si hay problemas
- [ ] Borra .next folder si hay problemas de caché

---

## Troubleshooting

### Error: "User not found" en app

**Causa**: Usuario no existe en BD

**Solución**:
- [ ] En Neon SQL Editor:
  ```sql
  SELECT * FROM users WHERE email = 'tu@email.com';
  ```
- [ ] Si no existe fila, inicia sesión de nuevo
- [ ] Si existe, verifica que email es exacto

### Error: "Database connection failed"

**Causa**: DATABASE_URL no configurado

**Solución**:
- [ ] Verifica `.env.local` tiene `DATABASE_URL`
- [ ] Copia URL exacta de Neon Console
- [ ] Incluye `?sslmode=require`
- [ ] Reinicia dev server

### Error: TypeScript en Settings.tsx

**Causa**: Código no compilado correctamente

**Solución**:
- [ ] Cierra dev server
- [ ] Borra `.next/` folder
- [ ] Ejecuta `npm run dev` de nuevo
- [ ] Espera compilación completa

### Modal no se abre

**Causa**: Error en JavaScript o React

**Solución**:
- [ ] Abre F12 → Console
- [ ] Busca errores rojos
- [ ] Revisa que `components/Settings.tsx` está bien
- [ ] Reinicia dev server

### Los cambios no se guardan

**Causa**: Error en API o validación

**Solución**:
- [ ] F12 → Network
- [ ] Haz cambio en modal
- [ ] Busca POST request a `/api/user/profile`
- [ ] Mira response status (200, 400, 500)
- [ ] Lee mensaje de error si 400/500

### "Invalid language" / "Invalid currency"

**Causa**: Valor no permitido en validación

**Solución**:
- [ ] Solo usa: es, en (idiomas)
- [ ] Solo usa: USD, MXN, EUR, GBP (monedas)
- [ ] Verifica en `components/Settings.tsx` opciones válidas

---

## Estado Final

Cuando todo esté correcto, deberías ver:

✅ Dev server corriendo sin errores
✅ Settings carga datos reales
✅ Modales funcionan
✅ Los cambios se guardan en Neon
✅ API responde correctamente
✅ No hay errores en consola del navegador
✅ Sesión se actualiza automáticamente

---

## Siguientes Pasos

Una vez todo funcione:

1. Lee `QUICK_START.md` para usar en producción
2. Lee `SETUP_PROFILE.md` para expandir funcionalidad
3. Lee `PROFILE_IMPLEMENTATION.md` para detalles técnicos
4. Agrega más idiomas/monedas según necesites
5. Integra con otros componentes si necesitas

---

## Soporte

Si algo no funciona:

1. Revisa este checklist
2. Revisa console (F12) para errores
3. Revisa logs de dev server
4. Revisa Neon SQL Editor para estructura BD
5. Abre cada .md para documentación específica

¡Éxito! 🎉
