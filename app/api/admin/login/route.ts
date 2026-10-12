import { NextRequest, NextResponse } from "next/server";
import { findByUsername, verifyPassword } from "@/lib/auth/accounts";
import { createSession, SESSION_COOKIE, MAX_AGE, SESSION_SECRET_CONFIGURED } from "@/lib/auth/session";
import { SUPABASE_ENABLED, getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase";
import { getAdminProfile, usernameToEmail } from "@/lib/auth/admin-accounts";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

function issue(session: { id: string; username: string; displayName: string; role: "superadmin" | "staff" }) {
  return createSession(session).then((token) => {
    const res = NextResponse.json({ ok: true, role: session.role, displayName: session.displayName });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });
    return res;
  });
}

const WRONG = () => NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 });

// Password guessing: 10 failed sign-ins / 15 min / IP. Only failures count,
// so an admin who signs in correctly is never slowed down.
const failures = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (failures.limited(ip)) {
    return NextResponse.json({ error: "Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút" }, { status: 429 });
  }
  const res = await attempt(req);
  if (res.status === 401) failures.hit(ip);
  return res;
}

async function attempt(req: NextRequest): Promise<NextResponse> {
  try {
    if (!SESSION_SECRET_CONFIGURED) {
      return NextResponse.json({ error: "Máy chủ chưa cấu hình SESSION_SECRET, chưa thể đăng nhập" }, { status: 500 });
    }

    const body     = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đủ thông tin" }, { status: 400 });
    }

    // ── Supabase configured: Supabase Auth is the ONLY way in ────────
    // There is deliberately no fallback to the in-memory store here: that
    // store holds the default admin password published in the repository.
    if (SUPABASE_ENABLED) {
      const supabase = await getSupabaseServerClient();
      const db = await getSupabaseAdminClient();
      if (!supabase || !db) {
        return NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY trong biến môi trường" }, { status: 500 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
      if (error) {
        // Only a credentials rejection means "wrong password". Anything else
        // (bad API key, broken auth.users row, Supabase down) is a setup
        // problem that the admin cannot fix by retyping.
        if (error.code === "invalid_credentials") return WRONG();
        console.error("[login] Supabase Auth", error.status, error.code, error.message);
        // auth-js drops the response body on 5xx, so there is no message to
        // pass on. The usual 5xx is a user row written by SQL with NULL token
        // columns, which 0011_seed_admin.sql repairs when re-run.
        const detail = (error.status ?? 0) >= 500
          ? "lỗi máy chủ. Chạy lại file 0011_seed_admin.sql trong Supabase SQL Editor rồi thử lại"
          : error.message;
        return NextResponse.json(
          { error: `Supabase Auth báo lỗi (${error.code ?? error.status ?? "không rõ"}): ${detail}` },
          { status: 502 },
        );
      }
      if (!data.user) return WRONG();

      // Role and display name come from admin_users, which only the server
      // can write — not from user_metadata, which the user can edit.
      const profile = await getAdminProfile(db, data.user.id);
      if (!profile || !profile.active) {
        await supabase.auth.signOut();
        return NextResponse.json({ error: "Tài khoản đã bị khóa hoặc không có quyền quản trị" }, { status: 403 });
      }

      return await issue({ id: data.user.id, username: profile.username, displayName: profile.display_name, role: profile.role });
    }

    // ── No Supabase (local development): in-memory account store ─────
    const account = findByUsername(username);
    if (!account || !verifyPassword(password, account.passwordHash)) return WRONG();
    return await issue({ id: account.id, username: account.username, displayName: account.displayName, role: account.role });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Lỗi máy chủ, vui lòng thử lại" }, { status: 500 });
  }
}
