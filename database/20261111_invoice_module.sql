-- Invoice module for the existing T.S. Serviceleistungen request app.
-- Applied to Supabase project mxsxctnhsuvjhcvymegy on 2026-11-11.
-- The legacy invoices table and Google Apps Script integration remain untouched.

create table if not exists public.invoice_settings (
  id smallint primary key default 1 check (id=1),
  seller_name text, seller_street text, seller_postal_code text, seller_city text,
  seller_country_code text not null default 'DE', seller_email text, seller_phone text,
  seller_website text, seller_tax_number text, seller_vat_id text,
  seller_bank_name text, seller_iban text, seller_bic text,
  payment_terms_days integer not null default 14 check(payment_terms_days between 0 and 365),
  tax_mode text not null default 'small_business' check(tax_mode='small_business'),
  invoice_prefix text not null default 'RE', cancellation_prefix text not null default 'ST',
  default_currency text not null default 'EUR', updated_at timestamptz not null default now()
);
create table if not exists public.issued_invoices (
  id uuid primary key default gen_random_uuid(), invoice_number text unique,
  document_type text not null default 'invoice' check(document_type in ('invoice','cancellation')),
  status text not null default 'draft' check(status in ('draft','issued','cancelled')),
  original_invoice_id uuid references public.issued_invoices(id) on delete restrict,
  cancellation_invoice_id uuid references public.issued_invoices(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null, customer_company text, customer_street text,
  customer_postal_code text, customer_city text, customer_country_code text not null default 'DE',
  customer_email text, customer_vat_id text, buyer_reference text,
  invoice_date date, service_date date, due_date date, currency text not null default 'EUR',
  tax_mode text not null default 'small_business' check(tax_mode='small_business'),
  tax_note text not null default 'Steuerbefreiung für Kleinunternehmer gemäß § 19 UStG.',
  subtotal numeric(12,2) not null default 0, tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0, amount_paid numeric(12,2) not null default 0,
  notes text, cancellation_reason text, seller_snapshot jsonb,
  issued_at timestamptz, cancelled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint invoice_original_type_check check (
    (document_type='invoice' and original_invoice_id is null) or
    (document_type='cancellation' and original_invoice_id is not null)
  )
);
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.issued_invoices(id) on delete cascade,
  position integer not null default 1, description text not null,
  quantity numeric(12,3) not null default 1 check(quantity>0),
  unit_code text not null default 'C62', unit_price numeric(12,2) not null default 0 check(unit_price>=0),
  line_total numeric(12,2) not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.issued_invoices(id) on delete restrict,
  payment_date date not null default current_date, amount numeric(12,2) not null check(amount>0),
  payment_method text not null default 'bank_transfer' check(payment_method in ('bank_transfer','cash','card','other')),
  reference text, notes text, created_at timestamptz not null default now()
);
create table if not exists public.invoice_documents (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.issued_invoices(id) on delete restrict,
  document_kind text not null check(document_kind in ('pdf','xrechnung_xml')),
  storage_path text not null, file_name text not null, mime_type text not null, sha256 text,
  created_at timestamptz not null default now(), unique(invoice_id,document_kind)
);
create table if not exists public.invoice_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.issued_invoices(id) on delete restrict,
  event_type text not null, description text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.invoice_number_sequences(year integer primary key,last_number bigint not null default 0);

alter table public.invoice_settings enable row level security;
alter table public.issued_invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.invoice_documents enable row level security;
alter table public.invoice_events enable row level security;
alter table public.invoice_number_sequences enable row level security;

