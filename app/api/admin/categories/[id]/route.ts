import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData, str } from "@/lib/admin/server";

type Ctx = { params: Promise<{ id: string }> };

// PATCH { name?, description?, visible? } — renaming also changes the slug;
// products follow automatically (foreign key ON UPDATE CASCADE).
export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = str(body.name, 120);
    const slug = slugify(name);
    if (!name) return jsonError(400, "Vui lòng nhập tên danh mục");
    if (!slug) return jsonError(400, "Tên danh mục cần có chữ hoặc số");
    patch.name = name;
    patch.slug = slug;
  }
  if (body.description !== undefined) patch.description = str(body.description, 1000);
  if (typeof body.visible === "boolean") patch.visible = body.visible;
  if (Object.keys(patch).length === 0) return jsonError(400, "Không có gì để cập nhật");

  const { error } = await ctx.db.from("categories").update(patch).eq("id", id);
  if (error) return dbError(error, "danh mục");

  revalidateSiteData();
  return NextResponse.json({ ok: true, slug: patch.slug });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  // Products reference categories with ON DELETE RESTRICT; check first so
  // the admin gets a count rather than a bare constraint error.
  const { data: cat } = await ctx.db.from("categories").select("slug").eq("id", id).maybeSingle();
  if (cat) {
    const { count } = await ctx.db.from("products").select("id", { count: "exact", head: true }).eq("category_slug", cat.slug);
    if (count) return jsonError(409, `Không thể xóa — danh mục còn ${count} sản phẩm`);
  }

  const { error } = await ctx.db.from("categories").delete().eq("id", id);
  if (error) return dbError(error, "danh mục");

  revalidateSiteData();
  return NextResponse.json({ ok: true });
}
