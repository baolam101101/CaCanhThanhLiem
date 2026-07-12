-- ============================================================
-- 0007_indexes.sql
-- Secondary indexes for common access patterns.
-- (Primary keys and UNIQUE constraints already create indexes and are
--  defined alongside their tables; this file adds the rest.)
-- ============================================================

-- ── products ─────────────────────────────────────────────────
-- Category listing pages filter by category_slug and hide soft-deleted rows.
create index products_category_slug_idx on products (category_slug);
create index products_status_idx        on products (status);
-- GIN index for tag membership queries (tags @> '{featured}').
create index products_tags_gin_idx      on products using gin (tags);
-- Only index live products for the common "not deleted" scans.
create index products_active_created_idx
  on products (created_at desc)
  where deleted_at is null;

-- ── product_images ───────────────────────────────────────────
create index product_images_product_id_idx on product_images (product_id, sort_order);

-- ── news_articles ────────────────────────────────────────────
create index news_published_idx
  on news_articles (published, display_order)
  where deleted_at is null;
create index news_created_idx on news_articles (created_at desc);

-- ── orders ───────────────────────────────────────────────────
create index orders_status_idx  on orders (status) where deleted_at is null;
create index orders_created_idx on orders (created_at desc);

-- ── order_items ──────────────────────────────────────────────
create index order_items_order_id_idx   on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);

-- ── banners / videos ─────────────────────────────────────────
create index banners_visible_order_idx on banners (visible, sort_order);
create index videos_visible_idx        on videos (visible, uploaded_at desc);

-- ── admin_users ──────────────────────────────────────────────
create index admin_users_created_by_idx on admin_users (created_by);
