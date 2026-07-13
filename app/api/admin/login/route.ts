import { NextRequest, NextResponse } from "next/server";
import { findByUsername, verifyPassword } from "@/lib/auth/accounts";
import { createSession, SESSION_COOKIE, MAX_AGE } from "@/lib/auth/session";
import { SUPABASE_ENABLED, getSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const username = (body.username ?? "").trim();
    const password = (body.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đủ thông tin" },
        { status: 400 }
      );
    }

    // ── Path A: Supabase Auth (when credentials configured) ──────────
    // In this path the username is treated as an email address and
    // Supabase handles password verification + session management.
    // The custom JWT cookie is ALSO set so the existing middleware
    // guard keeps working without any changes to AdminLayout/AdminShell.
    if (SUPABASE_ENABLED) {
      const supabase = await getSupabaseServerClient();
      if (supabase) {
        // username may be either "admin" (legacy) or a full email address
        const email = username.includes("@") ? username : `${username}@cacanhthanhliem.internal`;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error && data.user) {
          // Read role from user_metadata (set when the user was created
          // via the admin_users table trigger or Supabase Dashboard)
          const role        = (data.user.user_metadata?.role as string) ?? "staff";
          const displayName = (data.user.user_metadata?.display_name as string) ?? data.user.email ?? "Admin";

          // Issue custom JWT so existing middleware/AdminShell keep working
          const token = await createSession({ id: data.user.id, username, displayName, role: role as "superadmin" | "staff" });
          const res   = NextResponse.json({ ok: true, role, displayName });
          res.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge:   MAX_AGE,
            path:     "/",
          });
          return res;
        }

        // If Supabase returns an error for this email, fall through to
        // the custom account store so the default admin/TL@Admin2025
        // credentials always work during the transition period.
      }
    }

    // ── Path B: Custom in-memory account store (always available) ────
    const account = findByUsername(username);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const token = await createSession({
      id:          account.id,
      username:    account.username,
      displayName: account.displayName,
      role:        account.role,
    });

    const res = NextResponse.json({
      ok:          true,
      role:        account.role,
      displayName: account.displayName,
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });

    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
