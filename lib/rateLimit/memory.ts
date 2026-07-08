import type { RateLimiter, RateLimitResult } from "./types";

interface Bucket {
  tokens: number;
  lastRefill: number; // epoch ms
}

export interface MemoryRateLimiterOptions {
  /** Bucket capacity — the max burst of requests. */
  max: number;
  /** Time (ms) to refill an empty bucket back to full. */
  windowMs: number;
  /** Injectable clock (tests). Defaults to Date.now. */
  now?: () => number;
}

/**
 * In-memory per-key token bucket. Local-first implementation.
 *
 * Each key (an IP) gets a bucket of `max` tokens that refills continuously over
 * `windowMs`. Continuous refill (vs. a fixed window) avoids burst-at-boundary
 * abuse. Process-local — production swaps in a shared store via the seam.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly max: number;
  private readonly windowMs: number;
  private readonly refillPerMs: number;
  private readonly now: () => number;

  constructor(opts: MemoryRateLimiterOptions) {
    this.max = Math.max(1, opts.max);
    this.windowMs = Math.max(1, opts.windowMs);
    this.refillPerMs = this.max / this.windowMs;
    this.now = opts.now ?? (() => Date.now());
  }

  async check(key: string): Promise<RateLimitResult> {
    const t = this.now();
    const bucket = this.buckets.get(key) ?? { tokens: this.max, lastRefill: t };

    // Continuous refill based on elapsed time since we last touched this bucket.
    const elapsed = t - bucket.lastRefill;
    if (elapsed > 0) {
      bucket.tokens = Math.min(this.max, bucket.tokens + elapsed * this.refillPerMs);
      bucket.lastRefill = t;
    }

    let allowed: boolean;
    let retryAfterSeconds: number | undefined;
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      allowed = true;
    } else {
      allowed = false;
      const tokensNeeded = 1 - bucket.tokens;
      retryAfterSeconds = Math.max(1, Math.ceil(tokensNeeded / this.refillPerMs / 1000));
    }
    this.buckets.set(key, bucket);

    const tokensUntilFull = this.max - bucket.tokens;
    const resetAt = t + Math.ceil(tokensUntilFull / this.refillPerMs);

    return {
      allowed,
      limit: this.max,
      remaining: Math.floor(bucket.tokens),
      resetAt,
      retryAfterSeconds,
    };
  }
}
