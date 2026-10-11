import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, removeStorageObjects, revalidateSiteData } from "@/lib/admin/server";
import { parseBannerFields } from "@/lib/admin/banners";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseBannerFields(body, true);
  if ("error" in parsed) return jsonError(400, parsed.error);
  if (Object.keys(parsed.fields).length === 0) return jsonError(400, "Không có gì để cập nhật");

  const { data: before } = await ctx.db.from("banners").select("image_url, storage_path").eq("id", id).maybeSingle();
  const { error } = await ctx.db.from("banners").update(parsed.fields).eq("id", id);
  if (error) return dbError(error, "banner");

  // The image was replaced: drop the old file.
  if (before && "image_url" in parsed.fields && parsed.fields.image_url !== before.image_url) {
    await removeStorageObjects(ctx.db, "banners", [before.storage_path]);
  }
  revalidateSiteData();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const { data: before } = await ctx.db.from("banners").select("storage_path").eq("id", id).maybeSingle();
  const { error } = await ctx.db.from("banners").delete().eq("id", id);
  if (error) return dbError(error, "banner");

  await removeStorageObjects(ctx.db, "banners", [before?.storage_path]);
  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
