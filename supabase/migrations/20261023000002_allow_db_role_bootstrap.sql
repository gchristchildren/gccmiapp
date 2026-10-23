-- Let direct database access (SQL editor, service role: no auth.uid()) set roles, so the first
-- admin can be created. Signed-in users still cannot change roles unless they are admins.
create or replace function private.guard_role_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not private.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;