drop policy if exists "owner manages invoice settings" on public.invoice_settings;
create policy "owner manages invoice settings" on public.invoice_settings for all to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner manages issued invoices" on public.issued_invoices;
create policy "owner manages issued invoices" on public.issued_invoices for all to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner manages invoice items" on public.invoice_items;
create policy "owner manages invoice items" on public.invoice_items for all to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner manages invoice payments" on public.invoice_payments;
create policy "owner manages invoice payments" on public.invoice_payments for all to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner manages invoice documents" on public.invoice_documents;
create policy "owner manages invoice documents" on public.invoice_documents for all to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner reads invoice events" on public.invoice_events;
create policy "owner reads invoice events" on public.invoice_events for select to authenticated
using ((select auth.jwt()->>'email')='info@ts-serviceleistungen.de');
drop policy if exists "owner manages invoice sequences" on public.invoice_number_sequences;
create policy "owner manages invoice sequences" on public.invoice_number_sequences for all to authenticated using(false) with check(false);

grant select,insert,update,delete on public.invoice_settings,public.issued_invoices,public.invoice_items,public.invoice_payments,public.invoice_documents to authenticated;
grant select on public.invoice_events to authenticated;

insert into public.invoice_settings(id,seller_name,seller_email,seller_phone,seller_website)
values(1,'T.S. Serviceleistungen','info@ts-serviceleistungen.de','09941/9349508','https://ts-serviceleistungen.de')
on conflict(id) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('issued-invoices','issued-invoices',false,20971520,array['application/pdf','application/xml','text/xml'])
on conflict(id) do update set public=false,file_size_limit=20971520,allowed_mime_types=array['application/pdf','application/xml','text/xml'];
drop policy if exists "owner manages issued invoice files" on storage.objects;
create policy "owner manages issued invoice files" on storage.objects for all to authenticated
using(bucket_id='issued-invoices' and (select auth.jwt()->>'email')='info@ts-serviceleistungen.de')
with check(bucket_id='issued-invoices' and (select auth.jwt()->>'email')='info@ts-serviceleistungen.de');

create or replace function public.guard_issued_invoice_changes()
returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' then
    if old.status<>'draft' then raise exception 'Ausgestellte Rechnungen dürfen nicht gelöscht werden. Bitte stornieren.'; end if;
    return old;
  end if;
  if old.status<>'draft' then
    if not (old.status='issued' and new.status='cancelled'
      and (to_jsonb(new)-array['status','cancelled_at','cancellation_reason','cancellation_invoice_id','updated_at'])=(to_jsonb(old)-array['status','cancelled_at','cancellation_reason','cancellation_invoice_id','updated_at']))
    and not (new.status=old.status and (to_jsonb(new)-array['amount_paid','updated_at'])=(to_jsonb(old)-array['amount_paid','updated_at'])) then
      raise exception 'Ausgestellte Rechnungen sind unveränderlich. Bitte einen Korrektur- oder Stornobeleg erstellen.';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_guard_issued_invoice_changes on public.issued_invoices;
create trigger trg_guard_issued_invoice_changes before update or delete on public.issued_invoices for each row execute function public.guard_issued_invoice_changes();

create or replace function public.guard_invoice_items()
returns trigger language plpgsql set search_path='' as $$
declare v_status text;
begin
  if tg_op='UPDATE' then
    select status into v_status from public.issued_invoices where id=old.invoice_id;
    if v_status is distinct from 'draft' then raise exception 'Positionen ausgestellter Rechnungen dürfen nicht verändert werden.'; end if;
  end if;
  select status into v_status from public.issued_invoices where id=case when tg_op='DELETE' then old.invoice_id else new.invoice_id end;
  if v_status is distinct from 'draft' then raise exception 'Positionen ausgestellter Rechnungen dürfen nicht verändert werden.'; end if;
  if tg_op='DELETE' then return old; end if; return new;
end; $$;
drop trigger if exists trg_guard_invoice_items on public.invoice_items;
create trigger trg_guard_invoice_items before insert or update or delete on public.invoice_items for each row execute function public.guard_invoice_items();

