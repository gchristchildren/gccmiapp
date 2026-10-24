-- Phase 3a: web push, volunteer skills/opportunities, service-role grants.

-- The Stripe webhook and the reminder cron use the service role, which (like the API roles) does
-- not get automatic table privileges on this project.
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;

alter table public.profiles add column skills text[] not null default '{}';

-- ------------------------------------------------------------ push
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_profile_id_idx on public.push_subscriptions (profile_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text,
  kind text not null check (kind in ('announcement', 'reminder', 'event', 'opportunity', 'manual')),
  sent_count integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index notifications_created_by_idx on public.notifications (created_by);

-- Remembers which automatic reminders have gone out so the cron job never double-sends.
create table public.reminder_log (
  key text primary key,
  sent_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.reminder_log enable row level security;

create policy "push: own or admin read" on public.push_subscriptions for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "push: subscribe self" on public.push_subscriptions for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy "push: own or admin delete" on public.push_subscriptions for delete to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());

create policy "notifications: admins read" on public.notifications for select to authenticated
  using (private.is_admin());
create policy "notifications: admins write" on public.notifications for insert to authenticated
  with check (private.is_admin());

grant select, insert, delete on public.push_subscriptions to authenticated;
grant select, insert on public.notifications to authenticated;

-- ------------------------------------------------------------ volunteering
create table public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  skills text[] not null default '{}',
  event_id uuid references public.events (id) on delete set null,
  starts_on date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index volunteer_opportunities_event_id_idx on public.volunteer_opportunities (event_id);

create table public.opportunity_signups (
  opportunity_id uuid not null references public.volunteer_opportunities (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, profile_id)
);
create index opportunity_signups_profile_id_idx on public.opportunity_signups (profile_id);

alter table public.volunteer_opportunities enable row level security;
alter table public.opportunity_signups enable row level security;

create policy "opportunities: public read published" on public.volunteer_opportunities for select to anon, authenticated
  using (published);
create policy "opportunities: admins read all" on public.volunteer_opportunities for select to authenticated
  using (private.is_admin());
create policy "opportunities: admins write" on public.volunteer_opportunities for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "signups: own or admin read" on public.opportunity_signups for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "signups: sign up self" on public.opportunity_signups for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy "signups: withdraw own or admin" on public.opportunity_signups for delete to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());

grant select on public.volunteer_opportunities to anon;
grant select, insert, update, delete on public.volunteer_opportunities to authenticated;
grant select, insert, delete on public.opportunity_signups to authenticated;
