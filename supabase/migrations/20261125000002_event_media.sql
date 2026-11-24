-- Photos and videos for events. Anyone can view the media of a published event; only admins add or remove it.
-- Files are uploaded by admins straight to the public "event-media" bucket; a video can also be a YouTube or Vimeo link.

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'embed')),
  path text,                -- full-size file in the event-media bucket (image or video upload)
  thumb_path text,          -- smaller copy of a photo for the grid
  embed_url text check (embed_url is null or embed_url ~* '^https://'),
  caption text check (caption is null or length(caption) <= 300),
  created_at timestamptz not null default now(),
  check ((kind = 'embed' and embed_url is not null) or (kind <> 'embed' and path is not null))
);
create index event_media_event_idx on public.event_media (event_id, created_at);

alter table public.event_media enable row level security;

create policy "event media: public read for published events" on public.event_media for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.published));
create policy "event media: admins manage" on public.event_media for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

grant select on public.event_media to anon;
grant select, insert, update, delete on public.event_media to authenticated;
grant all on public.event_media to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-media', 'event-media', true, 52428800, array[
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
])
on conflict (id) do nothing;

create policy "event media files: admins read" on storage.objects for select to authenticated
  using (bucket_id = 'event-media' and private.is_admin());
create policy "event media files: admins upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-media' and private.is_admin());
create policy "event media files: admins delete" on storage.objects for delete to authenticated
  using (bucket_id = 'event-media' and private.is_admin());
