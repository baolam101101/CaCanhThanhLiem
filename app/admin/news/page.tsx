import type { Metadata } from "next";
import { AdminNewsClient } from "@/components/admin/AdminNewsClient";
import { listNewsAdmin } from "@/lib/admin/repo";

export const metadata: Metadata = { title: "Quản lý tin tức" };

export default async function AdminNewsPage() {
  const news = await listNewsAdmin();
  return <AdminNewsClient initialNews={news ?? []} configured={news !== null} />;
}