create or replace function public.guard_invoice_payment()
returns trigger language plpgsql set search_path='' as $$
declare v_invoice public.issued_invoices; declare v_existing numeric(12,2);
begin
  select * into v_invoice from public.issued_invoices where id=case when tg_op='DELETE' then old.invoice_id else new.invoice_id end;
  if not found or v_invoice.status<>'issued' or v_invoice.document_type<>'invoice' then raise exception 'Zahlungen können nur zu ausgestellten Rechnungen erfasst werden.'; end if;
  if tg_op='UPDATE' then select coalesce(sum(amount),0) into v_existing from public.invoice_payments where invoice_id=v_invoice.id and id<>old.id;
  else select coalesce(sum(amount),0) into v_existing from public.invoice_payments where invoice_id=v_invoice.id; end if;
  if tg_op<>'DELETE' and v_existing+new.amount>v_invoice.total then raise exception 'Der Zahlungseingang überschreitet den noch offenen Rechnungsbetrag.'; end if;
  if tg_op='DELETE' then return old; end if; return new;
end; $$;
drop trigger if exists trg_guard_invoice_payment on public.invoice_payments;
create trigger trg_guard_invoice_payment before insert or update or delete on public.invoice_payments for each row execute function public.guard_invoice_payment();

create or replace function public.refresh_invoice_paid_amount()
returns trigger language plpgsql set search_path='' as $$
declare v_invoice_id uuid; declare v_sum numeric(12,2);
begin
  if tg_op='UPDATE' and old.invoice_id<>new.invoice_id then
    select coalesce(sum(amount),0) into v_sum from public.invoice_payments where invoice_id=old.invoice_id;
    update public.issued_invoices set amount_paid=v_sum,updated_at=now() where id=old.invoice_id;
  end if;
  v_invoice_id:=case when tg_op='DELETE' then old.invoice_id else new.invoice_id end;
  select coalesce(sum(amount),0) into v_sum from public.invoice_payments where invoice_id=v_invoice_id;
  update public.issued_invoices set amount_paid=v_sum,updated_at=now() where id=v_invoice_id;
  if tg_op='DELETE' then return old; end if; return new;
end; $$;
drop trigger if exists trg_refresh_invoice_paid_amount on public.invoice_payments;
create trigger trg_refresh_invoice_paid_amount after insert or update or delete on public.invoice_payments for each row execute function public.refresh_invoice_paid_amount();

create or replace function public.issue_invoice(p_invoice_id uuid)
returns public.issued_invoices language plpgsql security definer set search_path='' as $$
declare v_invoice public.issued_invoices; declare v_settings public.invoice_settings; declare v_year integer; declare v_next bigint; declare v_subtotal numeric(12,2);
begin
  if (select auth.jwt()->>'email') is distinct from 'info@ts-serviceleistungen.de' then raise exception 'Nicht berechtigt'; end if;
  select * into v_invoice from public.issued_invoices where id=p_invoice_id for update;
  if not found or v_invoice.status<>'draft' or v_invoice.document_type<>'invoice' then raise exception 'Nur Rechnungsentwürfe können ausgestellt werden'; end if;
  select * into v_settings from public.invoice_settings where id=1;
  if not found or coalesce(v_settings.seller_name,'')='' or coalesce(v_settings.seller_street,'')='' or coalesce(v_settings.seller_postal_code,'')='' or coalesce(v_settings.seller_city,'')='' or (coalesce(v_settings.seller_tax_number,'')='' and coalesce(v_settings.seller_vat_id,'')='') then raise exception 'Bitte Firmendaten, Anschrift und Steuernummer oder USt-IdNr. vervollständigen'; end if;
  if coalesce(v_invoice.customer_name,'')='' or coalesce(v_invoice.customer_street,'')='' or coalesce(v_invoice.customer_postal_code,'')='' or coalesce(v_invoice.customer_city,'')='' then raise exception 'Bitte vollständige Kundenanschrift eintragen'; end if;
  if v_invoice.service_date is null then raise exception 'Bitte das Leistungsdatum eintragen'; end if;
  if not exists(select 1 from public.invoice_items where invoice_id=p_invoice_id) then raise exception 'Eine Rechnung benötigt mindestens eine Position'; end if;
  select round(sum(round(quantity*unit_price,2)),2) into v_subtotal from public.invoice_items where invoice_id=p_invoice_id;
  if coalesce(v_subtotal,0)<=0 then raise exception 'Rechnungsbetrag muss größer als 0 sein'; end if;
  v_year:=extract(year from current_date)::integer;
  insert into public.invoice_number_sequences(year,last_number) values(v_year,1) on conflict(year) do update set last_number=public.invoice_number_sequences.last_number+1 returning last_number into v_next;
  update public.invoice_items set line_total=round(quantity*unit_price,2) where invoice_id=p_invoice_id;
  update public.issued_invoices set invoice_number=coalesce(v_settings.invoice_prefix,'RE')||'-'||v_year||'-'||lpad(v_next::text,6,'0'),invoice_date=current_date,due_date=current_date+v_settings.payment_terms_days,subtotal=v_subtotal,tax_total=0,total=v_subtotal,issued_at=now(),status='issued',updated_at=now(),tax_mode='small_business',tax_note='Steuerbefreiung für Kleinunternehmer gemäß § 19 UStG.',seller_snapshot=jsonb_build_object('name',v_settings.seller_name,'street',v_settings.seller_street,'postal_code',v_settings.seller_postal_code,'city',v_settings.seller_city,'country_code',v_settings.seller_country_code,'email',v_settings.seller_email,'phone',v_settings.seller_phone,'website',v_settings.seller_website,'tax_number',v_settings.seller_tax_number,'vat_id',v_settings.seller_vat_id,'bank_name',v_settings.seller_bank_name,'iban',v_settings.seller_iban,'bic',v_settings.seller_bic) where id=p_invoice_id returning * into v_invoice;
  insert into public.invoice_events(invoice_id,event_type,description,metadata) values(p_invoice_id,'issued','Rechnung verbindlich ausgestellt',jsonb_build_object('invoice_number',v_invoice.invoice_number));
  return v_invoice;
