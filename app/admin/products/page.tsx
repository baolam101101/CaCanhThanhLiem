import type { Metadata } from "next";
import { MOCK_PRODUCTS } from "@/lib/data";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default function AdminProductsPage() {
  return <AdminProductsClient initialProducts={MOCK_PRODUCTS} />;
}
