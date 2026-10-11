import type { Metadata } from "next";
import { AdminBannersClient } from "@/components/admin/AdminBannersClient";
import { listBannersAdmin } from "@/lib/admin/repo";

export const metadata: Metadata = { title: "Quản lý Banner" };

export default async function AdminBannersPage() {
  const banners = await listBannersAdmin();
  return <AdminBannersClient initialBanners={banners ?? []} configured={banners !== null} />;
}
