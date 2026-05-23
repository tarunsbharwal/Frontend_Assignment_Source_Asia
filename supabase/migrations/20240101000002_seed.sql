-- Seed script for flights and seats

-- Insert flights
insert into flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('11111111-1111-1111-1111-111111111111', 'SA101', 'NYC', 'LHR', now() + interval '3 days', now() + interval '3 days 7 hours', 'Boeing 737', 'scheduled', 450.00),
  ('22222222-2222-2222-2222-222222222222', 'SA102', 'LHR', 'NYC', now() + interval '4 days', now() + interval '4 days 8 hours', 'Boeing 737', 'scheduled', 480.00),
  ('33333333-3333-3333-3333-333333333333', 'SA201', 'SFO', 'NRT', now() + interval '5 days', now() + interval '5 days 11 hours', 'Airbus A350', 'scheduled', 850.00),
  ('44444444-4444-4444-4444-444444444444', 'SA202', 'NRT', 'SFO', now() + interval '10 days', now() + interval '10 days 9 hours', 'Airbus A350', 'scheduled', 820.00),
  ('55555555-5555-5555-5555-555555555555', 'SA301', 'DXB', 'JFK', now() + interval '2 days', now() + interval '2 days 14 hours', 'Boeing 777', 'scheduled', 600.00),
  ('66666666-6666-6666-6666-666666666666', 'SA302', 'JFK', 'DXB', now() + interval '7 days', now() + interval '7 days 12 hours', 'Boeing 777', 'scheduled', 610.00),
  ('77777777-7777-7777-7777-777777777777', 'SA401', 'SYD', 'SIN', now() + interval '1 days', now() + interval '1 days 8 hours', 'Airbus A330', 'scheduled', 300.00),
  ('88888888-8888-8888-8888-888888888888', 'SA402', 'SIN', 'SYD', now() + interval '6 days', now() + interval '6 days 7 hours', 'Airbus A330', 'scheduled', 310.00)
on conflict (id) do nothing;

-- Generate seats for each flight
do $$
declare
  f record;
  r int;
  c char;
  seat_class text;
  extra numeric;
begin
  for f in select id from flights loop
    -- 10 rows, 4 seats per row (A, B, C, D)
    for r in 1..10 loop
      for c in select unnest(array['A', 'B', 'C', 'D']) loop
        if r <= 2 then
          seat_class := 'first';
          extra := 200.00;
        elsif r <= 4 then
          seat_class := 'business';
          extra := 100.00;
        else
          seat_class := 'economy';
          extra := 0.00;
        end if;

        insert into seats (flight_id, seat_number, class, is_available, extra_fee)
        values (f.id, r::text || c, seat_class, true, extra)
        on conflict (flight_id, seat_number) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;
