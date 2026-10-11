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

-- Category slugs are NOT an enum: categories are created from the admin
-- panel, so the set of slugs is open. categories.slug is plain text with a
-- format check (0003).

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
