-- Admins can edit and delete families (children), volunteers; delete a whole family account.
-- Age groups follow the groups used on gccmi.co.uk: Kids, Pre-Teens, Teens.

create policy "children: admins update" on public.children for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "children: admins delete" on public.children for delete to authenticated
  using (private.is_admin());

create policy "volunteers: admins delete" on public.volunteers for delete to authenticated
  using (private.is_admin());
grant delete on public.volunteers to authenticated;

-- Deleting an auth user removes their profile and everything of theirs (children, registrations...).
-- Only callable by an admin, never on yourself or another admin.
create or replace function public.admin_delete_family(target uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can delete families';
  end if;
  if target = (select auth.uid()) then
    raise exception 'You cannot delete your own account';
  end if;
  if exists (select 1 from public.profiles where id = target and role = 'admin') then
    raise exception 'Admin accounts cannot be deleted here';
  end if;
  delete from auth.users where id = target;
end $$;
revoke all on function public.admin_delete_family(uuid) from public, anon;
grant execute on function public.admin_delete_family(uuid) to authenticated;

alter table public.children drop constraint children_age_group_check;
alter table public.sessions drop constraint sessions_age_group_check;

update public.children set age_group = case age_group
  when '3-5' then 'Kids' when '6-8' then 'Kids' when '9-12' then 'Pre-Teens' else 'Teens' end
  where age_group in ('3-5', '6-8', '9-12', '13-17');
update public.sessions set age_group = case age_group
  when '3-5' then 'Kids' when '6-8' then 'Kids' when '9-12' then 'Pre-Teens' when '13-17' then 'Teens' else age_group end
  where age_group in ('3-5', '6-8', '9-12', '13-17');

alter table public.children add constraint children_age_group_check
  check (age_group in ('Kids', 'Pre-Teens', 'Teens'));
alter table public.sessions add constraint sessions_age_group_check
  check (age_group in ('Kids', 'Pre-Teens', 'Teens', 'all'));
