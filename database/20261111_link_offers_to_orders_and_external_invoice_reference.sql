alter table public.offers
  add column if not exists order_id uuid null references public.orders(id) on delete set null;

create index if not exists offers_order_id_idx on public.offers(order_id);

alter table public.orders
  add column if not exists external_invoice_number text null;

comment on column public.offers.order_id is 'Optional link to the related order; imported Google Drive offers remain unlinked until assigned.';
comment on column public.orders.external_invoice_number is 'Optional reference to an invoice created in the external invoicing program; no invoice is generated here.';
