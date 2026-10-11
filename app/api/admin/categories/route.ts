import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData, str } from "@/lib/admin/server";
import { listCategoriesAdmin } from "@/lib/admin/repo";

export async function GET() {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ categories: (await listCategoriesAdmin()) ?? [] });
}

// POST { name, description } — new categories go to the end of the list.
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson(req);
  const name = str(body?.name, 120);
  const slug = slugify(name);
  if (!name) return jsonError(400, "Vui lòng nhập tên danh mục");
  if (!slug) return jsonError(400, "Tên danh mục cần có chữ hoặc số");

  const { data: last } = await ctx.db
    .from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { data, error } = await ctx.db
    .from("categories")
    .insert({ name, slug, description: str(body?.description, 1000), sort_order: (last?.sort_order ?? 0) + 1 })
    .select("id")
    .single();
  if (error) return dbError(error, "danh mục");

  revalidateSiteData();
  return NextResponse.json({ id: data.id, slug });
}
