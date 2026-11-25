-- Saved groups of parents (a filter from the Parents page) that admins can reuse for notifications.
create table public.saved_audiences (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  query text not null default '' check (char_length(query) <= 4000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.saved_audiences enable row level security;
create policy "saved audiences: admins read" on public.saved_audiences for select to authenticated using (private.is_admin());
create policy "saved audiences: admins add" on public.saved_audiences for insert to authenticated
  with check (private.is_admin() and created_by = (select auth.uid()));
create policy "saved audiences: admins delete" on public.saved_audiences for delete to authenticated using (private.is_admin());
grant select, insert, delete on public.saved_audiences to authenticated;
grant all on public.saved_audiences to service_role;
