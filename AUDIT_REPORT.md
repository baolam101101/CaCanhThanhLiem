
╔══════════════════════════════════════════════════════════════════════════════════╗
║         AUDIT REPORT — CÁ CẢNH THANH LIÊM                                     ║
║         Source Code Analysis & Production Database Design                      ║
║         Ngày: 2025-06-12                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN A — DỮ LIỆU HARDCODE (không thể thay đổi khi không sửa code)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CRITICAL] lib/constants.ts → SITE_CONFIG
  Toàn bộ thông tin cửa hàng nằm trong code:
  • phone, phone2, address, email, facebook, zalo, hours, founded
  Tác động: chủ cửa hàng không thể tự đổi số điện thoại, giờ mở cửa
  mà không cần developer chỉnh code và redeploy.

[CRITICAL] lib/auth/accounts.ts → global.__tlAccounts
  • Tài khoản admin lưu trong RAM (global variable)
  • Mỗi lần server restart → mất toàn bộ tài khoản nhân viên đã tạo
  • Password dùng thuật toán tự viết (imul hash × 100 rounds), không phải bcrypt
  • Không dùng Supabase Auth

[HIGH] lib/auth/session.ts → SESSION_SECRET
  • Fallback secret hardcode: "tl_cacanh_secret_2025_ASCII_only_safe_key_abcdefgh"
  • Nếu không set env SESSION_SECRET → secret bị lộ trong source code

[HIGH] types/index.ts → CategorySlug
  • type CategorySlug = "ca-bien" | "ca-dia" | "ca-la-han" | ...
  • Danh sách slug hardcode trong TypeScript type
  • Thêm danh mục mới phải sửa type + redeploy

[MEDIUM] app/about/page.tsx
  • Toàn bộ nội dung về team, lịch sử, milestones viết thẳng vào TSX
  • Không có admin UI để chỉnh sửa

[MEDIUM] components/sections/HeroBannerSlider.tsx → DEFAULT_SLIDES
  • 3 gradient slides mặc định hardcode
  • Khi server restart, banner đã upload qua Admin bị mất
  • Slider luôn fallback về default nếu không có data từ DB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN B — DỮ LIỆU MOCK (mất khi refresh hoặc restart server)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CRITICAL] lib/data.ts → MOCK_PRODUCTS (8 sản phẩm demo)
  • 8 sản phẩm với emoji placeholder thay ảnh thật
  • Thêm/sửa/xóa từ AdminProductsClient → lưu vào React useState
  • Reload trang → mất hết, quay về 8 sản phẩm demo
  • Trang /products và admin đọc từ 2 nguồn khác nhau:
    - /products đọc MOCK_PRODUCTS (static)
    - Admin dùng useState local (không đồng bộ)

[CRITICAL] lib/data.ts → MOCK_CATEGORIES (6 danh mục)
  • count hardcode (4, 12, 8, 25, 6, 30), không đếm từ DB
  • AdminCategoriesClient và ProductsClient dùng 2 nguồn khác nhau
  • Thêm danh mục ở Admin không cập nhật filter dropdown ở /products

[CRITICAL] components/admin/AdminBannersClient.tsx → DEFAULTS + useState
  • Upload ảnh banner → lưu base64 vào React state
  • Navigate sang trang khác → banner upload biến mất
  • Trang chủ vẫn hiển thị gradient mặc định, không phải ảnh đã upload

[CRITICAL] components/admin/AdminVideosClient.tsx → INITIAL + useState
  • 3 video placeholder hardcode
  • Upload video → lưu base64 vào React state
  • VideoShowcase trên trang chủ đọc PLACEHOLDER_VIDEOS riêng biệt
  • Không có cơ chế sync Admin ↔ Frontend

[CRITICAL] components/admin/AdminCategoriesClient.tsx → INITIAL
  • 6 danh mục clone của MOCK_CATEGORIES
  • Hoàn toàn độc lập với dữ liệu hiển thị trên /products

[HIGH] app/admin/orders/page.tsx → MOCK_ORDERS (5 đơn hàng demo)
  • Đơn hàng giả, không liên kết với contact form
  • Contact form submit không lưu bất kỳ đâu

[HIGH] lib/auth/accounts.ts → global.__tlAccounts
  • Tài khoản nhân viên tạo mới mất khi server restart
  • Chỉ admin mặc định (admin/TL@Admin2025) luôn tồn tại

[HIGH] app/admin/page.tsx → stats object
  • pendingOrders hardcode = 3
  • Các stats khác tính từ MOCK_PRODUCTS array (không phải DB)

