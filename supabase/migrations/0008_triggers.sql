-- ============================================================
-- 0008_triggers.sql
-- Shared updated_at maintenance trigger, attached to every table
-- that carries an updated_at column.
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Attach to each table that has an updated_at column.
create trigger set_updated_at_categories
  before update on categories
  for each row execute function set_updated_at();

create trigger set_updated_at_admin_users
  before update on admin_users
  for each row execute function set_updated_at();

create trigger set_updated_at_banners
  before update on banners
  for each row execute function set_updated_at();

create trigger set_updated_at_videos
  before update on videos
  for each row execute function set_updated_at();

create trigger set_updated_at_products
  before update on products
  for each row execute function set_updated_at();

create trigger set_updated_at_news_articles
  before update on news_articles
  for each row execute function set_updated_at();

create trigger set_updated_at_orders
  before update on orders
  for each row execute function set_updated_at();
