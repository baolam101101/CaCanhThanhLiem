import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData } from "@/lib/admin/server";
import { newsImagePaths, parseNewsFields, removeUnusedNewsImages } from "@/lib/admin/news";

type Ctx = { params: Promise<{ id: string }> };

// PATCH — any subset of the article fields. The slug stays as it is so
// links already shared keep working after a title change.
export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseNewsFields(body, true);
  if ("error" in parsed) return jsonError(400, parsed.error);
  if (Object.keys(parsed.fields).length === 0) return jsonError(400, "Không có gì để cập nhật");

  const { data: before } = await ctx.db.from("news_articles").select("featured_image, content").eq("id", id).maybeSingle();
  const { data: after, error } = await ctx.db
    .from("news_articles").update(parsed.fields).eq("id", id).select("featured_image, content").maybeSingle();
  if (error) return dbError(error, "bài viết");
  if (!after) return jsonError(404, "Không tìm thấy bài viết");

  if (before) await removeUnusedNewsImages(ctx.db, newsImagePaths(before), newsImagePaths(after));
  revalidateSiteData();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const { data: before } = await ctx.db.from("news_articles").select("featured_image, content").eq("id", id).maybeSingle();
  const { error } = await ctx.db.from("news_articles").delete().eq("id", id);
  if (error) return dbError(error, "bài viết");

  if (before) await removeUnusedNewsImages(ctx.db, newsImagePaths(before), new Set());
  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
