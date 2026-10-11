import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductsClient } from "@/components/product/ProductsClient";
import { getProducts, getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Khám phá các dòng Cá Koi & Koi Đuôi Dài tuyển chọn, nuôi dưỡng trực tiếp tại Trang Trại Cá Cảnh Thanh Liêm.",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm" },
        ]}
        title={
          <>
            Bộ sưu tập{" "}
            <em className="text-brand-600 italic">cá cảnh</em>
          </>
        }
        subtitle="Tuyển chọn những loài cá đẹp nhất từ khắp nơi trên thế giới"
      />
      <Suspense
        fallback={
          <div className="container-site py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-100 aspect-[3/4] skeleton"
                />
              ))}
            </div>
          </div>
        }
      >
        <ProductsClient initialProducts={products} categories={categories} />
      </Suspense>
    </>
  );
}
