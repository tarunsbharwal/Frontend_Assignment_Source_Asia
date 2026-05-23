# Premium Flight Management Web App

A production-ready Flight Management application built for the Source Asia internship assignment. This application allows passengers to search for flights, view interactive seat maps, book seats, reschedule, and cancel bookings—all with real-time updates and an offline-capable PWA configuration.

## Features

- **Flight Search**: Search for dynamic flights matching origin and destination.
- **Interactive Real-time Seat Map**: Seats update instantly when another user books them using Supabase Realtime subscriptions.
- **Rescheduling & Cancellations**: Allows swapping flights seamlessly and enforces cancellation rules using PostgreSQL RPCs and Triggers.
- **Authentication**: Email/Password authentication using Supabase Auth with Row Level Security (RLS) to ensure users can only access their own bookings.
- **PWA Ready**: Works offline, caching the flight search results and My Bookings page via `next-pwa`.
- **Beautiful UI**: Modern, premium design built entirely with Tailwind CSS and Lucide Icons.

---

## Local Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tarunsbharwal/Frontend_Assignment_Source_Asia.git
   cd Frontend_Assignment_Source_Asia/flight-management-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Supabase Environment Variables**:
   Rename `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Database Setup (Supabase)**:
   Navigate to your Supabase SQL Editor and run the files located in `supabase/migrations` sequentially:
   - `20240101000000_initial_schema.sql` (Schema & RLS Policies)
   - `20240101000001_rpc_and_triggers.sql` (Functions & Triggers)
   - `20240101000002_seed.sql` (Dummy data: 8 flights and seats)

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## Test User Credentials

You can use the following test user account seeded in the database (or sign up a new one from the UI):
- **Email**: `test@example.com`
- **Password**: `password123`

---

## Zustand Store Structure & Architecture

The application uses **Zustand** for complex client-side state management, broken down into two main stores to cleanly separate concerns and persistence rules.

1. **`useFlightStore.ts` (Booking State)**
   - Manages the ephemeral booking journey: `searchQuery`, `selectedFlight`, `selectedSeat`, and `passengerDetails`.
   - **No Persistence**: This store clears its state upon a successful booking (via `ResetStoreClient` on the confirmation page) or a page reload, ensuring a fresh start for every new booking session.

2. **`useUserStore.ts` (Authentication & Cached Data)**
   - Manages the user's Auth `session` and an array of `cachedBookings`.
   - **Persistence Strategy**: Uses Zustand's `persist` middleware with the `partialize` option.
   - **Partializing**: We explicitly tell Zustand to *only* save the `session` token into `localStorage`. The `cachedBookings` are NOT stored in `localStorage` directly—this is because PWA network caching (Service Worker Stale-While-Revalidate) is actively handling the offline data layer for the "My Bookings" page. Thus, we avoid duplicating large arrays in localStorage while keeping the user seamlessly logged in across reloads.

---

## PWA & Offline Support (Bonus)

This app is configured as a Progressive Web App using `next-pwa`. 
- **Manifest**: Located in `public/manifest.json`.
- **Service Worker**: Caches assets automatically. `My Bookings` and search APIs are cached using a Stale-While-Revalidate strategy.
- **Offline Fallback**: Disconnecting the internet and navigating to a new route displays the `/~offline` page, while previously visited pages (like `/my-bookings`) remain perfectly readable using the last cached data.

*(Lighthouse PWA Score screenshot is available below)*

![Lighthouse Score](/public/lighthouse-score.png)
