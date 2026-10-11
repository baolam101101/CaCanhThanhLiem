# Kết nối Supabase — Cá Cảnh Thanh Liêm

Khi chưa có biến môi trường Supabase, web hiển thị dữ liệu mẫu và trang admin
không lưu được gì (chỉ để xem thử khi chạy trên máy). Khi đã có, web đọc **chỉ
từ database** — không bao giờ hiện dữ liệu mẫu nữa — và mọi thứ được tạo từ
trang admin.

## 1. Tạo cấu trúc database

`supabase/migrations/` là cấu trúc chuẩn: `0001` → `0011`, chạy theo thứ tự
trong **SQL Editor** (mỗi file một lần). Khi Supabase hỏi về Row Level
Security, chọn **Run and enable RLS**.

- `0010_storage.sql` chạy lại bao nhiêu lần cũng được.
- Supabase không cho SQL `ALTER` bảng `storage.objects` hay `DELETE` trong các
  bảng storage. Các migration đã tránh cả hai; xoá bucket/file thì dùng
  Dashboard.

## 2. Biến môi trường (Vercel → Environment Variables)

| Biến | Lấy ở đâu | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → Data API / API Keys | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API Keys | "Publishable key" (tên cũ: anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys | "Secret key" (tên cũ: service_role). **Không** thêm tiền tố `NEXT_PUBLIC_` |
| `SESSION_SECRET` | `openssl rand -base64 48` | **Bắt buộc**, ≥ 32 ký tự; thiếu thì không đăng nhập admin được |
| `NEXT_PUBLIC_SITE_URL` | | `https://cacanhthanhliem.vn` |
| `RESEND_API_KEY` | https://resend.com/api-keys | Gửi email form liên hệ |
| `CONTACT_TO_EMAIL` | | Hộp thư nhận tin nhắn liên hệ |
| `RESEND_FROM` | | Không bắt buộc. Để trống = người gửi thử nghiệm của Resend, chỉ gửi được tới email của chính tài khoản Resend. Muốn gửi tới email khác: xác minh tên miền trong Resend rồi đặt ví dụ `Cá Cảnh Thanh Liêm <lienhe@cacanhthanhliem.vn>` |

Thêm/sửa biến xong phải **Redeploy** thì mới có hiệu lực.

## 3. Đăng nhập admin lần đầu

`0011_seed_admin.sql` tạo tài khoản `admin` / `TL@Admin2025`. Mật khẩu này nằm
công khai trong repo — đăng nhập xong vào **Tài khoản → biểu tượng chìa khoá**
để đổi ngay.

## 4. Tạo nội dung

Thứ tự: **Danh mục** → **Sản phẩm** (cần ít nhất một danh mục) → Tin tức,
Banner, Video. Khi chưa có banner nào, trang chủ hiện ảnh biển hiệu mặc định.
Mục "Video thực tế" trên trang chủ chỉ hiện khi đã có video.

Giới hạn file (gói Free của Supabase giới hạn 50 MB mỗi file):
ảnh sản phẩm / tin tức 5 MB, banner 8 MB, video 50 MB.
