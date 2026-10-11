import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { checkFileForBucket, type MediaBucket } from "@/lib/admin/media";

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

/** Upload one file straight to Supabase Storage through a signed URL. */
export async function uploadMedia(bucket: MediaBucket, file: File): Promise<UploadedFile> {
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
