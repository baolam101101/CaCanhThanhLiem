import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData } from "@/lib/admin/server";
import { listBannersAdmin } from "@/lib/admin/repo";
import { parseBannerFields } from "@/lib/admin/banners";

export async function GET() {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ banners: (await listBannersAdmin()) ?? [] });
}

// POST — new banners go to the end of the slider.
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson(req);
  if (!body) return jsonError(400, "Dữ liệu gửi lên không hợp lệ");
  const parsed = parseBannerFields(body, false);
  if ("error" in parsed) return jsonError(400, parsed.error);

  const { data: last } = await ctx.db
    .from("banners").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await ctx.db
    .from("banners").insert({ ...parsed.fields, sort_order: (last?.sort_order ?? 0) + 1 }).select("id").single();
  if (error) return dbError(error, "banner");

  revalidateSiteData();
  return NextResponse.json({ id: data.id });
}
