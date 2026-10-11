import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { SITE_DATA_TAG } from "@/lib/cache-tags";
import type { MediaBucket } from "@/lib/admin/media";

// ============================================================
// Shared plumbing for the /api/admin/* route handlers.
//
// The proxy only guards /admin pages, not /api/admin, so every handler
// starts with adminContext(): it checks the session cookie and hands
// back the service-role client. That client bypasses RLS, which is why
// the session check must come first.
// ============================================================

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

export interface AdminContext {
  db: SupabaseClient;
  session: Session;
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Session + service-role client, or the error response to return. */
export async function adminContext(opts: { superadmin?: boolean } = {}): Promise<AdminContext | NextResponse> {
  const session = await getSession();
  if (!session) return jsonError(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  if (opts.superadmin && session.role !== "superadmin") return jsonError(403, "Không có quyền thực hiện thao tác này");

  const db = await getSupabaseAdminClient();
  if (!db) return jsonError(503, "Chưa kết nối Supabase nên chưa thể lưu thay đổi");

  // The session cookie lives for hours; re-check the account so a deleted
  // or deactivated user loses access on their next action, not at expiry.
  const { data: profile } = await db.from("admin_users").select("active").eq("id", session.id).maybeSingle();
  if (!profile?.active) return jsonError(401, "Tài khoản không còn quyền truy cập, vui lòng đăng nhập lại");

  return { db, session };
}

/** Turn a Postgres error into a message an admin can act on. */
export function dbError(error: PostgrestError | null, what = "dữ liệu") {
  console.error("[admin]", error);
  switch (error?.code) {
    case "23505": return jsonError(409, `${what.charAt(0).toUpperCase()}${what.slice(1)} này đã tồn tại`);
    case "23503": return jsonError(409, `Không thể xóa vì ${what} đang được sử dụng`);
    case "23514":
    case "22P02": return jsonError(400, `${what.charAt(0).toUpperCase()}${what.slice(1)} không hợp lệ`);
    default:      return jsonError(500, `Không lưu được ${what}, vui lòng thử lại`);
  }
}

/** Make public pages pick up an admin change on their next load. */
export function revalidateSiteData() {
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** Remove files from a bucket; failures are logged, not fatal. */
export async function removeStorageObjects(db: SupabaseClient, bucket: MediaBucket, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (list.length === 0) return;
  const { error } = await db.storage.from(bucket).remove(list);
  if (error) console.error(`[admin] could not remove ${list.length} file(s) from ${bucket}:`, error);
}

/** Read a JSON body, or null if it is missing/invalid. */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function str(value: unknown, max = 5000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
