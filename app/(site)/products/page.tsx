import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductsClient } from "@/components/product/ProductsClient";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Khám phá hơn 200 loài cá cảnh quý hiếm nhập khẩu tại Cá Cảnh Thanh Liêm. Cá biển, cá đĩa, cá la hán, cá rồng và nhiều hơn nữa.",
};

export default function ProductsPage() {
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
        <ProductsClient
          initialProducts={MOCK_PRODUCTS}
          categories={MOCK_CATEGORIES}
        />
      </Suspense>
    </>
  );
}
