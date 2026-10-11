import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, removeStorageObjects, revalidateSiteData } from "@/lib/admin/server";
import { parseMedia, parseProductFields, syncProductMedia } from "@/lib/admin/products";

type Ctx = { params: Promise<{ id: string }> };

// PATCH { name?, categorySlug?, description?, status?, tags?, media? }
// The slug is kept on rename so links already shared keep working.
export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseProductFields(body, true);
  if ("error" in parsed) return jsonError(400, parsed.error);

  if (Object.keys(parsed.fields).length > 0) {
    const { error } = await ctx.db.from("products").update(parsed.fields).eq("id", id);
    if (error) {
      if (error.code === "23503") return jsonError(400, "Danh mục đã chọn không còn tồn tại");
      return dbError(error, "sản phẩm");
    }
  }

  if (body.media !== undefined) {
    const media = parseMedia(body.media);
    if (!media) return jsonError(400, "Danh sách ảnh/video không hợp lệ");
    const mediaError = await syncProductMedia(ctx.db, id, media);
    if (mediaError) { revalidateSiteData(); return jsonError(500, mediaError); }
  }

  revalidateSiteData();
  return NextResponse.json({ ok: true });
}

// DELETE — removes the product, its media rows (cascade) and their files.
export async function DELETE(_req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const { data: media } = await ctx.db.from("product_media").select("media_type, storage_path").eq("product_id", id);
  const { error } = await ctx.db.from("products").delete().eq("id", id);
  if (error) return dbError(error, "sản phẩm");

  await removeStorageObjects(ctx.db, "product-images", (media ?? []).filter((m) => m.media_type === "image").map((m) => m.storage_path));
  await removeStorageObjects(ctx.db, "product-videos", (media ?? []).filter((m) => m.media_type === "video").map((m) => m.storage_path));

  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
