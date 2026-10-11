import type { Product, Category, NewsArticle, ProductMedia, SiteVideo } from "@/types";
import type { SlideData } from "@/components/sections/HeroBannerSlider";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig, SUPABASE_ENABLED } from "@/lib/supabase/config";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_NEWS } from "@/lib/mock-data";
import { SITE_DATA_TAG } from "@/lib/cache-tags";

// ============================================================
// PUBLIC SITE DATA (server-side repository)
// ------------------------------------------------------------
// Reads go through a cookie-less anon client, so the RLS "public read"
// policies decide what the site can see (no hidden products, no
// unpublished news, no hidden banners/videos/categories).
//
// Caching: every Supabase request is a fetch tagged SITE_DATA_TAG and
// cached for REVALIDATE_SECONDS. Admin writes call revalidateSiteData()
// (lib/admin/revalidate.ts), so edits show up on the next page load.
//
// Mock data is used ONLY when Supabase is not configured. When it is
// configured, a failed query returns an empty result instead — the live
// site must never show made-up products.
// ============================================================

const REVALIDATE_SECONDS = 300;

let _readClient: SupabaseClient | null = null;

function getReadClient(): SupabaseClient | null {
  if (!SUPABASE_ENABLED || !supabaseConfig) return null;
  if (!_readClient) {
    _readClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            next: { revalidate: REVALIDATE_SECONDS, tags: [SITE_DATA_TAG] },
          }),
      },
    });
  }
  return _readClient;
}

function logError(where: string, error: unknown) {
  console.error(`[data] ${where}:`, error);
}

// ============================================================
// ROW SHAPES + MAPPERS
// ============================================================
interface MediaRow {
  id: string;
  media_type: "image" | "video";
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  latin: string | null;
  category_slug: string;
  status: Product["status"];
  tags: Product["tags"];
  description: string;
  long_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  category: { name: string } | null;
  media: MediaRow[] | null;
}

export const PRODUCT_COLUMNS =
  "id, slug, name, name_en, latin, category_slug, status, tags, description, " +
  "long_description, view_count, created_at, updated_at, " +
  "category:categories(name), " +
  "media:product_media(id, media_type, url, alt, is_primary, sort_order)";

export function mapMedia(rows: MediaRow[] | null): ProductMedia[] {
  return [...(rows ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((m) => ({ id: m.id, type: m.media_type, url: m.url, alt: m.alt, isPrimary: m.is_primary }));
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en ?? undefined,
    latin: row.latin ?? undefined,
    category: row.category?.name ?? "",
    categorySlug: row.category_slug,
    status: row.status,
    tags: row.tags ?? [],
    description: row.description,
    longDescription: row.long_description ?? undefined,
    media: mapMedia(row.media),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    viewCount: row.view_count,
  };
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  description: string;
  image_url: string | null;
  visible: boolean;
  sort_order: number;
  products: { count: number }[] | null;
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en ?? undefined,
    description: row.description,
    count: row.products?.[0]?.count ?? 0,
    imageUrl: row.image_url ?? undefined,
    visible: row.visible,
    sortOrder: row.sort_order,
  };
}

export interface NewsRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: NewsArticle["content"];
  featured_image: string;
  featured_image_pos_x: number | null;
  featured_image_pos_y: number | null;
  featured_image_zoom: number | null;
  published: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export const NEWS_COLUMNS =
  "id, title, slug, excerpt, content, featured_image, featured_image_pos_x, " +
  "featured_image_pos_y, featured_image_zoom, published, display_order, created_at, updated_at";

export function mapNewsRow(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: Array.isArray(row.content) ? row.content : [],
    featuredImage: row.featured_image,
    featuredImagePosX: row.featured_image_pos_x ?? undefined,
    featuredImagePosY: row.featured_image_pos_y ?? undefined,
    featuredImageZoom: row.featured_image_zoom ?? undefined,
    published: row.published,
    displayOrder: row.display_order ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// CATEGORIES
// ============================================================
/** Visible categories in admin order, each with its public product count. */
export async function getCategories(): Promise<Category[]> {
  const supabase = getReadClient();
  if (!supabase) return [...MOCK_CATEGORIES];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, name_en, description, image_url, visible, sort_order, products(count)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    logError("getCategories", error);
    return [];
  }
  return (data as unknown as CategoryRow[]).map(mapCategoryRow);
}

