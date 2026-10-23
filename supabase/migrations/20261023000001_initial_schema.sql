-- GCCMI community hub: initial schema (Phase 2).
-- Roles: parent (default), volunteer, admin. Parents only ever see their own children.

create schema if not exists private;
grant usage on schema private to authenticated, anon;

create type public.app_role as enum ('parent', 'volunteer', 'admin');

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'parent',
  created_at timestamptz not null default now()
);

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Stop anyone promoting themselves: only admins may change a role.
create or replace function private.guard_role_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and not private.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function private.guard_role_change();

-- ---------------------------------------------------------------- children
create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  first_name text not null check (length(first_name) between 1 and 100),
  last_name text not null check (length(last_name) between 1 and 100),
  date_of_birth date not null,
  age_group text not null check (age_group in ('3-5', '6-8', '9-12', '13-17')),
  medical_notes text,
  photo_consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index children_parent_id_idx on public.children (parent_id);
create index children_age_group_idx on public.children (age_group);

-- ---------------------------------------------------------------- bible club sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  age_group text not null check (age_group in ('3-5', '6-8', '9-12', '13-17', 'all')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text not null default '',
  memory_verse text,
  lesson_summary text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index sessions_starts_at_idx on public.sessions (starts_at);

create table public.attendance (
  session_id uuid not null references public.sessions (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  present boolean not null default true,
  marked_at timestamptz not null default now(),
  primary key (session_id, child_id)
);
create index attendance_child_id_idx on public.attendance (child_id);

-- ---------------------------------------------------------------- announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'bible_club', 'academy', 'masterclass')),
  published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index announcements_created_by_idx on public.announcements (created_by);

-- ---------------------------------------------------------------- consent forms
create table public.consent_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text,
  required boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.consent_signatures (
  form_id uuid not null references public.consent_forms (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  signed_by uuid not null references public.profiles (id) on delete cascade,
  signed_at timestamptz not null default now(),
  primary key (form_id, child_id)
);
create index consent_signatures_child_id_idx on public.consent_signatures (child_id);
create index consent_signatures_signed_by_idx on public.consent_signatures (signed_by);

-- ---------------------------------------------------------------- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('Bible Club', 'Academy', 'Masterclass', 'Charity Outreach', 'Community Events')),
  starts_on date not null,
  time_label text not null default '',
  venue text not null default '',
  address text not null default '',
  summary text not null default '',
  register_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  attended boolean,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index event_registrations_profile_id_idx on public.event_registrations (profile_id);

-- ---------------------------------------------------------------- volunteers & donations
create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(full_name) between 1 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  skills text[] not null default '{}',
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'active', 'inactive')),
  created_at timestamptz not null default now()
);

-- Written by the Stripe webhook with the service role key; readable by admins only.
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  amount_pence integer not null check (amount_pence > 0),
  donation_type text not null check (donation_type in ('one-off', 'monthly', 'sponsorship')),
  gift_aid boolean not null default false,
  donor_name text,
  donor_email text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row level security
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;
alter table public.consent_forms enable row level security;
alter table public.consent_signatures enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.volunteers enable row level security;
alter table public.donations enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());
create policy "profiles: update own or admin" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());

-- children
create policy "children: parents manage own" on public.children for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));
create policy "children: admins read" on public.children for select to authenticated
  using (private.is_admin());

-- sessions
create policy "sessions: signed-in read published" on public.sessions for select to authenticated
  using (published or private.is_admin());
create policy "sessions: admins write" on public.sessions for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- attendance
create policy "attendance: parents read own children" on public.attendance for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "attendance: admins manage" on public.attendance for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- announcements
create policy "announcements: signed-in read published" on public.announcements for select to authenticated
  using (published or private.is_admin());
create policy "announcements: admins write" on public.announcements for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- consent forms
create policy "consent_forms: signed-in read" on public.consent_forms for select to authenticated using (true);
create policy "consent_forms: admins write" on public.consent_forms for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "consent_signatures: parents read own" on public.consent_signatures for select to authenticated
  using (signed_by = (select auth.uid()) or private.is_admin());
create policy "consent_signatures: parents sign for own children" on public.consent_signatures for insert to authenticated
  with check (
    signed_by = (select auth.uid())
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );

-- events: public read of published events
create policy "events: public read published" on public.events for select to anon, authenticated
  using (published);
create policy "events: admins read all" on public.events for select to authenticated
  using (private.is_admin());
create policy "events: admins write" on public.events for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "event_registrations: own or admin read" on public.event_registrations for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "event_registrations: register self" on public.event_registrations for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy "event_registrations: cancel own" on public.event_registrations for delete to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "event_registrations: admins update" on public.event_registrations for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- volunteers: anyone can sign up; only admins can read or manage
create policy "volunteers: anyone can sign up" on public.volunteers for insert to anon, authenticated
  with check (status = 'new');
create policy "volunteers: admins read" on public.volunteers for select to authenticated
  using (private.is_admin());
create policy "volunteers: admins update" on public.volunteers for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- donations: admins read; inserts come from the webhook (service role bypasses RLS)
create policy "donations: admins read" on public.donations for select to authenticated
  using (private.is_admin());
