
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'AUF-' || to_char(now(), 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  request_id uuid unique references public.requests(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'Offen'
    check (status in ('Offen', 'Geplant', 'In Arbeit', 'Abgeschlossen', 'Storniert')),
  service_type text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  description text,
  scheduled_date date,
  scheduled_time text,
  estimated_hours numeric(8,2),
  agreed_amount numeric(12,2) not null default 0 check (agreed_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_created_at_idx
  on public.orders(status, created_at desc);
create index if not exists orders_customer_id_idx
  on public.orders(customer_id);
create index if not exists orders_scheduled_date_idx
  on public.orders(scheduled_date);

alter table public.orders enable row level security;

drop policy if exists "Owner manages orders" on public.orders;
create policy "Owner manages orders"
  on public.orders
  for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
  with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

revoke all on public.orders from anon, public;
grant select, insert, update, delete on public.orders to authenticated;
