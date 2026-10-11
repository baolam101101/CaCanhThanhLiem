import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData } from "@/lib/admin/server";
import { listProductsAdmin } from "@/lib/admin/repo";
import { parseMedia, parseProductFields, syncProductMedia, uniqueProductSlug } from "@/lib/admin/products";

export async function GET() {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ products: (await listProductsAdmin()) ?? [] });
}

// POST { name, categorySlug, description, status, tags, media[] }
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseProductFields(body, false);
  if ("error" in parsed) return jsonError(400, parsed.error);
  const media = parseMedia(body.media ?? []);
  if (!media) return jsonError(400, "Danh sách ảnh/video không hợp lệ");

  const slug = await uniqueProductSlug(ctx.db, slugify(parsed.fields.name as string));
  const { data, error } = await ctx.db.from("products").insert({ ...parsed.fields, slug }).select("id").single();
  if (error) {
    if (error.code === "23503") return jsonError(400, "Danh mục đã chọn không còn tồn tại");
    return dbError(error, "sản phẩm");
  }

  const mediaError = await syncProductMedia(ctx.db, data.id, media);
  revalidateSiteData();
  if (mediaError) return jsonError(500, `Đã tạo sản phẩm nhưng ${mediaError.toLowerCase()}`);
  return NextResponse.json({ id: data.id, slug });
}
