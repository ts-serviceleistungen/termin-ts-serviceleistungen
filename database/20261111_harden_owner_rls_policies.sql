-- Restrict gallery management to the T.S. owner account.
-- Public visitors retain read-only access to published gallery entries.
drop policy if exists "Authenticated users manage gallery images" on public.gallery_images;
create policy "ts_owner manage gallery images"
on public.gallery_images
for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

-- Evaluate the owner claim once per statement rather than once per row.
drop policy if exists "ts_owner manage manual calendar events" on public.calendar_manual_events;
create policy "ts_owner manage manual calendar events"
on public.calendar_manual_events for all to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner manage customers" on public.customers;
create policy "ts_owner manage customers"
on public.customers for all to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner manage invoices" on public.invoices;
create policy "ts_owner manage invoices"
on public.invoices for all to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner manage offers" on public.offers;
create policy "ts_owner manage offers"
on public.offers for all to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner manage personal calendar events" on public.personal_calendar_events;
create policy "ts_owner manage personal calendar events"
on public.personal_calendar_events for all to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can delete booking blocks" on public.request_booking_blocks;
create policy "ts_owner can delete booking blocks"
on public.request_booking_blocks for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can read booking blocks" on public.request_booking_blocks;
create policy "ts_owner can read booking blocks"
on public.request_booking_blocks for select to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can delete request photos" on public.request_photos;
create policy "ts_owner can delete request photos"
on public.request_photos for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can read request photos" on public.request_photos;
create policy "ts_owner can read request photos"
on public.request_photos for select to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can delete requests" on public.requests;
create policy "ts_owner can delete requests"
on public.requests for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can read requests" on public.requests;
create policy "ts_owner can read requests"
on public.requests for select to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');

drop policy if exists "ts_owner can update requests" on public.requests;
create policy "ts_owner can update requests"
on public.requests for update to authenticated
using ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de')
with check ((select auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de');
