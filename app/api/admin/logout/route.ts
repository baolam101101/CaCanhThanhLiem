import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { SUPABASE_ENABLED, getSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  // Sign out from Supabase Auth when configured
  if (SUPABASE_ENABLED) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  // Always clear the custom JWT cookie regardless of Supabase state
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    maxAge:   0,
    path:     "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
