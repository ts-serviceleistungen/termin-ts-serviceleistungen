-- Add covering indexes for frequently used foreign-key lookups in the T.S. request and calendar app.
-- These indexes do not change application data or access policies.
create index if not exists request_booking_blocks_request_id_idx
  on public.request_booking_blocks (request_id);

create index if not exists request_photos_request_id_idx
  on public.request_photos (request_id);

create index if not exists calendar_manual_events_created_by_idx
  on public.calendar_manual_events (created_by);

create index if not exists gallery_images_created_by_idx
  on public.gallery_images (created_by);
