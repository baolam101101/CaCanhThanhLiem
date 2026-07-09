"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client for use in Client Components.
 *
 * Returns null when Supabase credentials are not yet configured —
 * callers must handle the null case and fall back to mock behaviour.
 *
 * Usage:
 *   const supabase = getSupabaseBrowserClient();
 *   if (!supabase) { /* use mock data *\/ }
 */
let _client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseConfig) return null;

  // Singleton — one client per browser session
  if (!_client) {
    _client = createBrowserClient(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );
  }
  return _client;
}
