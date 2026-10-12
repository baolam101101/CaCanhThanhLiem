// ============================================================
// Per-key sliding-window counter for API routes (login, contact form).
//
// Kept in memory: serverless instances don't share it and it resets on
// a cold start, so it is a speed bump against scripted spam rather than
// a hard wall. It still caps what one instance will forward to Supabase
// Auth or Resend.
// ============================================================

export interface RateLimiter {
  /** True when `key` already used up its allowance in the window. */
  limited(key: string): boolean;
  /** Count one event against `key`. */
  hit(key: string): void;
}

export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }): RateLimiter {
  const events = new Map<string, number[]>();
  const recent = (key: string, now: number) => (events.get(key) ?? []).filter((t) => now - t < windowMs);

  return {
    limited(key) {
      return recent(key, Date.now()).length >= max;
    },
    hit(key) {
      const now = Date.now();
      const list = recent(key, now);
      list.push(now);
      events.set(key, list);
      if (events.size > 5000) events.clear(); // bound memory under a flood of IPs
    },
  };
}

/** The caller's IP. On Vercel the platform sets x-forwarded-for itself. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
