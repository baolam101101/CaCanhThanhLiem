import type { Metadata } from "next";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
export const metadata: Metadata = { title: "Quản lý danh mục" };
export default function AdminCategoriesPage() { return <AdminCategoriesClient />; }
