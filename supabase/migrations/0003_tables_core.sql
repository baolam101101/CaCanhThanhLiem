-- ============================================================
-- 0003_tables_core.sql
-- Core, mostly-independent tables:
--   * categories   (types/index.ts: Category)
--   * admin_users  (lib/auth/accounts.ts: Account) — profile linked to auth.users
--   * banners      (components/sections/HeroBannerSlider.ts: SlideData / BannerItem)
--   * videos       (components/admin/AdminVideosClient.tsx: VideoItem)
-- ============================================================

-- ── categories ───────────────────────────────────────────────
-- Source: interface Category { slug, name, nameEn, emoji?, description, count, imageUrl? }
-- `slug` uses the closed category_slug enum and is the natural key the
-- products table references via foreign key. `count` from the entity is
-- a denormalised product tally kept as product_count.
create table categories (
  id            uuid primary key default gen_random_uuid(),
  slug          category_slug not null unique,
  name          text          not null,
  name_en       text          not null,
  emoji         text,
  description   text          not null default '',
  product_count integer       not null default 0,
  image_url     text,
  storage_path  text,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

-- ── admin_users ──────────────────────────────────────────────
-- Source: interface Account { id, username, passwordHash, displayName,
--   role, createdAt, createdBy?, active }.
-- Credentials are owned by Supabase Auth (auth.users), so no password
-- hash is stored here — this is a profile/role table keyed to auth.users.
create table admin_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     citext      not null unique,
  display_name text        not null,
  role         admin_role  not null default 'staff',
  active       boolean     not null default true,
  created_by   uuid        references admin_users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── banners ──────────────────────────────────────────────────
-- Source: interface SlideData { id, imageDataUrl?, objectPositionX?,
--   objectPositionY?, zoom? } extended by BannerItem { visible, order, imageName? }.
-- `order` is a reserved word in SQL, mapped to sort_order.
create table banners (
  id                uuid        primary key default gen_random_uuid(),
  image_url         text,
  storage_path      text,
  image_name        text,
  object_position_x numeric,
  object_position_y numeric,
  zoom              numeric     not null default 1,
  visible           boolean     not null default true,
  sort_order        integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── videos ───────────────────────────────────────────────────
-- Source: interface VideoItem { id, title, dataUrl?, fileName?, visible, uploadedAt }
create table videos (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  video_url    text,
  storage_path text,
  file_name    text,
  visible      boolean     not null default true,
  uploaded_at  timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
