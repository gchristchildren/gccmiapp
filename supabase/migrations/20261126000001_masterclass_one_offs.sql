-- Masterclass entries can now be a course (as before), a one-off live class, or a replay.
-- Parents say they are interested; for a replay an admin approves access. Links are only released through the portal.

alter table public.courses
  add column kind text not null default 'course' check (kind in ('course', 'live', 'replay')),
  add column event_at timestamptz;

-- Admins need a way to contact interested parents, so the sign-up email is kept on the profile.
alter table public.profiles add column email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, country, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), nullif(trim(new.raw_user_meta_data ->> 'country'), ''), new.email);
  return new;
end $$;

-- ------------------------------------------------------------ interest
create table public.masterclass_interest (
  course_id uuid not null references public.courses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  primary key (course_id, profile_id)
);
create index masterclass_interest_profile_idx on public.masterclass_interest (profile_id);
alter table public.masterclass_interest enable row level security;

create policy "interest: own or admin read" on public.masterclass_interest for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "interest: say interested in a published one-off or replay" on public.masterclass_interest for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and status = 'interested'
    and exists (select 1 from public.courses c where c.id = course_id and c.published and c.kind in ('live', 'replay'))
  );
create policy "interest: withdraw own" on public.masterclass_interest for delete to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "interest: admins update" on public.masterclass_interest for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

grant select, insert, update, delete on public.masterclass_interest to authenticated;
grant all on public.masterclass_interest to service_role;

-- ------------------------------------------------------------ private links (live class and replay)
create table public.course_links (
  course_id uuid not null references public.courses(id) on delete cascade,
  kind text not null check (kind in ('live', 'replay')),
  url text not null check (url ~* '^https://[^\s]+$' and length(url) <= 500),
  primary key (course_id, kind)
);
alter table public.course_links enable row level security;

create policy "course links: admins manage" on public.course_links for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- Live link: for parents who said they are interested, from 30 minutes before the start until 3 hours after.
create policy "course links: live link for interested parents" on public.course_links for select to authenticated
  using (
    kind = 'live'
    and exists (
      select 1 from public.masterclass_interest i
      join public.courses c on c.id = i.course_id
      where i.course_id = course_links.course_id and i.profile_id = (select auth.uid()) and i.status in ('interested', 'approved')
        and c.published and c.event_at is not null
        and now() >= c.event_at - interval '30 minutes' and now() <= c.event_at + interval '3 hours'
    )
  );
-- Replay link: only for parents an admin has approved.
create policy "course links: replay link for approved parents" on public.course_links for select to authenticated
  using (
    kind = 'replay'
    and exists (
      select 1 from public.masterclass_interest i
      join public.courses c on c.id = i.course_id
      where i.course_id = course_links.course_id and i.profile_id = (select auth.uid()) and i.status = 'approved' and c.published
    )
  );

grant select, insert, update, delete on public.course_links to authenticated;
grant all on public.course_links to service_role;
