import type { Metadata } from "next";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import { listCategoriesAdmin } from "@/lib/admin/repo";

export const metadata: Metadata = { title: "Quản lý danh mục" };

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();
  return <AdminCategoriesClient initialCategories={categories ?? []} configured={categories !== null} />;
}
