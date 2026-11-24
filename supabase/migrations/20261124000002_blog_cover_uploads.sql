-- Blog cover images are uploaded by admins and served publicly from this bucket (JPG, PNG or WebP, up to 5 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-covers', 'blog-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- A public bucket serves files by address without a public read policy. Admins need read access too, because
-- the storage API looks a file up before it can update or remove it.
create policy "blog covers: admins read" on storage.objects for select to authenticated
  using (bucket_id = 'blog-covers' and private.is_admin());
create policy "blog covers: admins upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-covers' and private.is_admin());
create policy "blog covers: admins update" on storage.objects for update to authenticated
  using (bucket_id = 'blog-covers' and private.is_admin()) with check (bucket_id = 'blog-covers' and private.is_admin());
create policy "blog covers: admins delete" on storage.objects for delete to authenticated
  using (bucket_id = 'blog-covers' and private.is_admin());
