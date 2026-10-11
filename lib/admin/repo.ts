import type { Category, NewsArticle, Product } from "@/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { mapNewsRow, mapProductRow, NEWS_COLUMNS, PRODUCT_COLUMNS, type NewsRow, type ProductRow } from "@/lib/data";

// ============================================================
// Admin-side reads. Uses the service-role client, so it sees what the
// public cannot: hidden products and categories, draft news, hidden
// banners and videos. Never cached — the admin must see the live state.
//
// Each function returns null when Supabase is not configured, so the
// admin pages can say so instead of showing an empty list.
// ============================================================

export interface AdminBanner {
  id: string;
  imageUrl: string;
  imageName: string;
  objectPositionX: number;
  objectPositionY: number;
  zoom: number;
  fit: "cover" | "contain";
  background: string;
  visible: boolean;
  order: number;
}

export interface AdminVideo {
  id: string;
  title: string;
  url: string;
  fileName: string;
  visible: boolean;
  uploadedAt: string;
}

export async function listCategoriesAdmin(): Promise<Category[] | null> {
  const db = await getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("categories")
    .select("id, slug, name, name_en, description, image_url, visible, sort_order, products(count)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) { console.error("[admin] categories", error); return []; }
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameEn: r.name_en ?? undefined,
    description: r.description,
    count: (r.products as { count: number }[] | null)?.[0]?.count ?? 0,
    imageUrl: r.image_url ?? undefined,
    visible: r.visible,
    sortOrder: r.sort_order,
  }));
}

export async function listProductsAdmin(): Promise<Product[] | null> {
  const db = await getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) { console.error("[admin] products", error); return []; }
  return (data as unknown as ProductRow[]).map(mapProductRow);
}

export async function listNewsAdmin(): Promise<NewsArticle[] | null> {
  const db = await getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("news_articles")
    .select(NEWS_COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) { console.error("[admin] news", error); return []; }
  return (data as unknown as NewsRow[]).map(mapNewsRow);
}

export async function listBannersAdmin(): Promise<AdminBanner[] | null> {
  const db = await getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("banners")
    .select("id, image_url, image_name, object_position_x, object_position_y, zoom, fit, background, visible, sort_order")
    .order("sort_order", { ascending: true });
  if (error) { console.error("[admin] banners", error); return []; }
  return (data ?? []).map((b) => ({
    id: b.id,
    imageUrl: b.image_url ?? "",
    imageName: b.image_name ?? "",
    objectPositionX: Number(b.object_position_x ?? 50),
    objectPositionY: Number(b.object_position_y ?? 50),
    zoom: Number(b.zoom ?? 1),
    fit: b.fit,
    background: b.background ?? "",
    visible: b.visible,
    order: b.sort_order,
  }));
}

export async function listVideosAdmin(): Promise<AdminVideo[] | null> {
  const db = await getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("videos")
    .select("id, title, video_url, file_name, visible, uploaded_at")
    .order("uploaded_at", { ascending: false });
  if (error) { console.error("[admin] videos", error); return []; }
  return (data ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    url: v.video_url ?? "",
    fileName: v.file_name ?? "",
    visible: v.visible,
    uploadedAt: v.uploaded_at,
  }));
}
