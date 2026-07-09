# AUDIT REPORT & DATABASE DESIGN
# Cá Cảnh Thanh Liêm — Production Readiness
# Generated: 2025-06-12

═══════════════════════════════════════════════════════════════
PHẦN 1: AUDIT TOÀN BỘ SOURCE CODE
═══════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────
1.1 DỮ LIỆU ĐANG HARDCODE (không đổi được khi không sửa code)
───────────────────────────────────────────────────────────────

[CRITICAL] lib/constants.ts — SITE_CONFIG
  Toàn bộ thông tin cửa hàng hardcode:
  - phone: "0909 633 203", phone2: "0931 44 42 40"
  - address: "223A2 Nguyễn Văn Linh..."
  - email: "info@cacanhthanhliem.com"
  - facebook: "https://facebook.com/CaCanhThanhLiem"
  - zalo: "https://zalo.me/0909633203"
  - hours: "7:00 - 20:00 (Tất cả các ngày trong tuần)"
  - founded: 2009
  → Chủ cửa hàng không thể tự đổi số điện thoại, giờ mở cửa.

[CRITICAL] lib/auth/accounts.ts — In-memory account store
  - global.__tlAccounts = [DEFAULT_ADMIN]
  - Dữ liệu tài khoản RESET mỗi khi server restart
  - Không có tài khoản nào được lưu persistent
  - Password hashing dùng thuật toán tự viết, không phải bcrypt
  - Không dùng Supabase Auth

[HIGH] lib/auth/session.ts
  - SESSION_SECRET fallback hardcode trong code: "tl_cacanh_secret_2025_ASCII_only_safe_key_abcdefgh"
  - Nếu không set env SESSION_SECRET, secret bị lộ trong source

[HIGH] types/index.ts — CategorySlug type
  - CategorySlug = "ca-bien" | "ca-dia" | "ca-la-han" | ...
  - Hardcode danh sách slug, thêm danh mục phải sửa type

[MEDIUM] app/about/page.tsx
  - Hardcode toàn bộ nội dung: lịch sử, team, milestones
  - Không thể chỉnh sửa từ Admin

[MEDIUM] components/sections/HeroBannerSlider.tsx
  - DEFAULT_SLIDES hardcode 3 gradient slides
  - Khi restart server, banner đã upload qua Admin bị mất

───────────────────────────────────────────────────────────────
1.2 DỮ LIỆU ĐANG DÙNG MOCK (mất khi refresh/restart)
───────────────────────────────────────────────────────────────

[CRITICAL] lib/data.ts — MOCK_PRODUCTS (8 sản phẩm)
  - 8 sản phẩm demo với emoji placeholder, không có ảnh thật
  - Mọi thêm/sửa/xóa sản phẩm từ Admin đều mất khi reload trang
  - useStatein AdminProductsClient, không gọi API
  - Các helper functions (getProductBySlug, getFeaturedProducts...)
    đều đọc từ array in-memory

[CRITICAL] lib/data.ts — MOCK_CATEGORIES (6 danh mục)
  - 6 danh mục demo với count hardcode (4, 12, 8, 25, 6, 30)
  - Count không thực sự đếm từ products table
  - Thêm/sửa/xóa danh mục từ Admin mất khi reload

[CRITICAL] components/admin/AdminBannersClient.tsx — DEFAULTS
  - 3 gradient banner defaults
  - Upload ảnh banner chỉ lưu base64 trong React state
  - Khi navigate sang trang khác → banner mất hết

[CRITICAL] components/admin/AdminVideosClient.tsx — INITIAL
  - 3 video placeholder items hardcode
  - Upload video chỉ lưu base64 trong React state
  - Không persist qua page reload

[CRITICAL] components/admin/AdminCategoriesClient.tsx — INITIAL
  - 6 danh mục clone từ MOCK_CATEGORIES
  - Thay đổi không đồng bộ với ProductsClient
  - Thêm danh mục ở đây không ảnh hưởng dropdown ở trang sản phẩm

[HIGH] app/admin/orders/page.tsx — MOCK_ORDERS
  - 5 đơn hàng demo hardcode
  - Không có order nào thực sự được lưu từ contact form

