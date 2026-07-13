import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session";
import { SUPABASE_ENABLED, refreshSupabaseSession } from "@/lib/supabase";

const PUBLIC_ADMIN = ["/admin/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // ── Custom JWT auth (always active until Supabase is configured) ──
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const session = await verifySession(token);
  if (!session) {
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Pass session data via ASCII-safe headers
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-session-id",       session.id);
  reqHeaders.set("x-session-role",     session.role);
  reqHeaders.set("x-session-name-b64", session.displayNameB64 ?? "");

  let response = NextResponse.next({ request: { headers: reqHeaders } });

  // ── Supabase session refresh (layered on top when credentials exist) ──
  // When SUPABASE_ENABLED, also refresh the Supabase Auth token so it
  // never expires mid-session.  The JWT auth above remains the primary
  // gate; Supabase refresh is additive and does not replace it yet.
  if (SUPABASE_ENABLED) {
    const refreshed = await refreshSupabaseSession(req, response);
    if (refreshed) response = refreshed;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
