-- New projects don't auto-grant table access to the API roles. Grant the minimum each role needs;
-- row level security (policies in the initial migration) still decides which rows are visible.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.consent_forms to authenticated;
grant select, insert on public.consent_signatures to authenticated;
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_registrations to authenticated;
grant insert on public.volunteers to anon;
grant select, insert, update on public.volunteers to authenticated;
grant select on public.donations to authenticated;
