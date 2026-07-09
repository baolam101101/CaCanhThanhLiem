import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { SUPABASE_ENABLED, getSupabaseServerClient } from "@/lib/supabase";

// Lightweight endpoint: tells the public Navbar whether an admin
// session is active.  Returns ONLY a boolean — never session data.
// Checks Supabase Auth when enabled, falls back to custom JWT.
export async function GET() {
  // Path A: Supabase Auth session
  if (SUPABASE_ENABLED) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      return NextResponse.json({ loggedIn: !!user });
    }
  }

  // Path B: Custom JWT session
  const session = await getSession();
  return NextResponse.json({ loggedIn: !!session });
}
