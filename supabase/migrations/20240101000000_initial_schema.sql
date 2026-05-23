-- Create extensions
create extension if not exists "uuid-ossp";

-- Table: flights
create table flights (
  id uuid primary key default uuid_generate_v4(),
  flight_no text not null,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status text not null default 'scheduled',
  base_price numeric not null check (base_price >= 0)
);

-- Table: seats
create table seats (
  id uuid primary key default uuid_generate_v4(),
  flight_id uuid references flights(id) on delete cascade not null,
  seat_number text not null,
  class text not null check (class in ('economy', 'business', 'first')),
  is_available boolean not null default true,
  extra_fee numeric not null default 0 check (extra_fee >= 0),
  unique (flight_id, seat_number)
);

-- Table: bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  flight_id uuid references flights(id) on delete cascade not null,
  seat_id uuid references seats(id) on delete cascade not null,
  status text not null check (status in ('confirmed', 'rescheduled', 'cancelled')),
  booked_at timestamptz not null default now(),
  total_price numeric not null check (total_price >= 0),
  pnr_code text not null unique
);

-- Table: passengers
create table passengers (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade not null,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null
);

-- Table: reschedules
create table reschedules (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade not null,
  old_flight_id uuid references flights(id) on delete cascade not null,
  new_flight_id uuid references flights(id) on delete cascade not null,
  requested_at timestamptz not null default now(),
  fee_charged numeric not null default 0 check (fee_charged >= 0)
);

-- Enable RLS
alter table flights enable row level security;
alter table seats enable row level security;
alter table bookings enable row level security;
alter table passengers enable row level security;
alter table reschedules enable row level security;

-- Policies for flights
create policy "Flights are viewable by everyone" on flights
  for select using (true);

-- Policies for seats
create policy "Seats are viewable by everyone" on seats
  for select using (true);

-- Users can only access their own bookings
create policy "Users can view their own bookings" on bookings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bookings" on bookings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookings" on bookings
  for update using (auth.uid() = user_id);

-- Policies for passengers
create policy "Users can view passengers of their own bookings" on passengers
  for select using (
    exists (select 1 from bookings where id = passengers.booking_id and user_id = auth.uid())
  );

create policy "Users can insert passengers for their own bookings" on passengers
  for insert with check (
    exists (select 1 from bookings where id = passengers.booking_id and user_id = auth.uid())
  );

-- Policies for reschedules
create policy "Users can view reschedules of their own bookings" on reschedules
  for select using (
    exists (select 1 from bookings where id = reschedules.booking_id and user_id = auth.uid())
  );

create policy "Users can insert reschedules for their own bookings" on reschedules
  for insert with check (
    exists (select 1 from bookings where id = reschedules.booking_id and user_id = auth.uid())
  );
