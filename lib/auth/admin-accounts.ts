import type { SupabaseClient } from "@supabase/supabase-js";
import type { Account, AccountRole } from "@/lib/auth/accounts";

// ============================================================
// Admin accounts when Supabase is configured.
//
// Credentials live in Supabase Auth (auth.users); role, display name and
// the active flag live in public.admin_users. The role is ALWAYS read
// from admin_users — never from user_metadata, which a signed-in user
// can rewrite through the public API.
//
// Usernames sign in as "<username>@cacanhthanhliem.internal", matching
// the seeded admin (supabase/migrations/0011_seed_admin.sql).
// ============================================================

export const ACCOUNT_EMAIL_DOMAIN = "cacanhthanhliem.internal";
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function usernameToEmail(username: string): string {
  const u = username.trim().toLowerCase();
  return u.includes("@") ? u : `${u}@${ACCOUNT_EMAIL_DOMAIN}`;
}

export interface AdminProfile {
  username: string;
  display_name: string;
  role: AccountRole;
  active: boolean;
}

export async function getAdminProfile(db: SupabaseClient, userId: string): Promise<AdminProfile | null> {
  const { data } = await db
    .from("admin_users").select("username, display_name, role, active").eq("id", userId).maybeSingle();
  return (data as AdminProfile | null) ?? null;
}

export async function listAdminAccounts(db: SupabaseClient): Promise<Account[]> {
  const { data, error } = await db
    .from("admin_users")
    .select("id, username, display_name, role, active, created_at, created_by")
    .order("created_at", { ascending: true });
  if (error) { console.error("[accounts] list", error); return []; }
  return (data ?? []).map((a) => ({
    id: a.id,
    username: a.username,
    passwordHash: "***",
    displayName: a.display_name,
    role: a.role,
    createdAt: a.created_at,
    createdBy: a.created_by ?? undefined,
    active: a.active,
  }));
}

export async function createAdminAccount(
  db: SupabaseClient,
  input: { username: string; password: string; displayName: string },
  createdBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim().slice(0, 100);
  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: "Tên đăng nhập 3–32 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch ngang, gạch dưới" };
  }
  if (!displayName) return { ok: false, error: "Vui lòng nhập tên hiển thị" };
  if (input.password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự` };

  const { data: taken } = await db.from("admin_users").select("id").eq("username", username).maybeSingle();
  if (taken) return { ok: false, error: "Tên đăng nhập đã tồn tại" };

  const { data, error } = await db.auth.admin.createUser({
    email: usernameToEmail(username),
    password: input.password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error("[accounts] createUser", error);
    return { ok: false, error: "Không tạo được tài khoản, vui lòng thử lại" };
  }

  const isUuid = /^[0-9a-f-]{36}$/i.test(createdBy);
  const { error: profileErr } = await db.from("admin_users").insert({
    id: data.user.id, username, display_name: displayName, role: "staff", active: true,
    created_by: isUuid ? createdBy : null,
  });
  if (profileErr) {
    // Don't leave a login without a profile behind.
    await db.auth.admin.deleteUser(data.user.id);
    console.error("[accounts] profile", profileErr);
    return { ok: false, error: "Không tạo được tài khoản, vui lòng thử lại" };
  }
  return { ok: true };
}

export async function deleteAdminAccount(
  db: SupabaseClient, id: string, currentUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (id === currentUserId) return { ok: false, error: "Không thể tự xóa tài khoản đang đăng nhập" };
  const profile = await getAdminProfile(db, id);
  if (!profile) return { ok: false, error: "Không tìm thấy tài khoản" };
  if (profile.role === "superadmin") return { ok: false, error: "Không thể xóa tài khoản Admin gốc" };

  // admin_users row goes with it (ON DELETE CASCADE).
  const { error } = await db.auth.admin.deleteUser(id);
  if (error) { console.error("[accounts] delete", error); return { ok: false, error: "Không xóa được tài khoản" }; }
  return { ok: true };
}

export async function setAdminPassword(
  db: SupabaseClient, id: string, password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự` };
  if (!(await getAdminProfile(db, id))) return { ok: false, error: "Không tìm thấy tài khoản" };
  const { error } = await db.auth.admin.updateUserById(id, { password });
  if (error) { console.error("[accounts] password", error); return { ok: false, error: "Không đổi được mật khẩu" }; }
  return { ok: true };
}