[MEDIUM] components/sections/VideoShowcase.tsx → PLACEHOLDER_VIDEOS
  • 3 video placeholder hiển thị trên trang chủ
  • Hoàn toàn tách biệt với AdminVideosClient

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN C — TÍNH NĂNG GIẢ (fake/simulated, không có tác dụng thực)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CRITICAL] Contact Form — ContactClient.tsx
  Code hiện tại:
    await new Promise((r) => setTimeout(r, 1000));
    setFormState({ status: "success" });
  Thực tế: không gửi email, không lưu DB, không có API route /api/contact

[CRITICAL] Media Upload (Banner & Product)
  • Banner: FileReader → base64 → React state → mất khi navigate
  • Product: FileReader → base64 → React state → mất khi navigate
  • Không upload lên Supabase Storage hay bất kỳ CDN nào
  • File ảnh/video 5MB base64 = ~6.7MB text trong RAM browser

[HIGH] Email Notification
  • RESEND_API_KEY có trong .env.local
  • Chưa có code nào implement gửi email
  • Admin không nhận email khi có đơn hàng mới

[HIGH] Order Management
  • AdminOrdersClient thao tác với mock data
  • Contact form không kết nối với orders table
  • Workflow: khách điền form → không có gì xảy ra

[MEDIUM] Product Image Display
  • ProductCard hiển thị chữ cái đầu trong vòng tròn xanh
  • ProductDetail hiển thị chữ cái đầu size lớn
  • Không có ảnh thật nào được hiển thị

[MEDIUM] Search Products
  • searchProducts() đọc MOCK_PRODUCTS
  • Không có full-text search thực sự từ DB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN D — LỖI UI/UX HIỆN CÓ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HIGH] Không đồng bộ Admin ↔ Frontend
  • Thêm sản phẩm từ Admin → không hiện ở /products
  • Upload banner → không hiện trên trang chủ
  • Upload video → không hiện VideoShowcase
  • Thêm danh mục → không cập nhật filter /products
  Nguyên nhân: Admin và Frontend đọc từ 2 nguồn độc lập

[HIGH] Product không có ảnh thật
  • Card sản phẩm: vòng tròn xanh + chữ cái đầu
  • Detail sản phẩm: placeholder lớn không có thông tin
  • Thumbnail strip: 4 ô số 1/2/3/4 không có ảnh

[HIGH] Banner Slider Desktop
  • Luôn hiển thị gradient mặc định
  • Ảnh upload từ Admin không bao giờ xuất hiện ở frontend

[MEDIUM] VideoShowcase trang chủ
  • Hiển thị 3 placeholder với gradient xanh
  • Video thật từ Admin không kết nối

[MEDIUM] Category count sai
  • Tất cả categories hiển thị "Xem thêm" thay vì số sản phẩm thực
  • Vì count trong MOCK_CATEGORIES không đồng bộ với products

[LOW] About page nội dung tĩnh
  • Team members, milestones, story không edit được từ Admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN E — LỖI ADMIN DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CRITICAL] Mất toàn bộ dữ liệu khi refresh hoặc server restart
  Mọi thay đổi qua Admin đều mất:
  ✗ Sản phẩm thêm/sửa/xóa
  ✗ Danh mục thêm/sửa/xóa
  ✗ Banner upload/cấu hình
  ✗ Video upload
  ✗ Tài khoản nhân viên tạo mới
  Admin hoàn toàn không thể tin tưởng dashboard phản ánh trạng thái thực tế

[CRITICAL] Tài khoản Admin không persistent
  • Tạo tài khoản nhân viên → server restart → mất hết
  • Đăng nhập bắt buộc dùng admin/TL@Admin2025
  • Không dùng Supabase Auth (nguy cơ bảo mật)

[HIGH] Stats Dashboard sai
  • pendingOrders = 3 (hardcode)
  • featuredProducts tính từ mock data
  • Không phản ánh thực tế

[HIGH] Không có kết nối thực sự giữa các Admin modules
  • Thêm sản phẩm trong Products → không thấy trong Dashboard stats
  • Thêm danh mục trong Categories → không ảnh hưởng Products
  • Upload banner → không hiện trên frontend

[HIGH] Không có notification khi có liên hệ mới
  • Contact form → không email → Admin không biết

