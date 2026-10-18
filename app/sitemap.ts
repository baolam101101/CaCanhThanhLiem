import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { getProducts, getPublishedNews } from "@/lib/data";
import { getPrimaryImageUrl } from "@/lib/utils";

// /sitemap.xml — every public page, plus each visible product and
// published article, for search engines (submit it in Google Search
// Console). Hidden products and draft news are already filtered out by
// the data layer / RLS.
//
// The reads share the site-data cache tag, so an admin save refreshes
// this file along with the pages; the hourly revalidate is a backstop.
export const revalidate = 3600;

// Next.js writes these strings into the XML as-is, without escaping, so
// an "&" in an image URL (e.g. a query string) would break the file.
const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const url = (path: string) => xml(`${SITE_CONFIG.url}${path}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getProducts(), getPublishedNews()]);

  const latest = (dates: Date[]) =>
    dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;

  return [
    { url: url("/"), lastModified: latest(products.map((p) => p.updatedAt)), changeFrequency: "daily", priority: 1 },
    { url: url("/products"), lastModified: latest(products.map((p) => p.updatedAt)), changeFrequency: "daily", priority: 0.9 },
    { url: url("/news"), lastModified: latest(news.map((n) => n.updatedAt)), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/chinh-sach-bao-hanh"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/huong-dan-cham-soc-ca-koi"), changeFrequency: "yearly", priority: 0.5 },
    ...products.map((p) => {
      const image = getPrimaryImageUrl(p);
      return {
        url: url(`/products/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(image ? { images: [xml(image)] } : {}),
      };
    }),
    ...news.map((n) => ({
      url: url(`/news/${n.slug}`),
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...(n.featuredImage ? { images: [xml(n.featuredImage)] } : {}),
    })),
  ];
}
