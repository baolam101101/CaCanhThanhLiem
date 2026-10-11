import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsContentBlock } from "@/types";
import { removeStorageObjects, str } from "@/lib/admin/server";

// ============================================================
// News writes shared by POST /api/admin/news and PATCH /api/admin/news/[id].
// ============================================================

/** Validate the article fields of a request body. */
export function parseNewsFields(body: Record<string, unknown>, partial: boolean): { error: string } | { fields: Record<string, unknown> } {
  const f: Record<string, unknown> = {};

  if (!partial || body.title !== undefined) {
    const title = str(body.title, 300);
    if (!title) return { error: "Vui lòng nhập tiêu đề" };
    f.title = title;
  }
  if (!partial || body.excerpt !== undefined) {
    const excerpt = str(body.excerpt, 1000);
    if (!excerpt) return { error: "Vui lòng nhập mô tả ngắn" };
    f.excerpt = excerpt;
  }
  if (!partial || body.featuredImage !== undefined) {
    const img = str(body.featuredImage, 2000);
    if (!/^https?:\/\//.test(img)) return { error: "Vui lòng chọn ảnh đại diện" };
    f.featured_image = img;
  }
  for (const [key, col] of [["featuredImagePosX", "featured_image_pos_x"], ["featuredImagePosY", "featured_image_pos_y"], ["featuredImageZoom", "featured_image_zoom"]] as const) {
    if (body[key] !== undefined) {
      const n = Number(body[key]);
      if (!Number.isFinite(n)) return { error: "Vị trí ảnh không hợp lệ" };
      f[col] = n;
    }
  }
  if (body.published !== undefined) f.published = body.published === true;
  if (!partial || body.content !== undefined) {
    const content = parseContent(body.content ?? []);
    if (!content) return { error: "Nội dung bài viết không hợp lệ" };
    f.content = content;
  }
  return { fields: f };
}

function parseContent(value: unknown): NewsContentBlock[] | null {
  if (!Array.isArray(value) || value.length > 300) return null;
  const out: NewsContentBlock[] = [];
  for (const b of value) {
    if (!b || typeof b !== "object") return null;
    const block = b as Record<string, unknown>;
    switch (block.type) {
      case "heading":
      case "paragraph":
        out.push({ type: block.type, text: str(block.text, 20000) });
        break;
      case "list":
        if (!Array.isArray(block.items)) return null;
        out.push({ type: "list", items: block.items.slice(0, 200).map((i) => str(i, 2000)) });
        break;
      case "image":
        if (typeof block.url !== "string") return null;
        // An image block left empty is dropped rather than saved.
        if (/^https?:\/\//.test(block.url)) out.push({ type: "image", url: block.url, caption: str(block.caption, 500) });
        break;
      default:
        return null;
    }
  }
  return out;
}

/** A slug for a new article: slugify(title), suffixed -2, -3… if taken. */
export async function uniqueNewsSlug(db: SupabaseClient, base: string): Promise<string> {
  const root = base || "tin-tuc";
  const { data } = await db.from("news_articles").select("slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}

const NEWS_BUCKET_MARKER = "/storage/v1/object/public/news-images/";

/** Object paths in news-images referenced by an article (featured + inline). */
export function newsImagePaths(article: { featured_image?: unknown; content?: unknown }): Set<string> {
  const urls: string[] = [];
  if (typeof article.featured_image === "string") urls.push(article.featured_image);
  if (Array.isArray(article.content)) {
    for (const b of article.content as { type?: string; url?: unknown }[]) {
      if (b?.type === "image" && typeof b.url === "string") urls.push(b.url);
    }
  }
  const paths = new Set<string>();
  for (const u of urls) {
    const i = u.indexOf(NEWS_BUCKET_MARKER);
    if (i >= 0) paths.add(decodeURIComponent(u.slice(i + NEWS_BUCKET_MARKER.length).split("?")[0]));
  }
  return paths;
}

/** Remove news images that `before` used and `after` no longer does. */
export async function removeUnusedNewsImages(db: SupabaseClient, before: Set<string>, after: Set<string>) {
  await removeStorageObjects(db, "news-images", [...before].filter((p) => !after.has(p)));
}
