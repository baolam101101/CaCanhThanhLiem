import type { Metadata } from "next";
import { AdminNewsClient } from "@/components/admin/AdminNewsClient";
import { MOCK_NEWS } from "@/lib/data";

export const metadata: Metadata = { title: "Quản lý tin tức" };

export default function AdminNewsPage() {
  return <AdminNewsClient initialNews={MOCK_NEWS} />;
}
