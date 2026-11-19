# NORTHSTAR HOME SERVICES

Premium Corporate home-services website concept for the Austin, Texas market. English (US). Built with Next.js App Router, React, TypeScript, Tailwind CSS and Supabase.

> Portfolio concept only. NORTHSTAR is a fictional brand. Phone number, testimonials, portfolio examples, service coverage and business claims are illustrative. Replace all demo content and verify licenses, insurance, service availability and business details before public commercial launch.

## Included in this starter

- Responsive marketing homepage with premium navy/orange visual system.
- Six service detail routes: remodeling, plumbing, electrical, roofing, HVAC and cleaning.
- Project gallery with category filters and illustrative before/after imagery.
- Multi-step estimate request form with ZIP validation and contact capture.
- Demo lead storage in browser localStorage when Supabase is not configured.
- Supabase lead submission and admin lead listing when environment variables are configured.
- Admin dashboard starter with lead metrics, lead table, refresh and demo/connected status.
- Supabase PostgreSQL schema for profiles, services, leads, estimates, customers, appointments, projects, images, reviews, service areas, pricing rules, messages, settings and notifications.
- RLS policies and environment variable template.

## Run locally

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. If you have a Supabase project, fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Run `npm run dev` and open `http://localhost:3000`.

Without Supabase credentials the public estimate form and admin lead list work in local demo mode using browser storage. Demo records are local to that browser and are not shared between devices.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Configure the two public environment variables in `.env.local` and your deployment provider.
4. Create an admin user in Supabase Auth.
5. Add a matching row to `public.profiles` with that user's UUID and role `admin`:

```sql
insert into public.profiles (id, full_name, role)
values ('YOUR_AUTH_USER_UUID', 'Site Administrator', 'admin');
```

6. Configure Supabase Storage buckets for project images and lead attachments. Use private buckets for customer uploads and signed URLs for authorized access.
7. Test RLS using separate anonymous, customer and admin sessions before launch.

## Production checklist still required

This is a functional portfolio starter, not a fully production-certified contractor CRM. Before taking real customer data or bookings:

- Add Supabase Auth login, logout, password reset and protected admin routes/middleware. The current `/admin` is a demo dashboard and is not yet access-gated; do not expose it with real customer data.
- Implement CRUD screens for every admin module (services, projects, gallery, reviews, areas, pricing, appointments, messages and settings).
- Add server-side validation, rate limiting, CAPTCHA/anti-spam, secure file upload and signed URLs.
- Add booking availability, timezone handling (America/Chicago), conflict prevention and calendar/SMS/email integrations.
- Add email confirmation/notification via a server-side provider (e.g. Resend) or Supabase Edge Function. Never put provider secrets in the browser.
- Replace sample phone, service area, testimonials and project images/captions with verified business information and properly licensed assets.
- Add real estimate formulas approved by the business; the current form intentionally does not invent prices or promise quotes.
- Add privacy policy, terms, consent language, retention/deletion workflows and accessibility review.
- Configure canonical domain, sitemap, robots, analytics consent, Google Business Profile and local SEO pages.

## Environment variables

See `.env.example`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code or prefix it with `NEXT_PUBLIC_`.