[MEDIUM] AdminOrdersClient với mock data
  • 5 đơn demo, không có đơn thật từ contact form
  • Cập nhật status → mất khi refresh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN F — DỮ LIỆU CẦN ĐƯA VÀO SUPABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Bảng               Dữ liệu hiện tại          Nguồn hiện tại
  ─────────────────────────────────────────────────────────────────
  categories         6 danh mục mock            MOCK_CATEGORIES + useState
  products           8 sản phẩm mock            MOCK_PRODUCTS + useState
  product_media      Chưa có                    base64 in useState (mất)
  banners            3 gradient defaults         useState (mất)
  videos             3 placeholders              useState (mất)
  inquiries          Chưa có                    mất khi submit
  site_settings      hardcode constants.ts       code
  admin_users        global.__tlAccounts RAM     mất khi restart

  Supabase Storage buckets cần:
  • product-images   — ảnh sản phẩm
  • product-videos   — video sản phẩm
  • banners          — ảnh banner trang chủ
  • videos           — video trang chủ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN G — TỔNG KẾT PHÂN LOẠI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CRITICAL (8 items) — Không thể dùng cho production:
  ─────────────────────────────────────────────────────
  1. Tài khoản Admin dùng in-memory store → mất khi restart
  2. Sản phẩm mock → mất mọi thay đổi từ Admin
  3. Danh mục mock → không đồng bộ
  4. Banner upload → không persist
  5. Video upload → không persist
  6. Contact form → không gửi email, không lưu DB
  7. Admin ↔ Frontend không đồng bộ
  8. Media dùng base64 in-memory → không scale

  HIGH (9 items) — Cần fix trước khi launch:
  ───────────────────────────────────────────
  1. SESSION_SECRET fallback trong source code
  2. CategorySlug hardcode trong TypeScript type
  3. Không có email notification
  4. Order system không kết nối contact form
  5. Dashboard stats sai
  6. Product không có ảnh thật
  7. Banner không hiện ảnh upload
  8. Tài khoản nhân viên không persistent
  9. SITE_CONFIG hardcode (phone, address...)

  MEDIUM (5 items) — Nên fix sớm:
  ─────────────────────────────────
  1. VideoShowcase không kết nối Admin
  2. Category count sai
  3. About page không edit được từ Admin
  4. HeroBannerSlider default slides hardcode
  5. Product search từ mock array

  LOW (2 items) — Nice to have:
  ──────────────────────────────
  1. View count chưa thực sự đếm
  2. Related products chưa personalized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN H — SQL MIGRATION (copy vào Supabase SQL Editor)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================
-- 0. EXTENSIONS & HELPERS
-- ============================================================
create extension if not exists "uuid-ossp";

