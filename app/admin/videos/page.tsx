import type { Metadata } from "next";
import { AdminVideosClient } from "@/components/admin/AdminVideosClient";
export const metadata: Metadata = { title: "Quản lý Video" };
export default function AdminVideosPage() { return <AdminVideosClient />; }