// ============================================================
// PRODUCTS
// ============================================================
/** Every product the public may see (RLS hides hidden/deleted ones). */
export async function getProducts(): Promise<Product[]> {
  const supabase = getReadClient();
  if (!supabase) return MOCK_PRODUCTS.filter((p) => p.status !== "hidden");

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) {
    logError("getProducts", error);
    return [];
  }
  return (data as unknown as ProductRow[]).map(mapProductRow);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getReadClient();
  if (!supabase) return MOCK_PRODUCTS.find((p) => p.slug === slug && p.status !== "hidden");

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) logError("getProductBySlug", error);
  return data ? mapProductRow(data as unknown as ProductRow) : undefined;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = getReadClient();
  if (!supabase) {
    return MOCK_PRODUCTS.filter((p) => p.tags.includes("featured") && p.status !== "hidden").slice(0, limit);
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .contains("tags", ["featured"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    logError("getFeaturedProducts", error);
    return [];
  }
  return (data as unknown as ProductRow[]).map(mapProductRow);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = getReadClient();
  if (!supabase) {
    return MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && p.categorySlug === product.categorySlug && p.status !== "hidden"
    ).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("category_slug", product.categorySlug)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    logError("getRelatedProducts", error);
    return [];
  }
  return (data as unknown as ProductRow[]).map(mapProductRow);
}

// ============================================================
// NEWS
// ============================================================
/** Published articles, newest first (RLS hides drafts and deleted ones). */
export async function getPublishedNews(): Promise<NewsArticle[]> {
  const supabase = getReadClient();
  if (!supabase) {
    return MOCK_NEWS
      .filter((n) => n.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const { data, error } = await supabase
    .from("news_articles")
    .select(NEWS_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) {
    logError("getPublishedNews", error);
    return [];
  }
  return (data as unknown as NewsRow[]).map(mapNewsRow);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  const supabase = getReadClient();
  if (!supabase) return MOCK_NEWS.find((n) => n.slug === slug && n.published);

  const { data, error } = await supabase
    .from("news_articles")
    .select(NEWS_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) logError("getNewsBySlug", error);
  return data ? mapNewsRow(data as unknown as NewsRow) : undefined;
}

export async function getRelatedNews(current: NewsArticle, limit = 4): Promise<NewsArticle[]> {
  return (await getPublishedNews()).filter((n) => n.id !== current.id).slice(0, limit);
}

// ============================================================
// HOMEPAGE: BANNERS + VIDEOS
// ============================================================
// Shown when no banner has been uploaded yet (or Supabase is not
// configured): the shop's own signboard, whole, on its own green.
const DEFAULT_BANNERS: SlideData[] = [
  {
    id: "default-signboard",
    imageDataUrl: "/images/banner-sign.jpg",
    objectPositionX: 50, objectPositionY: 50, zoom: 1,
    fit: "contain", background: "#A8CF36",
  },
];

interface BannerRow {
  id: string;
  image_url: string | null;
  object_position_x: number | null;
  object_position_y: number | null;
  zoom: number;
  fit: "cover" | "contain";
  background: string | null;
}

export async function getBanners(): Promise<SlideData[]> {
  const supabase = getReadClient();
  if (!supabase) return DEFAULT_BANNERS;

  const { data, error } = await supabase
    .from("banners")
    .select("id, image_url, object_position_x, object_position_y, zoom, fit, background")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    logError("getBanners", error);
    return DEFAULT_BANNERS;
  }
  const slides = (data as BannerRow[])
    .filter((b) => b.image_url)
    .map((b) => ({
      id: b.id,
      imageDataUrl: b.image_url ?? undefined,
      objectPositionX: b.object_position_x ?? 50,
      objectPositionY: b.object_position_y ?? 50,
      zoom: Number(b.zoom) || 1,
      fit: b.fit,
      background: b.background ?? undefined,
    }));
  return slides.length > 0 ? slides : DEFAULT_BANNERS;
}

/** Clips for the homepage "Video thực tế" section. Empty until uploaded. */
export async function getSiteVideos(): Promise<SiteVideo[]> {
  const supabase = getReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("videos")
    .select("id, title, video_url, uploaded_at")
    .order("uploaded_at", { ascending: false });

  if (error || !data) {
    logError("getSiteVideos", error);
    return [];
  }
  return (data as { id: string; title: string; video_url: string | null; uploaded_at: string }[])
    .filter((v) => v.video_url)
    .map((v) => ({ id: v.id, title: v.title, url: v.video_url!, uploadedAt: new Date(v.uploaded_at) }));
}
