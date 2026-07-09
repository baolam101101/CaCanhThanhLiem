import type { Metadata } from "next";
import { AdminBannersClient } from "@/components/admin/AdminBannersClient";
export const metadata: Metadata = { title: "Quản lý Banner" };
export default function AdminBannersPage() { return <AdminBannersClient />; }
