drop policy if exists "Authenticated users delete website gallery files" on storage.objects;
drop policy if exists "Authenticated users update website gallery files" on storage.objects;
drop policy if exists "Authenticated users upload website gallery files" on storage.objects;

create policy "TS owner delete website gallery files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'website-gallery'
  and (auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de'
);

create policy "TS owner update website gallery files"
on storage.objects for update to authenticated
using (
  bucket_id = 'website-gallery'
  and (auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de'
)
with check (
  bucket_id = 'website-gallery'
  and (auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de'
);

create policy "TS owner upload website gallery files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'website-gallery'
  and (auth.jwt() ->> 'email') = 'info@ts-serviceleistungen.de'
);