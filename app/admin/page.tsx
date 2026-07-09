import type { Metadata } from "next";
import { headers } from "next/headers";
import { MOCK_PRODUCTS } from "@/lib/data";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function AdminPage() {
  const h    = await headers();
  const role = h.get("x-session-role") ?? "staff";

  const stats = {
    totalProducts:     MOCK_PRODUCTS.length,
    availableProducts: MOCK_PRODUCTS.filter((p) => p.status === "available").length,
    featuredProducts:  MOCK_PRODUCTS.filter((p) => p.tags.includes("featured")).length,
    newArrivals:       MOCK_PRODUCTS.filter((p) => p.tags.includes("new")).length,
  };

  return (
    <AdminDashboard
      stats={stats}
      recentProducts={MOCK_PRODUCTS.slice(0, 5)}
      role={role}
    />
  );
}
