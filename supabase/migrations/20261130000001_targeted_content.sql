-- Events and announcements can be limited to a group of parents (by country, number of children, children's age groups).
-- rule = {"countries": [...], "kids": ["none","1","2","3+"], "ages": ["Kids","Pre-Teens","Teens"]}; null means everyone.
-- A targeted event is hidden from the public website and shown only inside the parent portal to matching parents.
alter table public.events add column audience_rule jsonb;
alter table public.announcements add column audience_rule jsonb;

create or replace function private.matches_audience(uid uuid, rule jsonb)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare c text; n int;
begin
  if rule is null then return true; end if;
  if uid is null then return false; end if;
  select coalesce(nullif(trim(country), ''), '__none') into c from public.profiles where id = uid;
  select count(*) into n from public.children where parent_id = uid;
  if jsonb_array_length(coalesce(rule -> 'countries', '[]'::jsonb)) > 0
     and not (c in (select jsonb_array_elements_text(rule -> 'countries'))) then return false; end if;
  if jsonb_array_length(coalesce(rule -> 'kids', '[]'::jsonb)) > 0
     and not ((case when n = 0 then 'none' when n = 1 then '1' when n = 2 then '2' else '3+' end) in (select jsonb_array_elements_text(rule -> 'kids'))) then return false; end if;
  if jsonb_array_length(coalesce(rule -> 'ages', '[]'::jsonb)) > 0
     and not exists (select 1 from public.children ch where ch.parent_id = uid and ch.age_group in (select jsonb_array_elements_text(rule -> 'ages'))) then return false; end if;
  return true;
end $$;
revoke all on function private.matches_audience(uuid, jsonb) from public;
grant execute on function private.matches_audience(uuid, jsonb) to authenticated;

alter policy "events: public read published" on public.events using (published and audience_rule is null);
create policy "events: matching parents read" on public.events for select to authenticated
  using (published and audience_rule is not null and private.matches_audience((select auth.uid()), audience_rule));

alter policy "announcements: signed-in read published" on public.announcements
  using (private.is_admin() or (published and private.matches_audience((select auth.uid()), audience_rule)));