-- Auto-update updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
create table public.categories (
  id             uuid primary key default uuid_generate_v4(),
  slug           text not null unique,
  name           text not null,
  description    text,
  display_order  integer not null default 0,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function update_updated_at();

create index idx_categories_slug         on public.categories (slug);
create index idx_categories_display_order on public.categories (display_order);
create index idx_categories_is_visible   on public.categories (is_visible);

-- Seed dữ liệu ban đầu
insert into public.categories (slug, name, description, display_order) values
  ('ca-koi',       'Cá Koi',        'Cá chép Koi Việt & Nhật nhập khẩu chính hãng',       1),
  ('ca-dia',       'Cá Đĩa',        'Vua của cá nhiệt đới nước ngọt',                      2),
  ('ca-la-han',    'Cá La Hán',     'Biểu tượng may mắn và thịnh vượng',                   3),
  ('ca-nhiet-doi', 'Cá Nhiệt Đới',  'Đa dạng các loài cá nhiệt đới nước ngọt dễ nuôi',    4),
  ('ca-rong',      'Cá Rồng',       'Loài cá quý hiếm nhất trong thế giới cá cảnh',        5),
  ('phu-kien',     'Phụ Kiện',      'Thiết bị, thức ăn và phụ kiện hồ cá chuyên nghiệp',  6);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
create type product_status as enum ('available', 'out_of_stock', 'hidden');

create table public.products (
  id               uuid primary key default uuid_generate_v4(),
  category_id      uuid not null references public.categories (id) on delete restrict,
  slug             text not null unique,
  name             text not null,
  description      text,
  long_description text,
  status           product_status not null default 'available',
  is_featured      boolean not null default false,
  is_new           boolean not null default false,
  view_count       integer not null default 0,
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function update_updated_at();

create index idx_products_category_id   on public.products (category_id);
create index idx_products_slug          on public.products (slug);
create index idx_products_status        on public.products (status);
create index idx_products_is_featured   on public.products (is_featured) where is_featured = true;
create index idx_products_is_new        on public.products (is_new) where is_new = true;
create index idx_products_display_order on public.products (display_order);

-- ============================================================
-- 3. PRODUCT MEDIA (ảnh + video sản phẩm)
-- ============================================================
create type media_type as enum ('image', 'video');

create table public.product_media (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products (id) on delete cascade,
  storage_path  text not null,  -- path trong Supabase Storage
  public_url    text not null,  -- URL công khai để hiển thị
  media_type    media_type not null default 'image',
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  file_name     text,
  file_size     bigint,          -- bytes
  mime_type     text,
  created_at    timestamptz not null default now()
);

create index idx_product_media_product_id    on public.product_media (product_id);
create index idx_product_media_is_primary    on public.product_media (product_id, is_primary);
create index idx_product_media_display_order on public.product_media (product_id, display_order);

-- Đảm bảo mỗi sản phẩm chỉ có 1 ảnh primary
create unique index idx_product_media_one_primary
  on public.product_media (product_id)
  where is_primary = true and media_type = 'image';

-- ============================================================
-- 4. BANNERS
-- ============================================================
create type banner_type as enum ('image', 'gradient');

create table public.banners (
  id             uuid primary key default uuid_generate_v4(),
  banner_type    banner_type not null default 'gradient',
  title          text,                -- cho gradient banners
  subtitle       text,                -- cho gradient banners
  storage_path   text,                -- cho image banners
  public_url     text,                -- cho image banners
  image_name     text,
  bg_from        text default '#A8CF36',  -- cho gradient
  bg_to          text default '#557318',  -- cho gradient
  position_x     numeric(5,2) default 50, -- crop position 0-100
  position_y     numeric(5,2) default 50, -- crop position 0-100
  zoom           numeric(4,2) default 1,  -- zoom 1.0-2.5
  is_visible     boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger banners_updated_at
  before update on public.banners
  for each row execute function update_updated_at();

create index idx_banners_is_visible    on public.banners (is_visible);
create index idx_banners_display_order on public.banners (display_order);

-- Seed 3 gradient banners mặc định
insert into public.banners (banner_type, title, subtitle, bg_from, bg_to, display_order) values
  ('gradient', 'Cá Koi Nhật Nhập Khẩu',    'Trực tiếp từ trang trại Nhật Bản', '#A8CF36', '#557318', 1),
  ('gradient', 'Cá Rồng & La Hán Cao Cấp', 'Nhập khẩu chính hãng',             '#557318', '#A8CF36', 2),
  ('gradient', 'Cá Đĩa & Cá Nhiệt Đới',   'Hàng trăm loài luôn có sẵn',       '#739620', '#b0d466', 3);

-- ============================================================
-- 5. VIDEOS
-- ============================================================
create table public.videos (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  storage_path  text,          -- path trong Supabase Storage
  public_url    text,          -- URL công khai
  file_name     text,
  file_size     bigint,
  mime_type     text,
  is_visible    boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger videos_updated_at
  before update on public.videos
  for each row execute function update_updated_at();

create index idx_videos_is_visible    on public.videos (is_visible);
create index idx_videos_display_order on public.videos (display_order);

-- ============================================================
-- 6. INQUIRIES (liên hệ & đặt hàng từ khách)
-- ============================================================
create type inquiry_status as enum ('new', 'contacted', 'completed', 'cancelled');

create table public.inquiries (
  id              uuid primary key default uuid_generate_v4(),
  customer_name   text not null,
  phone           text not null,
  email           text,
  subject         text,
  message         text,
  -- JSON array: [{product_id, product_name, category}]
  product_refs    jsonb default '[]'::jsonb,
  status          inquiry_status not null default 'new',
  admin_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger inquiries_updated_at
  before update on public.inquiries
  for each row execute function update_updated_at();

create index idx_inquiries_status     on public.inquiries (status);
create index idx_inquiries_created_at on public.inquiries (created_at desc);
create index idx_inquiries_phone      on public.inquiries (phone);

-- ============================================================
-- 7. SITE SETTINGS (thay thế hardcode SITE_CONFIG)
-- ============================================================
create table public.site_settings (
  key         text primary key,
  value       text not null,
  label       text,         -- mô tả để hiển thị trong Admin UI
  is_public   boolean not null default true,  -- false = chỉ admin đọc
  updated_at  timestamptz not null default now()
);

-- Seed thông tin cửa hàng
insert into public.site_settings (key, value, label) values
  ('store_name',    'Cá Cảnh Thanh Liêm',                                      'Tên cửa hàng'),
  ('tagline',       'Chuyên Cung Cấp Cá Chép Koi Việt - Nhập',                'Slogan'),
  ('phone_1',       '0909 633 203',                                             'Số điện thoại 1'),
  ('phone_2',       '0931 44 42 40',                                            'Số điện thoại 2'),
  ('email',         'info@cacanhthanhliem.com',                                  'Email'),
  ('address',       '223A2 Nguyễn Văn Linh, Bình Chánh, TP.HCM',              'Địa chỉ'),
  ('facebook_url',  'https://facebook.com/CaCanhThanhLiem',                    'Facebook URL'),
  ('zalo_url',      'https://zalo.me/0909633203',                              'Zalo URL'),
  ('business_hours','7:00 - 20:00 (Tất cả các ngày trong tuần)',               'Giờ mở cửa'),
  ('founded_year',  '2009',                                                     'Năm thành lập');

-- ============================================================
-- 8. ADMIN USERS (tài khoản quản trị)
-- ============================================================
-- Dùng Supabase Auth làm identity provider
-- Bảng này mở rộng auth.users với role và metadata
create type admin_role as enum ('superadmin', 'staff');

create table public.admin_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  display_name text not null,
  role         admin_role not null default 'staff',
  is_active    boolean not null default true,
  created_by   uuid references public.admin_users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger admin_users_updated_at
  before update on public.admin_users
  for each row execute function update_updated_at();

create index idx_admin_users_username on public.admin_users (username);
create index idx_admin_users_role     on public.admin_users (role);

-- ============================================================
-- 9. STORAGE BUCKETS (chạy trong Supabase Dashboard)
-- ============================================================
-- Tạo các bucket sau trong Storage > New bucket:
--
-- Bucket name       | Public | Allowed MIME types
-- ──────────────────|────────|──────────────────────────────────
-- product-images    | YES    | image/jpeg, image/png, image/webp
-- product-videos    | YES    | video/mp4, video/quicktime
-- banners           | YES    | image/jpeg, image/png, image/webp
-- site-videos       | YES    | video/mp4, video/quicktime

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Categories: public read, admin write
alter table public.categories enable row level security;
create policy "Public read categories"
  on public.categories for select using (is_visible = true);
create policy "Admin manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated');

-- Products: public read available, admin all
alter table public.products enable row level security;
create policy "Public read products"
  on public.products for select using (status != 'hidden');
create policy "Admin manage products"
  on public.products for all
  using (auth.role() = 'authenticated');

-- Product media: public read
alter table public.product_media enable row level security;
create policy "Public read media"
  on public.product_media for select using (true);
create policy "Admin manage media"
  on public.product_media for all
  using (auth.role() = 'authenticated');

-- Banners: public read visible, admin all
alter table public.banners enable row level security;
create policy "Public read banners"
  on public.banners for select using (is_visible = true);
create policy "Admin manage banners"
  on public.banners for all
  using (auth.role() = 'authenticated');

-- Videos: public read visible, admin all
alter table public.videos enable row level security;
create policy "Public read videos"
  on public.videos for select using (is_visible = true);
create policy "Admin manage videos"
  on public.videos for all
  using (auth.role() = 'authenticated');

-- Inquiries: public insert only, admin read/write
alter table public.inquiries enable row level security;
create policy "Public submit inquiry"
  on public.inquiries for insert with check (true);
create policy "Admin manage inquiries"
  on public.inquiries for all
  using (auth.role() = 'authenticated');

-- Site settings: public read, admin write
alter table public.site_settings enable row level security;
create policy "Public read settings"
  on public.site_settings for select using (is_public = true);
create policy "Admin manage settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated');

-- Admin users: admin only
alter table public.admin_users enable row level security;
create policy "Admin read users"
  on public.admin_users for select
  using (auth.role() = 'authenticated');
create policy "Superadmin manage users"
  on public.admin_users for all
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- ============================================================
-- 11. VIEW TIỆN ÍCH
-- ============================================================

-- Sản phẩm kèm tên danh mục và URL ảnh chính
create or replace view public.products_with_category as
select
  p.*,
  c.name  as category_name,
  c.slug  as category_slug,
  pm.public_url as primary_image_url
from public.products p
join public.categories c on p.category_id = c.id
left join public.product_media pm
  on pm.product_id = p.id and pm.is_primary = true and pm.media_type = 'image';

-- Số lượng sản phẩm theo danh mục
create or replace view public.category_product_counts as
select
  c.id,
  c.slug,
  c.name,
  count(p.id) filter (where p.status = 'available') as available_count,
  count(p.id) as total_count
from public.categories c
left join public.products p on p.category_id = c.id
group by c.id, c.slug, c.name;

-- ============================================================
-- 12. FUNCTION: INCREMENT VIEW COUNT
-- ============================================================
create or replace function increment_product_view(product_slug text)
returns void as $$
  update public.products
  set view_count = view_count + 1
  where slug = product_slug;
$$ language sql security definer;
