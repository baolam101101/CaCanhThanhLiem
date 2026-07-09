/**
 * Supabase environment configuration.
 *
 * Returns { url, anonKey } when both env vars are set to real values,
 * or null when they are still placeholders.  Every Supabase client
 * module imports this guard so the app falls back gracefully to the
 * existing mock/JWT auth system until real credentials are provided.
 *
 * Required environment variables (set in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL      — Project URL from Supabase Dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — Anon/public key from Supabase Dashboard
 *   SUPABASE_SERVICE_ROLE_KEY     — Service role key (server-only operations)
 */

const PLACEHOLDER_MARKERS = [
  "your_supabase",
  "your-supabase",
  "placeholder",
  "example",
  "localhost:54321", // local dev placeholder
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value || value.trim() === "") return true;
  return PLACEHOLDER_MARKERS.some((m) => value.toLowerCase().includes(m));
}

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when real Supabase credentials are present in the environment */
export const SUPABASE_ENABLED =
  !isPlaceholder(SUPABASE_URL) && !isPlaceholder(SUPABASE_ANON_KEY);

export const supabaseConfig = SUPABASE_ENABLED
  ? { url: SUPABASE_URL!, anonKey: SUPABASE_ANON_KEY! }
  : null;

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
