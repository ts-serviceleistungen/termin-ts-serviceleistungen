-- The public availability RPC is intentionally callable without login:
-- the request form needs busy time windows to prevent double bookings.
-- Limit each lookup to 31 calendar days so the public endpoint cannot be used
-- for unbounded calendar exports. It returns time windows only, never event labels.
create or replace function public.get_all_booked_windows(p_from date, p_to date)
returns table(booking_start timestamptz, booking_end timestamptz)
language plpgsql
security definer
set search_path = public
as $function$
begin
  if p_from is null or p_to is null then
    raise exception 'Start- und Enddatum müssen angegeben werden.'
      using errcode = '22004';
  end if;

  if p_to < p_from or p_to > p_from + 31 then
    raise exception 'Der Abfragezeitraum darf höchstens 32 Kalendertage umfassen.'
      using errcode = '22023';
  end if;

  return query
  select b.booking_start, b.booking_end
  from public.request_booking_blocks b
  where b.booking_start < ((p_to + 1)::timestamp at time zone 'Europe/Berlin')
    and b.booking_end > (p_from::timestamp at time zone 'Europe/Berlin')

  union all

  select p.start_time, p.end_time
  from public.personal_calendar_events p
  where p.blocks_customer_bookings = true
    and p.start_time < ((p_to + 1)::timestamp at time zone 'Europe/Berlin')
    and p.end_time > (p_from::timestamp at time zone 'Europe/Berlin')

  order by booking_start;
end;
$function$;

revoke all on function public.get_all_booked_windows(date,date) from public;
grant execute on function public.get_all_booked_windows(date,date) to anon, authenticated;
