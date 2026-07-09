import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { NewsListClient } from "@/components/news/NewsListClient";
import { getPublishedNews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tin tức",
  description:
    "Cập nhật tin tức, kiến thức chăm sóc cá cảnh và các chương trình ưu đãi mới nhất từ Cá Cảnh Thanh Liêm.",
};

export default function NewsPage() {
  const news = getPublishedNews();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức" },
        ]}
        title={
          <>
            Tin tức &amp;{" "}
            <em className="text-brand-600 italic">kiến thức</em>
          </>
        }
        subtitle="Cập nhật những thông tin mới nhất về cá cảnh và hoạt động cửa hàng"
      />
      <NewsListClient initialNews={news} />
    </>
  );
}
