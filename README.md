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

**Phase 3 (engagement):**

- **Events from the database:** admins add events in `/admin/events`; the public Events page and home page read them. Signed-in users can register for events.
- **Push notifications:** parents turn reminders on in the portal (`PushToggle`); admins send from `/admin/notifications`, and can tick "also send as push" on announcements and events. `/api/cron/reminders` (daily, see `vercel.json`) sends "Bible Club starts tomorrow" and event reminders.
- **Masterclass:** annual registration, admin approval, members-only lessons (YouTube/Vimeo embeds), downloads, progress, and printable certificates. Course titles are public; lessons and downloads are enforced by row-level security.
- **Volunteering:** volunteers save skills, admins post opportunities, matching volunteers are suggested and notified, and people sign up in one tap.

- `/login`: email and password sign-up and sign-in
- `/portal`: children, schedule and lessons, announcements, consent forms, Masterclass, volunteering
- `/admin`: dashboard, families, sessions and attendance, events, announcements, push notifications, Masterclass, consent forms, volunteers, opportunities, donations
- `/api/stripe/webhook` records donations (needs `STRIPE_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`)

Database: `supabase/migrations/` (schema, row level security, grants). Parents can only read and write their own data; admin and members-only rows are protected by RLS, not just hidden in the UI.

### Environment variables

See `.env.example`. Generate your own push keys with `npx web-push generate-vapid-keys`, and a random `CRON_SECRET`. `SUPABASE_SERVICE_ROLE_KEY` is needed by the reminder cron and the Stripe webhook only.

### Make the first admin

Sign up on `/login`, then run in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

### Local testing note

The sign-in flow needs the server to reach Supabase. In restricted sandboxes set `NODE_USE_ENV_PROXY=1`.

## Placeholders to replace

Public-site copy, figures, books and testimonials live in `src/lib/content.ts` and are marked as sample content on screen (`SHOW_SAMPLE_BADGES`). Set the charity number in `src/lib/site.ts`.

`scripts/make-logo.py` regenerates the transparent logo and PWA icons from the original PNG.
