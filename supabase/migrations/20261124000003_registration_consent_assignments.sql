-- Registration changes from the website review:
--  * parents give their country at sign-up
--  * each child records the parent's consent (when, and which wording) and separate photo permissions per use
--  * parents upload class assignments for their children; admins can see them

alter table public.profiles add column country text check (country is null or length(country) between 2 and 100);

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, country)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), nullif(trim(new.raw_user_meta_data ->> 'country'), ''));
  return new;
end $$;

-- Photo permissions are given separately for each use. The old single "photo_consent" tick is kept for
-- reference but no longer grants anything: existing families are asked to choose again.
alter table public.children
  add column photo_website boolean not null default false,
  add column photo_social boolean not null default false,
  add column photo_print boolean not null default false,
  add column photo_funding boolean not null default false,
  add column consent_at timestamptz,
  add column consent_version text;

-- ------------------------------------------------------------ assignments
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  file_path text not null,
  file_name text not null check (length(file_name) between 1 and 255),
  file_size integer not null check (file_size > 0 and file_size <= 10485760),
  note text check (note is null or length(note) <= 1000),
  created_at timestamptz not null default now()
);
create index assignments_child_idx on public.assignments (child_id);
create index assignments_profile_idx on public.assignments (profile_id);

alter table public.assignments enable row level security;

create policy "assignments: read own or admin" on public.assignments for select to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());
create policy "assignments: parents add for own child" on public.assignments for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );
create policy "assignments: delete own or admin" on public.assignments for delete to authenticated
  using (profile_id = (select auth.uid()) or private.is_admin());

grant select, insert, delete on public.assignments to authenticated;
grant all on public.assignments to service_role;

-- Private bucket: files live under <parent id>/<child id>/..., and only that parent or an admin can read them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assignments', 'assignments', false, 10485760, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp',
  'text/plain'
])
on conflict (id) do nothing;

create policy "assignments files: parents upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'assignments' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "assignments files: read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'assignments' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));
create policy "assignments files: delete own or admin" on storage.objects for delete to authenticated
  using (bucket_id = 'assignments' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));
