-- ============================================================
-- PropWealth — Neon Schema
-- Pegar completo en: Neon Console > SQL Editor
-- ============================================================

-- PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  address          TEXT        NOT NULL,
  type             TEXT        NOT NULL DEFAULT 'Apartamento',
  status           TEXT        NOT NULL DEFAULT 'available'
                               CHECK (status IN ('rented','available','maintenance')),
  monthly_rent     NUMERIC(12,2) NOT NULL DEFAULT 0,
  purchase_value   NUMERIC(14,2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(12,2) NOT NULL DEFAULT 0,
  occupancy_pct    NUMERIC(5,2)  NOT NULL DEFAULT 0,
  roi_pct          NUMERIC(5,2)  NOT NULL DEFAULT 0,
  cash_flow        NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TENANTS
CREATE TABLE IF NOT EXISTS tenants (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID  REFERENCES properties(id) ON DELETE SET NULL,
  full_name      TEXT  NOT NULL,
  email          TEXT  NOT NULL,
  phone          TEXT,
  contract_start DATE  NOT NULL,
  contract_end   DATE  NOT NULL,
  payment_status TEXT  NOT NULL DEFAULT 'pending'
                       CHECK (payment_status IN ('paid','pending','overdue')),
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROVIDERS
CREATE TABLE IF NOT EXISTS providers (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT    NOT NULL,
  category         TEXT    NOT NULL,
  rating           NUMERIC(3,1) NOT NULL DEFAULT 5.0
                            CHECK (rating >= 1 AND rating <= 5),
  properties_count INTEGER NOT NULL DEFAULT 0,
  phone            TEXT,
  email            TEXT,
  avatar_url       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  entity      TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount      NUMERIC(12,2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'processed'
              CHECK (status IN ('processed','pending','failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Seed data — datos de ejemplo
-- ============================================================
INSERT INTO properties (name, address, type, status, monthly_rent, purchase_value, security_deposit, occupancy_pct, roi_pct, cash_flow)
VALUES
  ('Skyline Loft 402',   '1245 Fifth Ave, New York, NY',       'Apartamento', 'rented',      2100, 320000, 4200,  100, 8.2, 1400),
  ('Oakwood Estates',    '722 Oak Lane, Greenwich, CT',        'Casa',        'available',   3450, 610000, 6900,    0, 6.8,    0),
  ('Harborview Loft',    '21 Waterfront Way, Boston, MA',      'Apartamento', 'maintenance', 1850, 298000, 3700,  100, 7.4,  950),
  ('The Apex Penthouse', '1 Central Park South, New York, NY', 'Apartamento', 'rented',      8500, 820000, 17000, 100,12.5, 5200);

INSERT INTO tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
SELECT id, 'Alexander Sterling', 'alex.sterling@email.com', '+1 555 0101', '2023-01-15', '2025-01-14', 'paid'
FROM properties WHERE name = 'Skyline Loft 402';

INSERT INTO tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
SELECT id, 'Elena Martinez', 'e.martinez@corp.net', '+1 555 0202', '2023-02-01', '2025-06-05', 'pending'
FROM properties WHERE name = 'Harborview Loft';

INSERT INTO tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
SELECT id, 'Sarah Chen', 'schen.design@web.com', '+1 555 0303', '2022-07-01', '2025-06-20', 'paid'
FROM properties WHERE name = 'The Apex Penthouse';

INSERT INTO tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
SELECT id, 'Julian Wagner', 'jwagner.fin@invest.com', '+1 555 0404', '2023-03-01', '2025-11-15', 'paid'
FROM properties WHERE name = 'Skyline Loft 402';

INSERT INTO providers (name, category, rating, properties_count, phone, email)
VALUES
  ('Rodriguez Plumbing Solutions', 'Plomería',     4.9, 12, '+1 555 1001', 'rodriguez@plumbing.com'),
  ('Volts & Amps Electrical',      'Electricidad', 4.7,  8, '+1 555 1002', 'info@voltsamps.com'),
  ('Elite Cleaning Services',      'Limpieza',     5.0, 24, '+1 555 1003', 'elite@cleaning.com'),
  ('Apex Legal Partners',          'Legal',        4.8,  5, '+1 555 1004', 'contact@apexlegal.com');

INSERT INTO transactions (entity, type, amount, status)
VALUES
  ('Skyline Tower Maint.',      'expense',  2450,  'processed'),
  ('Metro Hub Rent Collection', 'income',  14200,  'processed'),
  ('Apt 402 • Skyline',         'income',   2450,  'processed'),
  ('Unidad 12 • Riverside',     'income',   1800,  'processed'),
  ('Suite A • Business Hub',    'income',   4200,  'processed');