[HIGH] components/admin/AdminAccountsClient.tsx
  - Fetch từ /api/admin/accounts nhưng API đọc global.__tlAccounts
  - Tài khoản tạo mới mất khi server restart

[HIGH] components/sections/VideoShowcase.tsx — PLACEHOLDER_VIDEOS
  - 3 video placeholder với emoji thay vì video thật
  - Không kết nối với AdminVideosClient

[MEDIUM] app/admin/page.tsx — stats object
  - stats tính từ MOCK_PRODUCTS array
  - pendingOrders: hardcode = 3

───────────────────────────────────────────────────────────────
1.3 TÍNH NĂNG CHƯA HOẠT ĐỘNG (fake/simulated)
───────────────────────────────────────────────────────────────

[CRITICAL] ContactClient.tsx — Form gửi tin nhắn
  - await new Promise((r) => setTimeout(r, 1000)) — fake delay
  - Không gửi email thực
  - Không lưu vào database
  - Không có API route /api/contact

[CRITICAL] Image/Video Storage
  - Media upload chỉ lưu base64 vào React useState
  - Không upload lên Supabase Storage hay bất kỳ CDN nào
  - File ảnh/video lớn sẽ làm chậm browser (base64 in memory)
  - Không thể share ảnh giữa các tab/session/users

[HIGH] Email Notification
  - RESEND_API_KEY có trong .env.local nhưng chưa implement
  - Không có email gửi đến admin khi có đơn hàng mới

[HIGH] Order/Inquiry System
  - Contact form submit không lưu vào DB
  - AdminOrdersClient hiện mock data, không kết nối form

[MEDIUM] Product Search
  - searchProducts() đọc MOCK_PRODUCTS
  - Không có full-text search thực sự

═══════════════════════════════════════════════════════════════
PHẦN 2: CÁC LỖI UI/UX HIỆN CÓ
═══════════════════════════════════════════════════════════════

[HIGH] Product Card/Detail — không có ảnh thật
  - Hiển thị chữ cái đầu tiên của tên trong vòng tròn xanh
  - Trông thiếu chuyên nghiệp với khách hàng thật
  - Cần Supabase Storage cho product images

[HIGH] Banner Slider
  - Ảnh upload qua Admin không hiển thị trên trang chủ
  - Slider chỉ hiển thị DEFAULT_SLIDES gradient
  - Không có cơ chế sync giữa AdminBannersClient ↔ HeroBannerSlider

[MEDIUM] Video Showcase (trang chủ)
  - Hiển thị PLACEHOLDER_VIDEOS (emoji + gradient)
  - Không kết nối với video admin đã upload

[MEDIUM] Category count
  - Tất cả category count = 0 hoặc hardcode
  - Không reflect số sản phẩm thực tế

[LOW] About page
  - Team members dùng initial avatar (chữ đầu tên)
  - Nội dung không thể edit từ Admin

═══════════════════════════════════════════════════════════════
PHẦN 3: CÁC LỖI ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════

[CRITICAL] Mất dữ liệu khi refresh
  - Mọi thay đổi (sản phẩm, banner, video, category, account)
    đều mất khi F5 hoặc restart server
  - Admin không thể tin tưởng dashboard phản ánh trạng thái thực

[CRITICAL] Tài khoản Admin
  - Tạo tài khoản nhân viên → mất khi server restart
  - Đăng nhập lại phải dùng mật khẩu mặc định admin/TL@Admin2025

[HIGH] Dashboard Stats
  - "3 yêu cầu chờ xử lý" — hardcode, không thực
  - Product count đúng nhưng từ mock array

[HIGH] AdminProductsClient ↔ app/products/page.tsx
  - Thêm sản phẩm từ Admin không hiện ra trang /products
  - Hai nơi dùng 2 nguồn dữ liệu khác nhau (state vs MOCK_PRODUCTS)

[HIGH] AdminCategoriesClient ↔ ProductsClient
  - Thêm danh mục ở Admin không cập nhật dropdown filter ở /products
  - CategorySlug type cần update thủ công trong code

[MEDIUM] AdminBannersClient
  - Crop preview đúng nhưng banner không persist
  - Không có cơ chế push to frontend

═══════════════════════════════════════════════════════════════
PHẦN 4: THIẾT KẾ DATABASE SUPABASE — PRODUCTION READY
═══════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────
4.1 DANH SÁCH BẢNG
───────────────────────────────────────────────────────────────

