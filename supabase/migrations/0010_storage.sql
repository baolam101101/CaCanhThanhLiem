-- ============================================================
-- 0010_storage.sql
-- Supabase Storage buckets + access policies.
--
-- Bucket file_size_limit / MIME lists mirror the client-side upload
-- guards already in the admin UI (e.g. AdminVideosClient enforces a
-- 200 MB video cap). Buckets are public-read; writes are admin-only.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true,   5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('news-images',    'news-images',    true,   5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('banners',        'banners',        true,   8388608,  array['image/jpeg','image/png','image/webp']),
  ('videos',         'videos',         true, 209715200,  array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

-- Storage RLS lives on storage.objects (Supabase enables it by default).
alter table storage.objects enable row level security;

-- Public read for every media bucket.
create policy "Public read media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id in ('product-images', 'news-images', 'banners', 'videos'));

-- Only active admins may upload / modify / delete media objects.
create policy "Admins insert media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('product-images', 'news-images', 'banners', 'videos')
    and public.is_admin()
  );

create policy "Admins update media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('product-images', 'news-images', 'banners', 'videos')
    and public.is_admin()
  )
  with check (
    bucket_id in ('product-images', 'news-images', 'banners', 'videos')
    and public.is_admin()
  );

create policy "Admins delete media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('product-images', 'news-images', 'banners', 'videos')
    and public.is_admin()
  );
