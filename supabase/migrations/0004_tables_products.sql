-- ============================================================
-- 0004_tables_products.sql
--   * products        (types/index.ts: Product + ProductSpec)
--   * product_images  (types/index.ts: ProductImage)
-- Depends on: categories (0003), enums (0002)
-- ============================================================

-- ── products ─────────────────────────────────────────────────
-- Source: interface Product { id, slug, name, nameEn?, latin, category,
--   categorySlug, emoji?, status, tags[], description, longDescription?,
--   specs, images?, createdAt, updatedAt, viewCount? }
--
-- Normalisation notes:
--   * `category` (display name) is intentionally NOT stored — it is
--     derivable via the categories foreign key on category_slug, which
--     avoids denormalised drift. `categorySlug` maps to category_slug.
--   * ProductSpec is flattened into spec_* columns so care_level can use
--     its enum and individual specs stay queryable.
--   * `images` is modelled as the child product_images table below.
create table products (
  id                   uuid          primary key default gen_random_uuid(),
  slug                 text          not null unique,
  name                 text          not null,
  name_en              text,
  latin                text          not null,
  category_slug        category_slug not null references categories (slug) on update cascade on delete restrict,
  emoji                text,
  status               product_status not null default 'available',
  tags                 product_tag[] not null default '{}',
  description          text          not null,
  long_description     text,

  -- ProductSpec (flattened)
  spec_size            text          not null,
  spec_temperature     text          not null,
  spec_ph              text          not null,
  spec_origin          text          not null,
  spec_min_tank_size   text          not null,
  spec_care_level      care_level    not null,
  spec_diet            text,
  spec_compatibility   text,

  view_count           integer       not null default 0,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),
  deleted_at           timestamptz
);

-- ── product_images ───────────────────────────────────────────
-- Source: interface ProductImage { id, url, alt, isPrimary }
-- storage_path and sort_order are additive columns supporting the
-- Supabase Storage integration and stable gallery ordering.
create table product_images (
  id           uuid        primary key default gen_random_uuid(),
  product_id   uuid        not null references products (id) on delete cascade,
  url          text        not null,
  storage_path text,
  alt          text        not null default '',
  is_primary   boolean     not null default false,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

-- At most one primary image per product.
create unique index product_images_one_primary_per_product
  on product_images (product_id)
  where is_primary;
