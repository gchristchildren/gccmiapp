-- Policy pack follow-ups:
--  * Zoom links are only released through the portal, to families whose child is in the session's age group,
--    from 30 minutes before the start until the session ends (or 2 hours after it starts).
--  * Bible Quiz scores are recorded by admins and visible only to the child's parent.
--  * Volunteers can name two referees at sign-up; admins track references and checks.

-- ------------------------------------------------------------ settings (admin only)
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "settings: admins only" on public.app_settings for all to authenticated
  using (private.is_admin()) with check (private.is_admin());
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;

-- ------------------------------------------------------------ zoom links
create table public.session_links (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  zoom_url text not null check (zoom_url ~* '^https://[^\s]+$' and length(zoom_url) <= 500),
  created_at timestamptz not null default now()
);
alter table public.session_links enable row level security;

create policy "session links: admins manage" on public.session_links for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "session links: matching families, around class time" on public.session_links for select to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_links.session_id
        and s.published
        and now() >= s.starts_at - interval '30 minutes'
        and now() <= coalesce(s.ends_at, s.starts_at + interval '2 hours')
        and exists (
          select 1 from public.children c
          where c.parent_id = (select auth.uid()) and (s.age_group = 'all' or c.age_group = s.age_group)
        )
    )
  );

grant select, insert, update, delete on public.session_links to authenticated;
grant all on public.session_links to service_role;

-- ------------------------------------------------------------ quiz scores
create table public.quiz_scores (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  quiz_title text not null check (length(quiz_title) between 1 and 200),
  score integer not null check (score >= 0),
  out_of integer not null check (out_of > 0),
  taken_on date not null default current_date,
  created_at timestamptz not null default now(),
  check (score <= out_of)
);
create index quiz_scores_child_idx on public.quiz_scores (child_id, taken_on desc);
alter table public.quiz_scores enable row level security;

create policy "quiz scores: parents read own children" on public.quiz_scores for select to authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );
create policy "quiz scores: admins write" on public.quiz_scores for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

grant select, insert, update, delete on public.quiz_scores to authenticated;
grant all on public.quiz_scores to service_role;

-- ------------------------------------------------------------ volunteer references
alter table public.volunteers
  add column referees jsonb not null default '[]'::jsonb check (jsonb_typeof(referees) = 'array' and jsonb_array_length(referees) <= 2),
  add column vetting_complete boolean not null default false,
  add column vetting_notes text check (vetting_notes is null or length(vetting_notes) <= 2000);

-- Anyone can sign up, but cannot mark their own checks as complete.
alter policy "volunteers: anyone can sign up" on public.volunteers
  with check (status = 'new' and vetting_complete = false and vetting_notes is null);
