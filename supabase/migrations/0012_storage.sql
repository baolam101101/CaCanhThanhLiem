-- ============================================================
-- 0012_storage.sql
-- Storage configuration phase.
--
-- Establishes the four canonical media buckets with MIME + size limits
-- and public-read / admin-write policies:
--   * product-images
--   * banners
--   * site-videos
--   * news-images
--
-- This is an append-only migration that SUPERSEDES the initial bucket set
-- created in 0010_storage.sql: the video bucket is renamed `videos` ->
-- `site-videos`. 0010 is already part of the shared history, so rather than
-- editing it in place this migration reconciles the live state forward and
-- is safe to run whether or not 0010 was ever applied.
-- ============================================================

-- 1. Ensure all four canonical buckets exist with the correct visibility,
--    size cap and MIME allow-list. `on conflict do update` keeps the limits
--    authoritative for buckets 0010 may already have created.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true,   5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('banners',        'banners',        true,   8388608,  array['image/jpeg','image/png','image/webp']),
  ('site-videos',    'site-videos',    true, 209715200,  array['video/mp4','video/webm','video/quicktime']),
  ('news-images',    'news-images',    true,   5242880,  array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. Drop the superseded `videos` bucket, but only if it exists and holds no
--    objects (never silently discard uploaded media).
delete from storage.buckets b
 where b.id = 'videos'
   and not exists (select 1 from storage.objects o where o.bucket_id = 'videos');

-- 3. Rebuild the storage.objects policies against the canonical bucket list
--    (replaces the 0010 policies that still referenced `videos`).
alter table storage.objects enable row level security;

drop policy if exists "Public read media"   on storage.objects;
drop policy if exists "Admins insert media"  on storage.objects;
drop policy if exists "Admins update media"  on storage.objects;
drop policy if exists "Admins delete media"  on storage.objects;

-- Public read for every media bucket.
create policy "Public read media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'banners', 'site-videos', 'news-images'));

-- Only active admins may upload / modify / delete media objects.
create policy "Admins insert media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('product-images', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );

create policy "Admins update media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('product-images', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  )
  with check (
    bucket_id in ('product-images', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );

create policy "Admins delete media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('product-images', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );
