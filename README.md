# Smart Vehicle Identity & Emergency Response System

Full-stack SaaS application for vehicle identity, QR-based contact access, and emergency response workflows.

## Stack

- Frontend: Next.js App Router, React 19, Tailwind CSS
- Backend: Next.js route handlers and server actions
- Platform: Supabase Auth, PostgreSQL, Storage

## Core Features

- Email OTP authentication with role-based access for `user` and `admin`
- Vehicle management with create, edit, delete, and dynamic QR generation
- Public QR scan page with call, WhatsApp, SOS alert, and optional geolocation
- Admin dashboard with totals, recent activity, editable entries, and CSV export
- Scan analytics with daily trend chart and activity feed
- Mobile-first dark glassmorphism UI

## Folder Structure

```text
frontend/
  app/
    (dashboard)/dashboard/...
    api/
    auth/
    v/[slug]/
  components/
    auth/
    dashboard/
    public/
    vehicles/
  lib/
    supabase/
database/
  schema.sql
backend/
  legacy Express implementation kept for reference
```

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://scan-m-ycar-frontend.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

For local development, you can override `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `frontend/.env.local`.

## Supabase Setup

1. Create a Supabase project.
2. Run [database/schema.sql](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/database/schema.sql) in the SQL editor.
3. Enable email OTP in Supabase Auth.
4. In Supabase Auth URL Configuration, set:
   - Site URL: `https://scan-m-ycar-frontend.vercel.app/`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://scan-m-ycar-frontend.vercel.app/auth/callback`
5. Create an admin user by updating `public.users.role` to `admin` after signup.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Auth Redirect Behavior

- OTP emails use an environment-based redirect URL helper.
- Development fallback: `http://localhost:3000/`
- Production fallback: `https://scan-m-ycar-frontend.vercel.app/`
- Callback route: `/auth/callback`
- Authenticated users are automatically routed to `/dashboard`.

## Deployment

### Vercel

- Root directory: `frontend`
- Framework preset: `Next.js`
- Build command: `npm run build`
- Output: default Next.js output

Set the same environment variables from `frontend/.env.production.example`.

### Supabase Storage

- Bucket expected: `vehicle-qr`
- Public read access is created by the SQL schema
- QR assets are uploaded automatically by the server action when `SUPABASE_SERVICE_ROLE_KEY` is present

## Notes

- The old `backend/` folder remains in the repo as a legacy implementation, but the active SaaS app now runs from `frontend/`.
- QR download is available via `/api/qr/[slug]` even if storage upload is not configured yet.
- Public scan and SOS logging are stored in `scans` and `alerts`.
