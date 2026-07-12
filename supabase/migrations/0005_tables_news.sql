-- ============================================================
-- 0005_tables_news.sql
--   * news_articles  (types/index.ts: NewsArticle + NewsContentBlock)
-- ============================================================

-- Source: interface NewsArticle { id, title, slug, excerpt, content,
--   featuredImage, featuredImagePosX?, featuredImagePosY?,
--   featuredImageZoom?, createdAt, updatedAt, published, displayOrder? }
--
-- `content` is NewsContentBlock[] — the type comment explicitly notes it
-- is "intentionally compatible with a future Supabase JSONB column", so it
-- is stored as jsonb.
create table news_articles (
  id                    uuid        primary key default gen_random_uuid(),
  title                 text        not null,
  slug                  text        not null unique,
  excerpt               text        not null default '',
  content               jsonb       not null default '[]'::jsonb,
  -- NewsArticle.featuredImage is a required string in types/index.ts.
  featured_image        text        not null default '',
  featured_image_storage_path text,
  featured_image_pos_x  numeric,
  featured_image_pos_y  numeric,
  featured_image_zoom   numeric,
  published             boolean     not null default false,
  display_order         integer,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz,

  -- content must always be a JSON array of blocks
  constraint news_articles_content_is_array check (jsonb_typeof(content) = 'array')
);
