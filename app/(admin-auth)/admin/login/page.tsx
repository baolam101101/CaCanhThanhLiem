import type { Metadata } from "next";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export const metadata: Metadata = {
  title: "Đăng nhập Admin | Cá Cảnh Thanh Liêm",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
