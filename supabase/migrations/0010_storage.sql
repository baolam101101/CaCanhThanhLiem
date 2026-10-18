-- ============================================================
-- 0010_storage.sql
-- Supabase Storage buckets + access policies.
--
-- Buckets are public-read; writes are admin-only. Uploads come straight
-- from the admin panel to Storage through signed upload URLs issued by
-- the server, so these limits are the real ceiling a file must fit in.
--
--   * product-images  — product photos
--   * product-videos  — product videos
--   * banners         — homepage banner images
--   * site-videos     — the homepage "Video thực tế" section
--   * news-images     — news featured / inline images
--
-- Video buckets are capped at 10 MB (the Free plan allows up to 50 MB
-- per file): each view streams the whole file out of Storage, and the
-- Free plan's monthly bandwidth is small. Keep lib/admin/media.ts in
-- step with these limits.
--
-- Idempotent: safe to re-run. Buckets are upserted and policies are
-- dropped and recreated.
--
-- Two Supabase rules this file must respect:
--   * storage.objects is owned by supabase_storage_admin, so it cannot
--     be ALTERed from SQL (42501 "must be owner of table objects"). RLS
--     on it is already enabled by Supabase; CREATE POLICY is permitted.
--   * Rows in storage tables cannot be DELETEd from SQL
--     (storage.protect_delete). Remove buckets/files via the Dashboard
--     or the Storage API.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true,  5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('product-videos', 'product-videos', true, 10485760, array['video/mp4','video/webm','video/quicktime']),
  ('banners',        'banners',        true,  8388608, array['image/jpeg','image/png','image/webp']),
  ('site-videos',    'site-videos',    true, 10485760, array['video/mp4','video/webm','video/quicktime']),
  ('news-images',    'news-images',    true,  5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media"   on storage.objects;
drop policy if exists "Admins insert media" on storage.objects;
drop policy if exists "Admins update media" on storage.objects;
drop policy if exists "Admins delete media" on storage.objects;

-- Anyone can read media in the site buckets.
create policy "Public read media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'product-videos', 'banners', 'site-videos', 'news-images'));

-- Only admins can upload / replace / remove media.
create policy "Admins insert media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('product-images', 'product-videos', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );

create policy "Admins update media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('product-images', 'product-videos', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  )
  with check (
    bucket_id in ('product-images', 'product-videos', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );

create policy "Admins delete media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('product-images', 'product-videos', 'banners', 'site-videos', 'news-images')
    and public.is_admin()
  );
