-- Parents directory (admin): consent to news emails, last sign-in and notification status, and a log of exports.

-- Whether the parent agreed to receive news and updates by email (the optional box on the sign-up form).
alter table public.profiles add column email_updates boolean not null default false;
update public.profiles p set email_updates = coalesce((u.raw_user_meta_data ->> 'email_updates') = 'true', false)
  from auth.users u where u.id = p.id;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, country, email, email_updates)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(trim(new.raw_user_meta_data ->> 'country'), ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'email_updates') = 'true', false)
  );
  return new;
end $$;

-- Admin-only: last sign-in (kept by the sign-in system) and whether notifications are switched on, for every account.
create or replace function public.admin_parent_stats()
returns table (profile_id uuid, last_sign_in_at timestamptz, push_on boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can read this';
  end if;
  return query
    select p.id, u.last_sign_in_at, exists (select 1 from public.push_subscriptions s where s.profile_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id;
end $$;
revoke all on function public.admin_parent_stats() from public, anon;
grant execute on function public.admin_parent_stats() to authenticated;

-- Every download of parents' details is recorded: who, when, what kind and how many rows.
create table public.export_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('emails', 'full')),
  filter jsonb not null default '{}'::jsonb,
  row_count integer not null check (row_count >= 0),
  created_at timestamptz not null default now()
);
alter table public.export_log enable row level security;
create policy "export log: admins read" on public.export_log for select to authenticated using (private.is_admin());
create policy "export log: admins add their own" on public.export_log for insert to authenticated
  with check (private.is_admin() and admin_id = (select auth.uid()));
grant select, insert on public.export_log to authenticated;
grant all on public.export_log to service_role;
