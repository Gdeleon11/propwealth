# Testing del Perfil y Preferencias

## ✅ Componentes Implementados

1. **API `/api/user/profile`**
   - GET: Obtiene perfil del usuario autenticado
   - PATCH: Actualiza nombre, idioma, moneda, zona horaria

2. **Settings.tsx**
   - Carga datos reales desde la API
   - Modal editable para cada campo
   - Guardado automático en Neon
   - Actualiza la sesión después de cambios

3. **Base de Datos**
   - Tabla `users` con columnas: preferred_language, currency, timezone
   - Defaults: es, USD, America/Mexico_City

4. **Tipos TypeScript**
   - next-auth.d.ts actualizado con las nuevas propiedades

## 🧪 Cómo Probar (5 minutos)

### Paso 1: Asegurar que la tabla de usuarios existe
```bash
# En Neon SQL Editor, ejecuta:
SELECT * FROM users LIMIT 1;
```
Debería mostrar las columnas: id, email, name, image, google_id, preferred_language, currency, timezone

### Paso 2: Reiniciar dev server
```bash
npm run dev
```

### Paso 3: Login y editar perfil
1. Accede a http://localhost:3000
2. Haz login con Google (usa una cuenta Google cualquiera)
3. Ve a Settings (icono de engranaje)
4. Haz clic en "EDITAR" junto a tu nombre
5. Cambia el nombre, guarda
6. Haz clic en cualquier preferencia (Idioma, Moneda, Zona horaria)
7. Selecciona un valor diferente
8. Guarda

### Paso 4: Verificar cambios
- El nombre debe cambiar inmediatamente
- Las preferencias deben reflejarse en la sesión
- Recarga la página → los cambios persisten

### Paso 5: Probar nuevo usuario
1. Cierra sesión (botón "CERRAR SESIÓN" en Settings)
2. Haz login con una SEGUNDA cuenta Google diferente
3. Ve a Settings
4. Debería mostrar el nombre de esa cuenta
5. Las preferencias deben ser los defaults (español, USD, México)
6. Edita y cambia las preferencias
7. Verifica que se guardan

## 📋 Checklist de Validación

- [ ] Puedo editar mi nombre
- [ ] Puedo cambiar el idioma
- [ ] Puedo cambiar la moneda
- [ ] Puedo cambiar la zona horaria
- [ ] Los cambios se guardan en la BD
- [ ] Los cambios persisten después de recargar
- [ ] Puedo hacer logout
- [ ] Puedo hacer login con otra cuenta Google
- [ ] Cada usuario ve solo sus propios datos
- [ ] Las preferencias por defecto son correctas

## 🐛 Si Hay Errores

### Error: "Unauthorized" al acceder a /api/user/profile
- Verifica que estés logueado (session debe existir)

### Error: "Database connection failed"
- Verifica que DATABASE_URL está en .env.local
- Verifica que tienes conexión a Neon

### Error: "User not found"
- La cuenta debe existir en la tabla users
- Verifica que el email del usuario está en la BD

### Error de compilación TypeScript
- Ejecuta `npm run build` para ver errores específicos
- Los tipos de next-auth deben estar importados

## 🎯 Próximas Funcionalidades (opcional)

- [ ] Cambiar foto de perfil
- [ ] Cambiar contraseña (requiere email/password provider)
- [ ] Autenticación de dos factores
- [ ] Notificaciones personalizables
- [ ] Exportar datos del usuario

---

Si todo funciona como se describe arriba, ¡estás listo para usar las nuevas funcionalidades!
