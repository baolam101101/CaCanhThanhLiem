-- ============================================================
-- 0009_rls.sql
-- Row Level Security. RLS is enabled on every table.
--
-- Model:
--   * Public site content (categories, live products & their images,
--     published news, visible banners/videos) is world-readable by the
--     anon and authenticated roles.
--   * Order requests can be INSERTed by the public (the contact/cart
--     flow), but only admins may read or manage them.
--   * Everything else (reads of orders, all admin tables, all writes) is
--     limited to authenticated admins.
--   * The service_role key used by the server-side admin client bypasses
--     RLS entirely, so server routes keep working regardless of policies.
-- ============================================================

-- Helper: is the current auth user an active admin?
-- SECURITY DEFINER so it can read admin_users without recursing through
-- that table's own RLS policies.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and active
  );
$$;

-- Enable RLS everywhere.
alter table categories     enable row level security;
alter table admin_users    enable row level security;
alter table banners        enable row level security;
alter table videos         enable row level security;
alter table products       enable row level security;
alter table product_images enable row level security;
alter table news_articles  enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;

-- ── categories ───────────────────────────────────────────────
create policy categories_public_read on categories
  for select to anon, authenticated using (true);
create policy categories_admin_all on categories
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── products ─────────────────────────────────────────────────
create policy products_public_read on products
  for select to anon, authenticated
  using (deleted_at is null and status <> 'hidden');
create policy products_admin_all on products
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── product_images ───────────────────────────────────────────
create policy product_images_public_read on product_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
        and p.deleted_at is null
        and p.status <> 'hidden'
    )
  );
create policy product_images_admin_all on product_images
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── news_articles ────────────────────────────────────────────
create policy news_public_read on news_articles
  for select to anon, authenticated
  using (published and deleted_at is null);
create policy news_admin_all on news_articles
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── banners ──────────────────────────────────────────────────
create policy banners_public_read on banners
  for select to anon, authenticated using (visible);
create policy banners_admin_all on banners
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── videos ───────────────────────────────────────────────────
create policy videos_public_read on videos
  for select to anon, authenticated using (visible);
create policy videos_admin_all on videos
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── orders ───────────────────────────────────────────────────
-- Public may create an order request; only admins may read/manage.
create policy orders_public_insert on orders
  for insert to anon, authenticated with check (true);
create policy orders_admin_read on orders
  for select to authenticated using (is_admin());
create policy orders_admin_update on orders
  for update to authenticated using (is_admin()) with check (is_admin());
create policy orders_admin_delete on orders
  for delete to authenticated using (is_admin());

-- ── order_items ──────────────────────────────────────────────
create policy order_items_public_insert on order_items
  for insert to anon, authenticated with check (true);
create policy order_items_admin_read on order_items
  for select to authenticated using (is_admin());
create policy order_items_admin_write on order_items
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── admin_users ──────────────────────────────────────────────
-- An admin can read the admin roster; a user can read their own row.
create policy admin_users_self_or_admin_read on admin_users
  for select to authenticated
  using (id = auth.uid() or is_admin());
create policy admin_users_admin_write on admin_users
  for all to authenticated using (is_admin()) with check (is_admin());

-- ============================================================
-- Base table privileges.
-- RLS only narrows access that a role already has, so the anon /
-- authenticated / service_role roles need explicit GRANTs for the
-- policies above to take effect. (Supabase configures broadly similar
-- default privileges; these statements make the migrations self-contained.)
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

-- service_role bypasses RLS but still needs table privileges — this is
-- the role used by the server-side admin (service-role) Supabase client.
grant all on all tables in schema public to service_role;

-- Public read of site content (rows further filtered by the *_public_read
-- policies). Admin-only tables are intentionally omitted from anon.
grant select on
  categories, products, product_images, news_articles, banners, videos
  to anon;

-- Authenticated users get full DML; the *_admin_all / is_admin() policies
-- decide which rows they may actually touch.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- The public order-request flow runs as anon and only needs to insert.
grant insert on orders, order_items to anon;
