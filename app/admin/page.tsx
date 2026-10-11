import type { Metadata } from "next";
import { headers } from "next/headers";
import { listProductsAdmin } from "@/lib/admin/repo";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { NotConfiguredNotice } from "@/components/admin/NotConfiguredNotice";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function AdminPage() {
  const h    = await headers();
  const role = h.get("x-session-role") ?? "staff";

  const fromDb   = await listProductsAdmin();
  const products = fromDb ?? [];

  const stats = {
    totalProducts:     products.length,
    availableProducts: products.filter((p) => p.status === "available").length,
    featuredProducts:  products.filter((p) => p.tags.includes("featured")).length,
    newArrivals:       products.filter((p) => p.tags.includes("new")).length,
  };

  return (
    <>
      {fromDb === null && <NotConfiguredNotice />}
      <AdminDashboard stats={stats} recentProducts={products.slice(0, 5)} role={role} />
    </>
  );
}
