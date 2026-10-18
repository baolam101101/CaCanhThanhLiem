import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

// /robots.txt — let crawlers index the public site, keep them out of the
// admin panel and the API, and point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