end; $$;
revoke all on function public.issue_invoice(uuid) from public,anon;
grant execute on function public.issue_invoice(uuid) to authenticated;

create or replace function public.cancel_issued_invoice(p_invoice_id uuid,p_reason text)
returns public.issued_invoices language plpgsql security definer set search_path='' as $$
declare v_original public.issued_invoices; declare v_cancel public.issued_invoices; declare v_settings public.invoice_settings; declare v_year integer; declare v_next bigint;
begin
  if (select auth.jwt()->>'email') is distinct from 'info@ts-serviceleistungen.de' then raise exception 'Nicht berechtigt'; end if;
  select * into v_original from public.issued_invoices where id=p_invoice_id for update;
  if not found or v_original.status<>'issued' or v_original.document_type<>'invoice' then raise exception 'Nur ausgestellte, nicht stornierte Rechnungen können storniert werden'; end if;
  if coalesce(v_original.amount_paid,0)>0 then raise exception 'Bei bereits bezahlten Rechnungen bitte zuerst Rückerstattung und Stornierung klären'; end if;
  if coalesce(trim(p_reason),'')='' then raise exception 'Bitte einen Stornogrund angeben'; end if;
  select * into v_settings from public.invoice_settings where id=1;
  v_year:=extract(year from current_date)::integer;
  insert into public.invoice_number_sequences(year,last_number) values(v_year,1) on conflict(year) do update set last_number=public.invoice_number_sequences.last_number+1 returning last_number into v_next;
  insert into public.issued_invoices(document_type,status,original_invoice_id,order_id,offer_id,customer_id,customer_name,customer_company,customer_street,customer_postal_code,customer_city,customer_country_code,customer_email,customer_vat_id,buyer_reference,invoice_date,service_date,due_date,currency,tax_mode,tax_note,subtotal,tax_total,total,notes,cancellation_reason,issued_at,seller_snapshot,invoice_number)
  values('cancellation','draft',v_original.id,v_original.order_id,v_original.offer_id,v_original.customer_id,v_original.customer_name,v_original.customer_company,v_original.customer_street,v_original.customer_postal_code,v_original.customer_city,v_original.customer_country_code,v_original.customer_email,v_original.customer_vat_id,v_original.buyer_reference,current_date,v_original.service_date,current_date,v_original.currency,v_original.tax_mode,v_original.tax_note,-v_original.subtotal,0,-v_original.total,'Stornierung zu Rechnung '||v_original.invoice_number,p_reason,now(),v_original.seller_snapshot,coalesce(v_settings.cancellation_prefix,'ST')||'-'||v_year||'-'||lpad(v_next::text,6,'0')) returning * into v_cancel;
  insert into public.invoice_items(invoice_id,position,description,quantity,unit_code,unit_price,line_total) select v_cancel.id,position,'Storno: '||description,quantity,unit_code,unit_price,-line_total from public.invoice_items where invoice_id=v_original.id;
  update public.issued_invoices set status='issued' where id=v_cancel.id returning * into v_cancel;
  update public.issued_invoices set status='cancelled',cancellation_invoice_id=v_cancel.id,cancelled_at=now(),cancellation_reason=p_reason,updated_at=now() where id=v_original.id;
  insert into public.invoice_events(invoice_id,event_type,description,metadata) values(v_original.id,'cancelled','Rechnung storniert',jsonb_build_object('cancellation_invoice_id',v_cancel.id,'cancellation_number',v_cancel.invoice_number,'reason',p_reason));
  insert into public.invoice_events(invoice_id,event_type,description,metadata) values(v_cancel.id,'issued','Stornorechnung verbindlich ausgestellt',jsonb_build_object('original_invoice_id',v_original.id));
  return v_cancel;
