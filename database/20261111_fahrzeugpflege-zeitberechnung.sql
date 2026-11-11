-- Fahrzeugpflege: genaue Abgabezeit, Fahrzeugklasse, Aufwandszuschläge, Werktage und 30-Minuten-Puffer
alter table public.requests add column if not exists vehicle_class text;

CREATE OR REPLACE FUNCTION public.calculate_vehicle_care_duration(p_vehicle_type text, p_care_options text[], p_dirt_level text, p_pet_hair text)
 RETURNS TABLE(duration_hours numeric, duration_label text)
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_options text[] := coalesce(p_care_options, '{}'::text[]);
  v_base numeric := 0;
  v_factor numeric := 1;
  v_extra numeric := 0;
  v_total numeric := 0;
  v_hours_text text;
begin
  if 'Komplettaufbereitung' = any(v_options) then
    v_base := 4;
  else
    if 'Außenreinigung' = any(v_options) then v_base := v_base + 1.5; end if;
    if 'Innenraumreinigung' = any(v_options) then v_base := v_base + 2.5; end if;
  end if;
  if 'Polsterreinigung' = any(v_options) then v_base := v_base + 2; end if;
  if 'Politur' = any(v_options) then v_base := v_base + 4; end if;
  if 'Lackversiegelung' = any(v_options) then v_base := v_base + 2; end if;
  if v_base = 0 then v_base := 2; end if;

  v_factor := case lower(trim(coalesce(p_vehicle_type, '')))
    when 'kleinwagen' then 0.9
    when 'kompaktklasse' then 1.0
    when 'mittelklasse' then 1.1
    when 'suv' then 1.2
    when 'suv / geländewagen' then 1.2
    when 'transporteur' then 1.35
    when 'transporter' then 1.35
    when 'wohnmobil' then 1.5
    when 'sonstiges' then 1.15
    when 'pkw' then 1.0
    else 1.0
  end;

  v_extra := case coalesce(p_dirt_level, 'Normal')
    when 'Stark' then 0.5
    when 'Sehr stark' then 1.0
    else 0
  end;
  v_extra := v_extra + case coalesce(p_pet_hair, 'Nein')
    when 'Ja – gering' then 0.5
    when 'Ja – mittel' then 1.0
    when 'Ja – stark' then 1.5
    else 0
  end;

  v_total := round(ceil((v_base * v_factor + v_extra) * 2) / 2, 1);
  duration_hours := v_total;
  if v_total = 8 then
    duration_label := '1 Arbeitstag';
  else
    v_hours_text := to_char(v_total, 'FM999990.0');
    if right(v_hours_text, 2) = '.0' then
      v_hours_text := left(v_hours_text, length(v_hours_text) - 2);
    end if;
    duration_label := replace(v_hours_text, '.', ',') || ' Stunden';
  end if;
  return next;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rebuild_request_booking_blocks(p_request_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_request record;
  v_duration record;
  v_day date;
  v_remaining numeric;
  v_segment_hours numeric;
  v_start timestamptz;
  v_end timestamptz;
  v_requested_time time;
  v_marker text;
  v_first_day boolean := true;
begin
  delete from public.request_booking_blocks where request_id = p_request_id;

  select id,status,service_type,care_options,requested_date,requested_time,
         vehicle_type,vehicle_class,dirt_level,pet_hair,first_name,last_name
  into v_request
  from public.requests where id = p_request_id;

  if not found then return; end if;
  if v_request.status <> 'Bestätigt' or v_request.requested_date is null then return; end if;

  if v_request.service_type = 'Fahrzeugpflege' then
    select * into v_duration
    from public.calculate_vehicle_care_duration(
      v_request.vehicle_class, v_request.care_options, v_request.dirt_level, v_request.pet_hair
    );

    if coalesce(v_request.requested_time, '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'Bitte eine gültige Abgabezeit im Format HH:MM auswählen.';
    end if;
    v_requested_time := v_request.requested_time::time;
    if v_requested_time < time '08:00' or v_requested_time > time '16:00' then
      raise exception 'Die Abgabezeit muss zwischen 08:00 und 16:00 Uhr liegen.';
    end if;
    if extract(isodow from v_request.requested_date) in (6,7) then
      raise exception 'Fahrzeugpflege-Termine können nur von Montag bis Freitag angefragt werden.';
    end if;

    update public.requests
    set duration_hours = v_duration.duration_hours,
        duration_label = v_duration.duration_label
    where id = p_request_id;

    v_day := v_request.requested_date;
    v_remaining := v_duration.duration_hours;
    v_marker := 'Kundentermin – ' ||
      coalesce(nullif(trim(concat_ws(' ', v_request.first_name, v_request.last_name)), ''), 'Kunde') ||
      ' – ' || coalesce(v_request.service_type, 'Leistung');

    -- Jeder Arbeitstag erhält höchstens acht Stunden; der erste beginnt exakt zur gewählten Abgabezeit.
    while v_remaining > 0 loop
      if not v_first_day then
        while extract(isodow from v_day) in (6,7) loop v_day := v_day + 1; end loop;
        v_start := (v_day + time '08:00') at time zone 'Europe/Berlin';
      else
        v_start := (v_day + v_requested_time) at time zone 'Europe/Berlin';
      end if;

      v_segment_hours := least(v_remaining, 8);
      v_end := v_start + (v_segment_hours::double precision * interval '1 hour');

      if exists (
        select 1 from public.request_booking_blocks b
        where b.request_id <> p_request_id
          and b.booking_start < v_end + interval '30 minutes'
          and b.booking_end > v_start - interval '30 minutes'
      ) then
        raise exception 'Der gewünschte Start kollidiert mit einem anderen Auftrag. Bitte einen anderen Startzeitpunkt wählen.';
      end if;
      if exists (
        select 1 from public.personal_calendar_events e
        where e.blocks_customer_bookings = true
          and e.title is distinct from v_marker
          and e.start_time < v_end + interval '30 minutes'
          and e.end_time > v_start - interval '30 minutes'
      ) then
        raise exception 'Der gewünschte Start kollidiert mit einer Schicht oder einem persönlichen Kalendereintrag.';
      end if;
      if exists (
        select 1 from public.calendar_manual_events e
        where e.start_at < v_end + interval '30 minutes'
          and e.end_at > v_start - interval '30 minutes'
      ) then
        raise exception 'Der gewünschte Start kollidiert mit einem blockierten Kalendereintrag.';
      end if;

      insert into public.request_booking_blocks(request_id,booking_start,booking_end)
      values(p_request_id,v_start,v_end);

      v_remaining := v_remaining - v_segment_hours;
      if v_remaining > 0 then
        v_day := v_day + 1;
        v_first_day := false;
      end if;
    end loop;
    return;
  end if;

  select duration_hours,duration_label into v_duration
  from public.calculate_request_duration(v_request.service_type, v_request.care_options);
  update public.requests
  set duration_hours=v_duration.duration_hours, duration_label=v_duration.duration_label
  where id=p_request_id;

  v_day := v_request.requested_date;
  v_remaining := v_duration.duration_hours;
  v_requested_time := case
    when coalesce(v_request.requested_time,'') like '13:00%' then time '13:00'
    when coalesce(v_request.requested_time,'') like '15:00%' then time '15:00'
    when coalesce(v_request.requested_time,'') like '10:00%' then time '10:00'
    else time '08:00'
  end;

  while v_remaining > 0 loop
    while extract(isodow from v_day) in (6,7) loop v_day := v_day + 1; end loop;
    if v_remaining >= 8 then
      v_start := (v_day + time '08:00') at time zone 'Europe/Berlin';
      v_end := (v_day + time '16:00') at time zone 'Europe/Berlin';
      if exists (select 1 from public.calendar_manual_events e where e.start_at < v_end and e.end_at > v_start) then
        raise exception 'Der gewünschte Zeitraum ist durch einen persönlichen Termin blockiert.';
      end if;
      insert into public.request_booking_blocks(request_id,booking_start,booking_end) values(p_request_id,v_start,v_end);
      v_remaining := v_remaining - 8;
      v_day := v_day + 1;
    elsif v_remaining = 4 then
      if coalesce(v_request.requested_time,'') like '13:00%' or coalesce(v_request.requested_time,'') like '15:00%' then
        v_start := (v_day + time '13:00') at time zone 'Europe/Berlin';
        v_end := (v_day + time '17:00') at time zone 'Europe/Berlin';
      else
        v_start := (v_day + time '08:00') at time zone 'Europe/Berlin';
        v_end := (v_day + time '12:00') at time zone 'Europe/Berlin';
      end if;
      if exists (select 1 from public.calendar_manual_events e where e.start_at < v_end and e.end_at > v_start) then
        raise exception 'Der gewünschte Zeitraum ist durch einen persönlichen Termin blockiert.';
      end if;
      insert into public.request_booking_blocks(request_id,booking_start,booking_end) values(p_request_id,v_start,v_end);
      v_remaining := 0;
    elsif v_remaining = 6 then
      v_start := (v_day + time '08:00') at time zone 'Europe/Berlin';
      v_end := (v_day + time '14:00') at time zone 'Europe/Berlin';
      if exists (select 1 from public.calendar_manual_events e where e.start_at < v_end and e.end_at > v_start) then
        raise exception 'Der gewünschte Zeitraum ist durch einen persönlichen Termin blockiert.';
      end if;
      insert into public.request_booking_blocks(request_id,booking_start,booking_end) values(p_request_id,v_start,v_end);
      v_remaining := 0;
    elsif v_remaining = 2 then
      v_start := (v_day + v_requested_time) at time zone 'Europe/Berlin';
      v_end := v_start + interval '2 hours';
      if exists (select 1 from public.calendar_manual_events e where e.start_at < v_end and e.end_at > v_start) then
        raise exception 'Der gewünschte Zeitraum ist durch einen persönlichen Termin blockiert.';
      end if;
      insert into public.request_booking_blocks(request_id,booking_start,booking_end) values(p_request_id,v_start,v_end);
      v_remaining := 0;
    else
      v_start := (v_day + time '08:00') at time zone 'Europe/Berlin';
      v_end := v_start + make_interval(hours => v_remaining);
      if exists (select 1 from public.calendar_manual_events e where e.start_at < v_end and e.end_at > v_start) then
        raise exception 'Der gewünschte Zeitraum ist durch einen persönlichen Termin blockiert.';
      end if;
      insert into public.request_booking_blocks(request_id,booking_start,booking_end) values(p_request_id,v_start,v_end);
      v_remaining := 0;
    end if;
  end loop;
end;
$function$
;

drop trigger if exists trg_sync_request_booking_blocks on public.requests;
create trigger trg_sync_request_booking_blocks
after insert or update of status, service_type, care_options, requested_date, requested_time, vehicle_type, vehicle_class, dirt_level, pet_hair
on public.requests
for each row execute function public.sync_request_booking_blocks();
