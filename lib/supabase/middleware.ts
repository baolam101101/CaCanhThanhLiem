import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { supabaseConfig } from "./config";

/**
 * Refreshes the Supabase Auth session inside Next.js Middleware.
 *
 * This must be called on every protected request so that:
 *   1. Access tokens are refreshed before they expire.
 *   2. The updated session cookies are written to the response.
 *
 * Returns the (possibly modified) response object so the caller can
 * forward it to the next handler.
 *
 * Returns null when Supabase is not yet configured — the existing
 * custom JWT middleware remains the sole auth layer in that case.
 */
export async function refreshSupabaseSession(
  req: NextRequest,
  res: NextResponse
): Promise<NextResponse | null> {
  if (!supabaseConfig) return null;

  // We need a mutable response to write refreshed cookies onto.
  // The caller passes in the response it has already prepared so we
  // augment it rather than creating a new one.
  const mutableRes = res;

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            mutableRes.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This call refreshes the session if the token has expired.
  // Do not use the returned user data for auth checks — always
  // re-read from getUser() after this call.
  await supabase.auth.getUser();

  return mutableRes;
}

/**
 * Gets the current Supabase user from the session cookie inside
 * Middleware.  Returns null if no session or Supabase not configured.
 */
export async function getSupabaseUser(req: NextRequest) {
  if (!supabaseConfig) return null;

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // Read-only in this helper
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}
