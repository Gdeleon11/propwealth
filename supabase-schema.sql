-- ============================================================
-- PropWealth — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- PROPERTIES
create table if not exists public.properties (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  address          text not null,
  type             text not null default 'Apartamento',
  status           text not null default 'available'
                     check (status in ('rented','available','maintenance')),
  monthly_rent     numeric(12,2) not null default 0,
  purchase_value   numeric(14,2) not null default 0,
  security_deposit numeric(12,2) not null default 0,
  occupancy_pct    numeric(5,2)  not null default 0,
  roi_pct          numeric(5,2)  not null default 0,
  cash_flow        numeric(12,2) not null default 0,
  image_url        text,
  created_at       timestamptz not null default now()
);

-- TENANTS
create table if not exists public.tenants (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid references public.properties(id) on delete set null,
  full_name      text not null,
  email          text not null,
  phone          text,
  contract_start date not null,
  contract_end   date not null,
  payment_status text not null default 'pending'
                   check (payment_status in ('paid','pending','overdue')),
  avatar_url     text,
  created_at     timestamptz not null default now()
);

-- PROVIDERS
create table if not exists public.providers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,
  rating           numeric(3,1) not null default 5.0
                     check (rating >= 1 and rating <= 5),
  properties_count integer not null default 0,
  phone            text,
  email            text,
  avatar_url       text,
  created_at       timestamptz not null default now()
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  entity      text not null,
  type        text not null check (type in ('income','expense')),
  amount      numeric(12,2) not null,
  status      text not null default 'processed'
                check (status in ('processed','pending','failed')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS) — habilitar y permitir todo por ahora
-- Después puedes agregar auth y restricciones por usuario
-- ============================================================
alter table public.properties   enable row level security;
alter table public.tenants      enable row level security;
alter table public.providers    enable row level security;
alter table public.transactions enable row level security;

-- Políticas públicas (MVP sin auth — cambiar cuando agregues login)
create policy "Allow all properties"   on public.properties   for all using (true) with check (true);
create policy "Allow all tenants"      on public.tenants      for all using (true) with check (true);
create policy "Allow all providers"    on public.providers    for all using (true) with check (true);
create policy "Allow all transactions" on public.transactions for all using (true) with check (true);

-- ============================================================
-- Seed Data — datos de ejemplo para ver la app funcionando
-- ============================================================
insert into public.properties (name, address, type, status, monthly_rent, purchase_value, security_deposit, occupancy_pct, roi_pct, cash_flow)
values
  ('Skyline Loft 402',   '1245 Fifth Ave, New York, NY',       'Apartamento', 'rented',      2100, 320000, 4200,  100, 8.2, 1400),
  ('Oakwood Estates',    '722 Oak Lane, Greenwich, CT',        'Casa',        'available',   3450, 610000, 6900,    0, 6.8,    0),
  ('Harborview Loft',    '21 Waterfront Way, Boston, MA',      'Apartamento', 'maintenance', 1850, 298000, 3700,  100, 7.4,  950),
  ('The Apex Penthouse', '1 Central Park South, New York, NY', 'Apartamento', 'rented',      8500, 820000, 17000, 100,12.5, 5200);

insert into public.tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
select id, 'Alexander Sterling', 'alex.sterling@email.com', '+1 555 0101', '2023-01-15', '2025-01-14', 'paid'
  from public.properties where name = 'Skyline Loft 402';

insert into public.tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
select id, 'Elena Martinez', 'e.martinez@corp.net', '+1 555 0202', '2023-02-01', '2024-01-05', 'pending'
  from public.properties where name = 'Harborview Loft';

insert into public.tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status)
select id, 'Sarah Chen', 'schen.design@web.com', '+1 555 0303', '2022-07-01', '2024-06-20', 'paid'
  from public.properties where name = 'The Apex Penthouse';

insert into public.providers (name, category, rating, properties_count, phone, email)
values
  ('Rodriguez Plumbing Solutions', 'Plomería',    4.9, 12, '+1 555 1001', 'rodriguez@plumbing.com'),
  ('Volts & Amps Electrical',      'Electricidad',4.7,  8, '+1 555 1002', 'info@voltsamps.com'),
  ('Elite Cleaning Services',      'Limpieza',    5.0, 24, '+1 555 1003', 'elite@cleaning.com'),
  ('Apex Legal Partners',          'Legal',       4.8,  5, '+1 555 1004', 'contact@apexlegal.com');

insert into public.transactions (entity, type, amount, status)
values
  ('Skyline Tower Maint.',     'expense',  2450, 'processed'),
  ('Metro Hub Rent Collection','income',  14200, 'processed'),
  ('Apt 402 • Skyline',        'income',   2450, 'processed'),
  ('Unidad 12 • Riverside',    'income',   1800, 'processed'),
  ('Suite A • Business Hub',   'income',   4200, 'processed');
