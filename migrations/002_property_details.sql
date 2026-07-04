-- ============================================================
-- PropWealth — Migración 002: detalles de propiedad
-- Pegar completo en: Neon Console > SQL Editor > Run
-- Es idempotente: se puede correr varias veces sin problema.
-- ============================================================

-- Ubicación (mapa)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lat NUMERIC(10,6);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lng NUMERIC(10,6);

-- Galería de fotos (array de URLs o data URLs)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Servicios incluidos: [{ "name": "Agua Potable", "active": true }]
ALTER TABLE properties ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Próximos mantenimientos: [{ "title": "Revisión A/C", "date": "2026-10-22" }]
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Documentos: [{ "name": "Contrato.pdf", "data": "data:application/pdf;base64,..." }]
ALTER TABLE properties ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb;

-- La columna image_url (foto de portada) ya existe desde el esquema base.
