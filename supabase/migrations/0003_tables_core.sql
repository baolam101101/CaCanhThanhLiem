-- ============================================================
-- 0003_tables_core.sql
-- Core, mostly-independent tables:
--   * categories   (types/index.ts: Category)
--   * admin_users  (lib/auth/accounts.ts: Account) — profile linked to auth.users
--   * banners      (components/sections/HeroBannerSlider.ts: SlideData / BannerItem)
--   * videos       (components/admin/AdminVideosClient.tsx: VideoItem)
-- ============================================================

-- ── categories ───────────────────────────────────────────────
-- Source: admin panel (components/admin/AdminCategoriesClient.tsx) —
--   slug, name, description, visible, order.
-- `slug` is the natural key products reference. It is free text (not an
-- enum) because categories are created from the admin panel; the check
-- keeps it URL-safe (lowercase, digits, single hyphens).
-- The product count shown on the site is computed from products at read
-- time, so no denormalised counter is stored here.
create table categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text          not null unique
                              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text          not null,
  name_en       text,
  description   text          not null default '',
  image_url     text,
  storage_path  text,
  visible       boolean       not null default true,
  sort_order    integer       not null default 0,
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
--   objectPositionY?, zoom?, fit?, background? } extended by
--   BannerItem { visible, order, imageName? }.
-- `order` is a reserved word in SQL, mapped to sort_order.
-- `fit` = 'contain' shows the whole artwork (e.g. the shop signboard)
-- instead of cropping it; `background` fills the letterbox around it.
create table banners (
  id                uuid        primary key default gen_random_uuid(),
  image_url         text,
  storage_path      text,
  image_name        text,
  object_position_x numeric,
  object_position_y numeric,
  zoom              numeric     not null default 1,
  fit               text        not null default 'cover'
                                check (fit in ('cover', 'contain')),
  background        text,
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
