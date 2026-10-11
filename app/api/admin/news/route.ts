import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData } from "@/lib/admin/server";
import { listNewsAdmin } from "@/lib/admin/repo";
import { parseNewsFields, uniqueNewsSlug } from "@/lib/admin/news";

export async function GET() {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ news: (await listNewsAdmin()) ?? [] });
}

export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseNewsFields(body, false);
  if ("error" in parsed) return jsonError(400, parsed.error);

  const slug = await uniqueNewsSlug(ctx.db, slugify(parsed.fields.title as string));
  const { data, error } = await ctx.db
    .from("news_articles")
    .insert({ ...parsed.fields, slug, published: parsed.fields.published ?? true })
    .select("id")
    .single();
  if (error) return dbError(error, "bài viết");

  revalidateSiteData();
  return NextResponse.json({ id: data.id, slug });
}