1.  categories          — Danh mục sản phẩm
2.  products            — Sản phẩm cá cảnh
3.  product_media       — Ảnh & video sản phẩm (Supabase Storage)
4.  product_tags        — Tags của sản phẩm (featured, new)
5.  banners             — Banner trang chủ
6.  videos              — Video trang chủ
7.  inquiries           — Liên hệ/đặt hàng từ khách
8.  site_settings       — Cấu hình cửa hàng (phone, address...)
9.  admin_users         — Tài khoản quản trị (dùng Supabase Auth)

───────────────────────────────────────────────────────────────
4.2 ERD — ENTITY RELATIONSHIP DIAGRAM
───────────────────────────────────────────────────────────────

┌─────────────────┐       ┌──────────────────────┐
│   categories    │       │      products        │
├─────────────────┤       ├──────────────────────┤
│ id (uuid) PK    │◄──────│ id (uuid) PK         │
│ slug (text) UQ  │       │ category_id (uuid) FK│
│ name (text)     │       │ slug (text) UQ        │
│ description     │       │ name (text)           │
│ display_order   │       │ description (text)    │
│ is_visible      │       │ long_description      │
│ product_count*  │       │ status (enum)         │
│ created_at      │       │ is_featured (bool)    │
│ updated_at      │       │ is_new (bool)         │
└─────────────────┘       │ view_count (int)      │
                          │ display_order (int)   │
                          │ created_at            │
                          │ updated_at            │
                          └──────────────────────┘
                                    │
              ┌─────────────────────┤
              │                     │
              ▼                     ▼
┌──────────────────────┐   ┌──────────────────────┐
│   product_media      │   │   product_tags       │
├──────────────────────┤   ├──────────────────────┤
│ id (uuid) PK         │   │ product_id (uuid) FK │
│ product_id (uuid) FK │   │ tag (enum)           │
│ storage_path (text)  │   │ PRIMARY KEY (pid,tag)│
│ public_url (text)    │   └──────────────────────┘
│ media_type (enum)    │
│ is_primary (bool)    │   ┌──────────────────────┐
│ display_order (int)  │   │      banners         │
│ file_name (text)     │   ├──────────────────────┤
│ file_size (bigint)   │   │ id (uuid) PK         │
│ created_at           │   │ banner_type (enum)   │
└──────────────────────┘   │ title (text)         │
                           │ subtitle (text)      │
┌──────────────────────┐   │ storage_path (text)  │
│      videos          │   │ public_url (text)    │
├──────────────────────┤   │ bg_from (text)       │
│ id (uuid) PK         │   │ bg_to (text)         │
│ title (text)         │   │ position_x (numeric) │
│ storage_path (text)  │   │ position_y (numeric) │
│ public_url (text)    │   │ zoom (numeric)       │
│ file_name (text)     │   │ is_visible (bool)    │
│ file_size (bigint)   │   │ display_order (int)  │
│ is_visible (bool)    │   │ created_at           │
│ display_order (int)  │   │ updated_at           │
│ created_at           │   └──────────────────────┘
│ updated_at           │
└──────────────────────┘   ┌──────────────────────┐
                           │    site_settings     │
┌──────────────────────┐   ├──────────────────────┤
│     inquiries        │   │ key (text) PK        │
├──────────────────────┤   │ value (text)         │
│ id (uuid) PK         │   │ updated_at           │
│ customer_name (text) │   └──────────────────────┘
│ phone (text)         │
│ email (text)         │   ┌──────────────────────┐
│ subject (text)       │   │    admin_users       │
│ message (text)       │   │  (Supabase Auth)     │
│ product_refs (jsonb) │   ├──────────────────────┤
│ status (enum)        │   │ id (uuid) PK = auth  │
│ admin_note (text)    │   │ username (text) UQ   │
│ created_at           │   │ display_name (text)  │
│ updated_at           │   │ role (enum)          │
└──────────────────────┘   │ is_active (bool)     │
                           │ created_by (uuid) FK │
                           │ created_at           │
                           └──────────────────────┘

───────────────────────────────────────────────────────────────
4.3 SQL MIGRATION — PRODUCTION READY
───────────────────────────────────────────────────────────────
