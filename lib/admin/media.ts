// Storage buckets the admin panel uploads into, with the same limits as
// supabase/migrations/0010_storage.sql. Shared by the browser (to reject
// a file before uploading it) and the server (to refuse issuing an
// upload URL for it).

//
// Videos are capped at 10 MB: every view streams the whole file out of
// Supabase Storage, and the Free plan's monthly bandwidth is small.
// Photos are shrunk in the browser before upload (lib/admin/client.ts),
// so a phone photo fits well under its limit.
export const MEDIA_BUCKETS = {
  "product-images": { kind: "image", maxBytes: 5 * 1024 * 1024 },
  "product-videos": { kind: "video", maxBytes: 10 * 1024 * 1024 },
  banners:          { kind: "image", maxBytes: 8 * 1024 * 1024 },
  "site-videos":    { kind: "video", maxBytes: 10 * 1024 * 1024 },
  "news-images":    { kind: "image", maxBytes: 5 * 1024 * 1024 },
} as const;

/** Bytes as whole megabytes, for messages. */
export const mb = (bytes: number) => Math.round(bytes / 1024 / 1024);

export type MediaBucket = keyof typeof MEDIA_BUCKETS;

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
} as const;

export function isMediaBucket(value: unknown): value is MediaBucket {
  return typeof value === "string" && value in MEDIA_BUCKETS;
}

/** Vietnamese error message if the file cannot go into the bucket, else null. */
export function checkFileForBucket(bucket: MediaBucket, file: { type: string; size: number; name?: string }): string | null {
  const rule = MEDIA_BUCKETS[bucket];
  const allowed: readonly string[] = ALLOWED_TYPES[rule.kind];
  const label = file.name ? `"${file.name}"` : "File";
  if (!allowed.includes(file.type)) {
    return rule.kind === "image"
      ? `${label} không phải ảnh JPG, PNG, WebP hoặc GIF`
      : `${label} không phải video MP4, WebM hoặc MOV`;
  }
  if (file.size > rule.maxBytes) {
    const size = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return rule.kind === "video"
      ? `${label} nặng ${size} MB, vượt quá giới hạn ${mb(rule.maxBytes)} MB. Hãy quay video ngắn hơn hoặc nén video (ví dụ bằng ứng dụng nén video trên điện thoại) rồi thử lại.`
      : `${label} nặng ${size} MB, vượt quá giới hạn ${mb(rule.maxBytes)} MB`;
  }
  return null;
}
