-- Contact form on the public site: anyone can send a message; only admins can read or manage them.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new', 'replied')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact: anyone can send" on public.contact_messages for insert to anon, authenticated
  with check (status = 'new');
create policy "contact: admins read" on public.contact_messages for select to authenticated
  using (private.is_admin());
create policy "contact: admins update" on public.contact_messages for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "contact: admins delete" on public.contact_messages for delete to authenticated
  using (private.is_admin());

grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
