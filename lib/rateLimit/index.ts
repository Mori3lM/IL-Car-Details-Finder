import { config } from "@/lib/config";
import { MemoryRateLimiter } from "./memory";
import type { RateLimiter } from "./types";

export type { RateLimiter, RateLimitResult } from "./types";

// Keep a single instance across dev hot-reloads / module re-evaluation.
const globalForRateLimit = globalThis as unknown as { __rateLimiter?: RateLimiter };

/**
 * Returns the process-wide RateLimiter, selected by RATE_LIMIT_DRIVER.
 * Route handlers call THIS — they never construct a concrete impl.
 *
 * Migration (05_BUILD_SPEC §6.3) adds a shared-store case here. The interface is
 * unchanged, so the route handler is untouched.
 */
export function getRateLimiter(): RateLimiter {
  if (!globalForRateLimit.__rateLimiter) {
    switch (config.rateLimit.driver) {
      case "memory":
      default:
        globalForRateLimit.__rateLimiter = new MemoryRateLimiter({
          max: config.rateLimit.max,
          windowMs: config.rateLimit.windowMs,
        });
        break;
    }
  }
  return globalForRateLimit.__rateLimiter;
}
