-- RPC for atomic seat booking
create or replace function book_flight_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_total_price numeric,
  p_pnr_code text
) returns uuid
language plpgsql security definer
as $$
declare
  v_booking_id uuid;
  v_is_available boolean;
begin
  -- Ensure user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the row to prevent race conditions
  select is_available into v_is_available
  from seats
  where id = p_seat_id and flight_id = p_flight_id
  for update;

  if not found then
    raise exception 'Seat does not exist for this flight';
  end if;

  if not v_is_available then
    raise exception 'Seat is no longer available';
  end if;

  -- Update seat availability
  update seats set is_available = false where id = p_seat_id;

  -- Insert booking
  insert into bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  values (auth.uid(), p_flight_id, p_seat_id, 'confirmed', p_total_price, p_pnr_code)
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- RPC for atomic cancellation
create or replace function cancel_booking(
  p_booking_id uuid
) returns void
language plpgsql security definer
as $$
declare
  v_user_id uuid;
  v_seat_id uuid;
  v_status text;
begin
  -- Fetch booking details and lock it
  select user_id, seat_id, status into v_user_id, v_seat_id, v_status
  from bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_user_id != auth.uid() then
    raise exception 'Unauthorized';
  end if;

  if v_status = 'cancelled' then
    raise exception 'Booking is already cancelled';
  end if;

  -- Update booking
  update bookings set status = 'cancelled' where id = p_booking_id;

  -- Free seat
  update seats set is_available = true where id = v_seat_id;
end;
$$;

-- Trigger to prevent cancellations within 2 hours of departure
create or replace function check_cancellation_window()
returns trigger
language plpgsql
as $$
declare
  v_departs_at timestamptz;
begin
  if NEW.status = 'cancelled' and OLD.status != 'cancelled' then
    select departs_at into v_departs_at from flights where id = NEW.flight_id;
    if v_departs_at <= now() + interval '2 hours' then
      raise exception 'Cannot cancel within 2 hours of departure';
    end if;
  end if;
  return NEW;
end;
$$;

create trigger tr_check_cancellation_window
before update on bookings
for each row
execute function check_cancellation_window();
