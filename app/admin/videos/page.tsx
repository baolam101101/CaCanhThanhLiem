import type { Metadata } from "next";
import { AdminVideosClient } from "@/components/admin/AdminVideosClient";
import { listVideosAdmin } from "@/lib/admin/repo";

export const metadata: Metadata = { title: "Quản lý Video" };

export default async function AdminVideosPage() {
  const videos = await listVideosAdmin();
  return <AdminVideosClient initialVideos={videos ?? []} configured={videos !== null} />;
}
