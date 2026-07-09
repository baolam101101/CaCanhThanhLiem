import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, MOCK_PRODUCTS, getRelatedProducts } from "@/lib/data";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PageHeader } from "@/components/shared/PageHeader";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product || product.status === "hidden") notFound();

  const related = getRelatedProducts(product, 4);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/products" },
          { label: product.category, href: `/products?category=${product.categorySlug}` },
          { label: product.name },
        ]}
        title={<span className="sr-only">{product.name}</span>}
        className="py-4 md:py-6"
      />

      {/* Main detail */}
      <section className="bg-white py-8 md:py-12">
        <div className="container-site">
          <ProductDetailClient product={product} />
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-surface-50 section-pad">
          <div className="container-site">
            <SectionHeader
              eyebrow="Có thể bạn thích"
              title={<>Cá cảnh <em className="italic" style={{ color: "#8fb82a" }}>tương tự</em></>}
              className="mb-8 md:mb-10"
            />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" role="list">
              {related.map((p) => (
                <li key={p.id}><ProductCard product={p} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
