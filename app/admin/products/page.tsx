import type { Metadata } from "next";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { listCategoriesAdmin, listProductsAdmin } from "@/lib/admin/repo";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listProductsAdmin(), listCategoriesAdmin()]);
  return (
    <AdminProductsClient
      initialProducts={products ?? []}
      categories={categories ?? []}
      configured={products !== null}
    />
  );
}
