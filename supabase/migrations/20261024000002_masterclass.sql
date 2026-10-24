-- Phase 3b: Masterclass (courses, lessons, downloads, members-only access, progress, certificates).

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  schedule_note text not null default '',
  starts_on date,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position integer not null default 0,
  title text not null,
  description text not null default '',
  video_url text,
  created_at timestamptz not null default now()
);
create index lessons_course_id_idx on public.lessons (course_id, position);

create table public.course_resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  file_url text not null check (file_url ~ '^https://'),
  created_at timestamptz not null default now()
);
create index course_resources_course_id_idx on public.course_resources (course_id);

-- Annual registration. 'pending' until an admin approves; only 'active' members see lessons.
create table public.masterclass_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (profile_id, year)
);

create table public.lesson_progress (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (profile_id, lesson_id)
);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text not null unique default ('GCCMI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  holder_name text not null,
  issued_at timestamptz not null default now(),
  unique (profile_id, course_id)
);
create index certificates_course_id_idx on public.certificates (course_id);

create or replace function private.is_masterclass_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.masterclass_memberships
    where profile_id = (select auth.uid()) and status = 'active'
  );
$$;
revoke all on function private.is_masterclass_member() from public;
grant execute on function private.is_masterclass_member() to authenticated;

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.course_resources enable row level security;
alter table public.masterclass_memberships enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;

-- Course titles and schedules are public (they market the programme); lessons and downloads are not.
create policy "courses: public read published" on public.courses for select to anon, authenticated using (published);
create policy "courses: admins read all" on public.courses for select to authenticated using (private.is_admin());
create policy "courses: admins write" on public.courses for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "lessons: members and admins read" on public.lessons for select to authenticated
  using (
    private.is_admin()
    or (private.is_masterclass_member() and exists (select 1 from public.courses c where c.id = course_id and c.published))
  );
create policy "lessons: admins write" on public.lessons for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "resources: members and admins read" on public.course_resources for select to authenticated
  using (
    private.is_admin()
    or (private.is_masterclass_member() and exists (select 1 from public.courses c where c.id = course_id and c.published))
  );
create policy "resources: admins write" on public.course_resources for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "memberships: own or admin read" on public.masterclass_memberships for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "memberships: register self as pending" on public.masterclass_memberships for insert to authenticated
  with check (profile_id = (select auth.uid()) and status = 'pending');
create policy "memberships: admins update" on public.masterclass_memberships for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "progress: own or admin read" on public.lesson_progress for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "progress: members mark own" on public.lesson_progress for insert to authenticated
  with check (profile_id = (select auth.uid()) and private.is_masterclass_member());
create policy "progress: members unmark own" on public.lesson_progress for delete to authenticated
  using (profile_id = (select auth.uid()));

create policy "certificates: own or admin read" on public.certificates for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
-- A certificate can only be issued to yourself, once every lesson of the course is completed.
create policy "certificates: claim when course complete" on public.certificates for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and exists (select 1 from public.lessons l where l.course_id = certificates.course_id)
    and not exists (
      select 1 from public.lessons l
      where l.course_id = certificates.course_id
        and not exists (
          select 1 from public.lesson_progress lp
          where lp.lesson_id = l.id and lp.profile_id = (select auth.uid())
        )
    )
  );

grant select on public.courses to anon;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant select, insert, update, delete on public.course_resources to authenticated;
grant select, insert, update on public.masterclass_memberships to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;
grant select, insert on public.certificates to authenticated;
