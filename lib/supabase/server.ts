import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig, SUPABASE_SERVICE_ROLE_KEY } from "./config";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Server Components, Route Handlers
 * and Server Actions.  Reads/writes cookies so the Supabase Auth
 * session is persisted across requests.
 *
 * Returns null when credentials are not configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!supabaseConfig) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — cookies can only be
          // set in Route Handlers and Server Actions; safe to ignore here.
        }
      },
    },
  });
}

/**
 * Service-role client for privileged server-side operations (admin CRUD).
 * NEVER expose this client to the browser.
 *
 * Returns null when credentials are not configured.
 */
export async function getSupabaseAdminClient(): Promise<SupabaseClient | null> {
  if (!supabaseConfig || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseConfig.url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  });
}
