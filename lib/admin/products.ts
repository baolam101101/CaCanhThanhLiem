import type { SupabaseClient } from "@supabase/supabase-js";
import { removeStorageObjects, str } from "@/lib/admin/server";
import type { ProductStatus, ProductTag } from "@/types";

// ============================================================
// Product writes shared by POST /api/admin/products and
// PATCH /api/admin/products/[id].
// ============================================================

const STATUSES: ProductStatus[] = ["available", "out_of_stock", "hidden"];
const TAGS: ProductTag[] = ["featured", "new"];

export interface IncomingMedia {
  id?: string;                 // existing product_media row, if any
  type: "image" | "video";
  url: string;
  storagePath?: string | null; // object path in product-images / product-videos
}

/** Validate the product fields of a request body; returns an error message or the patch. */
export function parseProductFields(body: Record<string, unknown>, partial: boolean): { error: string } | { fields: Record<string, unknown> } {
  const fields: Record<string, unknown> = {};

  if (!partial || body.name !== undefined) {
    const name = str(body.name, 200);
    if (!name) return { error: "Vui lòng nhập tên sản phẩm" };
    fields.name = name;
  }
  if (!partial || body.categorySlug !== undefined) {
    const slug = str(body.categorySlug, 120);
    if (!slug) return { error: "Vui lòng chọn danh mục" };
    fields.category_slug = slug;
  }
  if (body.description !== undefined) fields.description = str(body.description, 5000);
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as ProductStatus)) return { error: "Trạng thái không hợp lệ" };
    fields.status = body.status;
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) return { error: "Nhãn không hợp lệ" };
    fields.tags = TAGS.filter((t) => (body.tags as unknown[]).includes(t));
  }
  return { fields };
}

/** Validate an incoming media list (max 30 items, http(s) URLs only). */
export function parseMedia(value: unknown): IncomingMedia[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const out: IncomingMedia[] = [];
  for (const m of value) {
    if (!m || typeof m !== "object") return null;
    const item = m as Record<string, unknown>;
    if (item.type !== "image" && item.type !== "video") return null;
    if (typeof item.url !== "string" || !/^https?:\/\//.test(item.url)) return null;
    out.push({
      id: typeof item.id === "string" ? item.id : undefined,
      type: item.type,
      url: item.url,
      storagePath: typeof item.storagePath === "string" ? item.storagePath : null,
    });
  }
  return out;
}

/** A slug for a new product: slugify(name), suffixed -2, -3… if taken. */
export async function uniqueProductSlug(db: SupabaseClient, base: string): Promise<string> {
  const root = base || "san-pham";
  const { data } = await db.from("products").select("slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}

/**
 * Make the product's media rows match `incoming` (order = display order).
 * Rows (and their files) missing from the list are deleted; the first
 * image becomes the primary (thumbnail).
 */
export async function syncProductMedia(db: SupabaseClient, productId: string, incoming: IncomingMedia[]): Promise<string | null> {
  const { data: existing, error: readErr } = await db
    .from("product_media").select("id, media_type, storage_path").eq("product_id", productId);
  if (readErr) return "Không đọc được ảnh/video hiện có của sản phẩm";

  const existingIds = new Set((existing ?? []).map((e) => e.id as string));
  const keep = new Set(incoming.filter((m) => m.id && existingIds.has(m.id)).map((m) => m.id!));
  const removed = (existing ?? []).filter((e) => !keep.has(e.id));
  const primaryIdx = incoming.findIndex((m) => m.type === "image");

  // Only one primary is allowed at a time, so clear it before reassigning.
  const { error: clearErr } = await db.from("product_media").update({ is_primary: false }).eq("product_id", productId);
  if (clearErr) return "Không cập nhật được ảnh bìa";

  if (removed.length > 0) {
    const { error } = await db.from("product_media").delete().in("id", removed.map((r) => r.id));
    if (error) return "Không xóa được ảnh/video cũ";
  }

  for (let i = 0; i < incoming.length; i++) {
    const m = incoming[i];
    const row = { sort_order: i, is_primary: i === primaryIdx };
    const { error } = m.id && keep.has(m.id)
      ? await db.from("product_media").update(row).eq("id", m.id).eq("product_id", productId)
      : await db.from("product_media").insert({
          ...row, product_id: productId, media_type: m.type, url: m.url, storage_path: m.storagePath ?? null,
        });
    if (error) return "Không lưu được ảnh/video";
  }

  await removeStorageObjects(db, "product-images", removed.filter((r) => r.media_type === "image").map((r) => r.storage_path));
  await removeStorageObjects(db, "product-videos", removed.filter((r) => r.media_type === "video").map((r) => r.storage_path));
  return null;
}
