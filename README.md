# GCCMI community hub

Responsive PWA for GCC Ministry International: public site, parent portal (Phase 2) and admin (Phase 2).

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind v4), Supabase (Phase 2), Stripe, Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # add a Stripe TEST key (sk_test_...) to enable card donations
npm run dev
```

## Status

**Phase 1 (public site):** landing, About, Programmes, Events, Charity impact, Books, Volunteer, Donate (Stripe test mode), light/dark, installable PWA.

**Phase 2 (accounts and admin):** Supabase auth, parent portal, admin dashboard.

- `/login`: email and password sign-up and sign-in
- `/portal`: register children, schedule and lessons, announcements, consent forms
- `/admin`: dashboard (attendance, registrations, donations, turnout, at-risk children, "needing action"), families, sessions and attendance, events, announcements, consent forms, volunteers, donations
- `/api/stripe/webhook` records donations (needs `STRIPE_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`)

Database: `supabase/migrations/` (schema, row level security, grants). Parents can only read and write their own children; admin rows are protected by RLS, not just hidden in the UI.

### Make the first admin

Sign up on `/login`, then run in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

### Local testing note

The sign-in flow needs the server to reach Supabase. In restricted sandboxes set `NODE_USE_ENV_PROXY=1`.

## Placeholders to replace

Public-site copy, events, figures, books and testimonials live in `src/lib/content.ts` and are marked as sample content on screen (`SHOW_SAMPLE_BADGES`). The public Events page still reads this file; it moves to the `events` table next. Set the charity number in `src/lib/site.ts`.

`scripts/make-logo.py` regenerates the transparent logo and PWA icons from the original PNG.
