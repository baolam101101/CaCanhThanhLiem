import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminContext, jsonError, readJson } from "@/lib/admin/server";
import { checkFileForBucket, isMediaBucket } from "@/lib/admin/media";

// POST — issue a signed URL the browser uploads one file to.
// Files go straight from the browser to Supabase Storage: a serverless
// function body is capped at a few MB, far below a 50 MB video.
export async function POST(req: Request) {
  const ctx = await adminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = await readJson<{ bucket?: unknown; fileName?: unknown; contentType?: unknown; size?: unknown }>(req);
  if (!body || !isMediaBucket(body.bucket)) return jsonError(400, "Thư mục lưu file không hợp lệ");

  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : NaN;
  if (!Number.isFinite(size) || size <= 0) return jsonError(400, "File rỗng hoặc không đọc được");

  const problem = checkFileForBucket(body.bucket, { type: contentType, size, name: fileName });
  if (problem) return jsonError(400, problem);

  const ext = (fileName.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;

  const bucket = ctx.db.storage.from(body.bucket);
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[admin/uploads]", error);
    return jsonError(500, "Không tạo được đường dẫn tải lên, vui lòng thử lại");
  }

  return NextResponse.json({
    bucket: body.bucket,
    path: data.path,
    token: data.token,
    publicUrl: bucket.getPublicUrl(data.path).data.publicUrl,
  });
}
