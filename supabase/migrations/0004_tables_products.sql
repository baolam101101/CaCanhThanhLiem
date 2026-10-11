-- ============================================================
-- 0004_tables_products.sql
--   * products        (types/index.ts: Product + ProductSpec)
--   * product_media   (images AND videos attached to a product)
-- Depends on: categories (0003), enums (0002)
-- ============================================================

-- ── products ─────────────────────────────────────────────────
-- Source: interface Product { id, slug, name, nameEn?, latin, category,
--   categorySlug, status, tags[], description, longDescription?,
--   specs, media?, createdAt, updatedAt, viewCount? }
--
-- Normalisation notes:
--   * `category` (display name) is intentionally NOT stored — it is
--     derivable via the categories foreign key on category_slug, which
--     avoids denormalised drift. `categorySlug` maps to category_slug.
--   * ProductSpec is flattened into spec_* columns so care_level can use
--     its enum and individual specs stay queryable. The admin form does
--     not collect specs yet and the site does not show them, so every
--     spec column (and latin) is optional.
--   * Images and videos live in the child product_media table below.
create table products (
  id                   uuid          primary key default gen_random_uuid(),
  slug                 text          not null unique,
  name                 text          not null,
  name_en              text,
  latin                text,
  category_slug        text          not null references categories (slug) on update cascade on delete restrict,
  status               product_status not null default 'available',
  tags                 product_tag[] not null default '{}',
  description          text          not null default '',
  long_description     text,

  -- ProductSpec (flattened, all optional)
  spec_size            text,
  spec_temperature     text,
  spec_ph              text,
  spec_origin          text,
  spec_min_tank_size   text,
  spec_care_level      care_level,
  spec_diet            text,
  spec_compatibility   text,

  view_count           integer       not null default 0,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),
  deleted_at           timestamptz
);

-- ── product_media ────────────────────────────────────────────
-- Source: the admin product form's media list (MediaItem { type:
-- "image" | "video" }). Images are stored in the `product-images`
-- bucket, videos in `product-videos` (0010). storage_path is the object
-- path inside that bucket, so the file can be removed with the row.
create table product_media (
  id           uuid        primary key default gen_random_uuid(),
  product_id   uuid        not null references products (id) on delete cascade,
  media_type   text        not null default 'image'
                           check (media_type in ('image', 'video')),
  url          text        not null,
  storage_path text,
  alt          text        not null default '',
  is_primary   boolean     not null default false,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),

  -- The primary item is the product's thumbnail, so it must be an image.
  constraint product_media_primary_is_image
    check (not is_primary or media_type = 'image')
);

-- At most one primary item per product.
create unique index product_media_one_primary_per_product
  on product_media (product_id)
  where is_primary;
