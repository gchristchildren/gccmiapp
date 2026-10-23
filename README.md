# GCCMI community hub

Responsive PWA for GCC Ministry International: public site, parent portal (Phase 2) and admin (Phase 2).

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind v4), Supabase (Phase 2), Stripe, Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # add a Stripe TEST key (sk_test_...) to enable card donations
npm run dev
```

## Phase 1 status

- Landing page, About, Programmes, Events, Charity impact, Books (Amazon links), Volunteer, Donate
- Light/dark mode, installable PWA (manifest, service worker, offline page)
- Donations via Stripe Checkout (one-off, monthly, sponsorship) in test mode
- `/portal` is a placeholder until Phase 2

## Placeholders to replace

All copy, events, figures, books and testimonials live in `src/lib/content.ts` and are marked
as sample content on screen (`SHOW_SAMPLE_BADGES`). Set the charity number in `src/lib/site.ts`.
The volunteer form validates but returns "opens soon" until Supabase persistence is added.

`scripts/make-logo.py` regenerates the transparent logo and PWA icons from the original PNG.
