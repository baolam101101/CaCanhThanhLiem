import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { checkFileForBucket, MEDIA_BUCKETS, type MediaBucket } from "@/lib/admin/media";

// ============================================================
// Browser-side helpers for the admin panel.
// ============================================================

/** Call an /api/admin endpoint; throws an Error carrying its Vietnamese message. */
export async function adminApi<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? "GET",
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được máy chủ, kiểm tra mạng rồi thử lại");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Có lỗi xảy ra, vui lòng thử lại");
  return data as T;
}

export interface UploadedFile {
  bucket: MediaBucket;
  path: string;  // object path inside the bucket (storage_path column)
  url: string;   // public URL saved alongside it
}

/**
 * Shrink a photo before upload: phone photos are often 4–10 MB and
 * 4000+ px wide, far more than the site shows, and slow to send over 4G.
 * Draws the image no larger than `maxEdge` px and re-encodes it (JPEG for
 * JPEG input, WebP otherwise so transparency survives). Returns the
 * original file when it is a GIF, cannot be decoded, or would not shrink.
 */
export async function shrinkImage(file: File, maxEdge = 2000): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const src = URL.createObjectURL(file);
  try {
    // An <img> applies the photo's EXIF rotation; drawing it keeps that.
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size < 1024 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    // Browsers that cannot encode WebP hand back a PNG, which may be larger.
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1];
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(src);
  }
}

/**
 * Upload one file straight to Supabase Storage through a signed URL.
 * Photos are shrunk first unless the caller already did (`shrunk`).
 */
export async function uploadMedia(bucket: MediaBucket, original: File, opts: { shrunk?: boolean } = {}): Promise<UploadedFile> {
  const file = MEDIA_BUCKETS[bucket].kind === "image" && !opts.shrunk ? await shrinkImage(original) : original;
  const problem = checkFileForBucket(bucket, file);
  if (problem) throw new Error(problem);

  const ticket = await adminApi<{ path: string; token: string; publicUrl: string }>("/api/admin/uploads", {
    method: "POST",
    body: { bucket, fileName: file.name, contentType: file.type, size: file.size },
  });

  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Chưa kết nối Supabase nên chưa thể tải file lên");

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (error) throw new Error(`Tải lên "${file.name}" thất bại, vui lòng thử lại`);

  return { bucket, path: ticket.path, url: ticket.publicUrl };
}