end; $$;
revoke all on function public.cancel_issued_invoice(uuid,text) from public,anon;
grant execute on function public.cancel_issued_invoice(uuid,text) to authenticated;

-- Cover foreign keys used by invoice lists and payment/event lookups.
create index if not exists invoice_events_invoice_id_idx on public.invoice_events(invoice_id,created_at desc);
create index if not exists invoice_items_invoice_id_position_idx on public.invoice_items(invoice_id,position);
create index if not exists invoice_payments_invoice_id_date_idx on public.invoice_payments(invoice_id,payment_date);
create index if not exists issued_invoices_cancellation_invoice_id_idx on public.issued_invoices(cancellation_invoice_id);
create index if not exists issued_invoices_original_invoice_id_idx on public.issued_invoices(original_invoice_id);
create index if not exists issued_invoices_customer_id_idx on public.issued_invoices(customer_id);
create index if not exists issued_invoices_offer_id_idx on public.issued_invoices(offer_id);
create index if not exists issued_invoices_order_id_idx on public.issued_invoices(order_id);
create index if not exists issued_invoices_created_at_idx on public.issued_invoices(created_at desc);

-- XRechnung 3.0 mandatory endpoint/contact data and per-document output mode.
alter table public.invoice_settings add column if not exists seller_contact_name text;
alter table public.issued_invoices add column if not exists output_format text not null default 'pdf_xrechnung' check(output_format in ('pdf','pdf_xrechnung'));
alter table public.issued_invoices add column if not exists seller_identifier text;

