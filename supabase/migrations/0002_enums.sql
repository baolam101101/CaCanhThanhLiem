-- ============================================================
-- 0002_enums.sql
-- Enumerated types mirrored 1:1 from the TypeScript union types
-- in types/index.ts and lib/auth/accounts.ts.
-- ============================================================

-- types/index.ts: ProductStatus = "available" | "out_of_stock" | "hidden"
create type product_status as enum ('available', 'out_of_stock', 'hidden');

-- types/index.ts: ProductTag = "featured" | "new"
create type product_tag as enum ('featured', 'new');

-- types/index.ts: OrderStatus = "pending" | "contacted" | "completed" | "cancelled"
create type order_status as enum ('pending', 'contacted', 'completed', 'cancelled');

-- types/index.ts: CategorySlug closed union
create type category_slug as enum (
  'ca-bien',
  'ca-dia',
  'ca-la-han',
  'ca-nhiet-doi',
  'ca-rong',
  'phu-kien'
);

-- types/index.ts: ProductSpec.careLevel union (Vietnamese labels)
create type care_level as enum (
  'Rất dễ',
  'Dễ chăm sóc',
  'Trung bình',
  'Khó',
  'Rất khó'
);

-- lib/auth/accounts.ts: AccountRole = "superadmin" | "staff"
create type admin_role as enum ('superadmin', 'staff');
