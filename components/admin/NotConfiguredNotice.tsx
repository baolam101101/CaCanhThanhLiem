import { AlertTriangle } from "lucide-react";

// Shown on admin pages while the Supabase env vars are missing: the page
// still renders, but nothing can be saved.
export function NotConfiguredNotice() {
  return (
    <div role="alert" className="mb-6 flex gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden />
      <p>
        <strong>Chưa kết nối Supabase.</strong> Trang này đang chạy ở chế độ xem thử, mọi thay đổi sẽ không được lưu.
        Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> và{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> vào biến môi trường rồi deploy lại.
      </p>
    </div>
  );
}