-- Reissue RPC with XRechnung-specific mandatory field checks and seller snapshot.
create or replace function public.issue_invoice(p_invoice_id uuid)
returns public.issued_invoices language plpgsql security definer set search_path='' as $$
declare v_invoice public.issued_invoices; declare v_settings public.invoice_settings; declare v_year integer; declare v_next bigint; declare v_subtotal numeric(12,2);
begin
  if (select auth.jwt()->>'email') is distinct from 'info@ts-serviceleistungen.de' then raise exception 'Nicht berechtigt'; end if;
  select * into v_invoice from public.issued_invoices where id=p_invoice_id for update;
  if not found or v_invoice.status<>'draft' or v_invoice.document_type<>'invoice' then raise exception 'Nur Rechnungsentwürfe können ausgestellt werden'; end if;
  select * into v_settings from public.invoice_settings where id=1;
  if not found or coalesce(v_settings.seller_name,'')='' or coalesce(v_settings.seller_street,'')='' or coalesce(v_settings.seller_postal_code,'')='' or coalesce(v_settings.seller_city,'')='' or (coalesce(v_settings.seller_tax_number,'')='' and coalesce(v_settings.seller_vat_id,'')='') then raise exception 'Bitte Firmendaten, Anschrift und Steuernummer oder USt-IdNr. vervollständigen'; end if;
  if coalesce(v_invoice.customer_name,'')='' or coalesce(v_invoice.customer_street,'')='' or coalesce(v_invoice.customer_postal_code,'')='' or coalesce(v_invoice.customer_city,'')='' then raise exception 'Bitte vollständige Kundenanschrift eintragen'; end if;
  if v_invoice.service_date is null then raise exception 'Bitte das Leistungsdatum eintragen'; end if;
  if v_invoice.output_format='pdf_xrechnung' and (coalesce(v_settings.seller_contact_name,'')='' or coalesce(v_settings.seller_email,'')='' or coalesce(v_settings.seller_phone,'')='' or coalesce(v_invoice.customer_email,'')='' or coalesce(v_invoice.buyer_reference,'')='') then raise exception 'Für XRechnung fehlen Pflichtangaben: Ansprechpartner und Kontaktdaten des Verkäufers, Kunden-E-Mail oder Käuferreferenz. Alternativ PDF als Ausgabeformat wählen.'; end if;
  if not exists(select 1 from public.invoice_items where invoice_id=p_invoice_id) then raise exception 'Eine Rechnung benötigt mindestens eine Position'; end if;
  select round(sum(round(quantity*unit_price,2)),2) into v_subtotal from public.invoice_items where invoice_id=p_invoice_id;
  if coalesce(v_subtotal,0)<=0 then raise exception 'Rechnungsbetrag muss größer als 0 sein'; end if;
  v_year:=extract(year from current_date)::integer;
  insert into public.invoice_number_sequences(year,last_number) values(v_year,1) on conflict(year) do update set last_number=public.invoice_number_sequences.last_number+1 returning last_number into v_next;
  update public.invoice_items set line_total=round(quantity*unit_price,2) where invoice_id=p_invoice_id;
  update public.issued_invoices set invoice_number=coalesce(v_settings.invoice_prefix,'RE')||'-'||v_year||'-'||lpad(v_next::text,6,'0'),invoice_date=current_date,due_date=current_date+v_settings.payment_terms_days,subtotal=v_subtotal,tax_total=0,total=v_subtotal,issued_at=now(),status='issued',updated_at=now(),tax_mode='small_business',tax_note='Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG.',seller_snapshot=jsonb_build_object('name',v_settings.seller_name,'contact_name',v_settings.seller_contact_name,'street',v_settings.seller_street,'postal_code',v_settings.seller_postal_code,'city',v_settings.seller_city,'country_code',v_settings.seller_country_code,'email',v_settings.seller_email,'phone',v_settings.seller_phone,'website',v_settings.seller_website,'tax_number',v_settings.seller_tax_number,'vat_id',v_settings.seller_vat_id,'bank_name',v_settings.seller_bank_name,'iban',v_settings.seller_iban,'bic',v_settings.seller_bic) where id=p_invoice_id returning * into v_invoice;
  insert into public.invoice_events(invoice_id,event_type,description,metadata) values(p_invoice_id,'issued','Rechnung verbindlich ausgestellt',jsonb_build_object('invoice_number',v_invoice.invoice_number));
  return v_invoice;
end; $$;
revoke all on function public.issue_invoice(uuid) from public,anon;
grant execute on function public.issue_invoice(uuid) to authenticated;

-- Cancellation records inherit the original output format and references.
alter table public.invoice_settings add column if not exists seller_contact_name text;
alter table public.issued_invoices add column if not exists output_format text not null default 'pdf_xrechnung' check(output_format in ('pdf','pdf_xrechnung'));
alter table public.issued_invoices add column if not exists seller_identifier text;
