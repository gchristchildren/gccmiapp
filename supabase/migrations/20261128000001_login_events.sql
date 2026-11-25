-- Sign-in history, so admins can see how often and when parents use the portal. Starts empty; fills as people sign in.
create table public.login_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index login_events_created_at_idx on public.login_events (created_at desc);
create index login_events_profile_idx on public.login_events (profile_id);
alter table public.login_events enable row level security;
create policy "login events: add your own" on public.login_events for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy "login events: admins read" on public.login_events for select to authenticated
  using (private.is_admin());
grant select, insert on public.login_events to authenticated;
grant all on public.login_events to service_role;
