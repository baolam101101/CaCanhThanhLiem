import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsBySlug, getPublishedNews, getRelatedNews } from "@/lib/data";
import { NewsDetailClient } from "@/components/news/NewsDetailClient";
import { NewsCard } from "@/components/news/NewsCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PageHeader } from "@/components/shared/PageHeader";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return getPublishedNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return { title: "Không tìm thấy" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  const related = getRelatedNews(article, 4);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/news" },
          { label: article.title },
        ]}
        className="py-4 md:py-5"
      />

      <NewsDetailClient article={article} />

      {related.length > 0 && (
        <section className="bg-surface-50 border-t border-surface-100">
          <div className="container-site py-12 md:py-16">
            <SectionHeader title="Tin tức liên quan" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {related.map((n) => (
                <NewsCard key={n.id} article={n} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
