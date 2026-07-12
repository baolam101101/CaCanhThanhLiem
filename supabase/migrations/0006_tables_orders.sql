-- ============================================================
-- 0006_tables_orders.sql
--   * orders       (types/index.ts: OrderRequest)
--   * order_items  (types/index.ts: OrderRequest.items[])
-- Depends on: products (0004), enums (0002)
-- ============================================================

-- ── orders ───────────────────────────────────────────────────
-- Source: interface OrderRequest { id, customerName, phone, email?,
--   address?, note?, items[], status, createdAt, updatedAt, adminNote? }
create table orders (
  id            uuid         primary key default gen_random_uuid(),
  customer_name text         not null,
  phone         text         not null,
  email         text,
  address       text,
  note          text,
  status        order_status not null default 'pending',
  admin_note    text,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  deleted_at    timestamptz
);

-- ── order_items ──────────────────────────────────────────────
-- Source: OrderRequest.items = Array<{ productId, productName, category }>
-- product_name and category are stored as snapshots taken at order time
-- (they must survive later product edits/deletes), while product_id keeps
-- a soft reference to the live product.
create table order_items (
  id           uuid        primary key default gen_random_uuid(),
  order_id     uuid        not null references orders (id) on delete cascade,
  product_id   uuid        references products (id) on delete set null,
  product_name text        not null,
  category     text        not null,
  created_at   timestamptz not null default now()
);
