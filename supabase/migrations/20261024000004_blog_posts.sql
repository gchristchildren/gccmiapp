-- Blog posts (moved from the Wix blog). Public can read published posts; admins manage them.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_url text check (cover_url is null or cover_url ~ '^(https://|/)'),
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index posts_published_at_idx on public.posts (published_at desc);

alter table public.posts enable row level security;

create policy "posts: public read published" on public.posts for select to anon, authenticated
  using (published);
create policy "posts: admins read all" on public.posts for select to authenticated
  using (private.is_admin());
create policy "posts: admins write" on public.posts for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
