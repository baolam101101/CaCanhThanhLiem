import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, removeStorageObjects, revalidateSiteData, str } from "@/lib/admin/server";

type Ctx = { params: Promise<{ id: string }> };

// PATCH { title?, visible? }
export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const body = await readJson(req);
  const patch: Record<string, unknown> = {};
  if (body?.title !== undefined) {
    const title = str(body.title, 200);
    if (!title) return jsonError(400, "Vui lòng nhập tiêu đề video");
    patch.title = title;
  }
  if (typeof body?.visible === "boolean") patch.visible = body.visible;
  if (Object.keys(patch).length === 0) return jsonError(400, "Không có gì để cập nhật");

  const { error } = await ctx.db.from("videos").update(patch).eq("id", id);
  if (error) return dbError(error, "video");

  revalidateSiteData();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const { data: before } = await ctx.db.from("videos").select("storage_path").eq("id", id).maybeSingle();
  const { error } = await ctx.db.from("videos").delete().eq("id", id);
  if (error) return dbError(error, "video");

  await removeStorageObjects(ctx.db, "site-videos", [before?.storage_path]);
  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
