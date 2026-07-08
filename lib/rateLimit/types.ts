// RateLimiter — the migration seam for rate limiting.
//
// Route handlers depend on THIS interface, never on a concrete implementation.
// Local-first wires MemoryRateLimiter; production later swaps in a shared-store
// impl via the factory in ./index.ts + env (RATE_LIMIT_DRIVER) — no route changes.

export interface RateLimitResult {
  /** True if this request is within the limit (a token was consumed). */
  allowed: boolean;
  /** The configured maximum (bucket capacity). */
  limit: number;
  /** Whole tokens left after this request. */
  remaining: number;
  /** Epoch ms at which the bucket will be full again. */
  resetAt: number;
  /** Seconds until the next request would be allowed (only when blocked). */
  retryAfterSeconds?: number;
}

export interface RateLimiter {
  /** Consumes one unit for `key` (e.g. an IP) and reports the outcome. */
  check(key: string): Promise<RateLimitResult>;
}
