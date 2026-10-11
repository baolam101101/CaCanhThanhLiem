import { NextResponse } from "next/server";
import { adminContext, dbError, jsonError, readJson, revalidateSiteData, str } from "@/lib/admin/server";
import { listVideosAdmin } from "@/lib/admin/repo";

export async function GET() {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ videos: (await listVideosAdmin()) ?? [] });
}

// POST { title, videoUrl, storagePath, fileName } — the file is already in
// the site-videos bucket (uploaded by the browser via a signed URL).
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson(req);
  const title = str(body?.title, 200);
  const videoUrl = str(body?.videoUrl, 2000);
  if (!title) return jsonError(400, "Vui lòng nhập tiêu đề video");
  if (!/^https?:\/\//.test(videoUrl)) return jsonError(400, "Vui lòng chọn file video");

  const { data, error } = await ctx.db.from("videos").insert({
    title,
    video_url: videoUrl,
    storage_path: typeof body?.storagePath === "string" ? body.storagePath : null,
    file_name: str(body?.fileName, 300) || null,
  }).select("id").single();
  if (error) return dbError(error, "video");

  revalidateSiteData();
  return NextResponse.json({ id: data.id });
}
