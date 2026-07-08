import { config } from "@/lib/config";
import { MemoryCache } from "./memory";
import type { CacheStore } from "./types";

export type { CacheStore } from "./types";

// Keep a single instance across dev hot-reloads / module re-evaluation.
const globalForCache = globalThis as unknown as { __cacheStore?: CacheStore };

/**
 * Returns the process-wide CacheStore, selected by CACHE_DRIVER.
 * Route handlers call THIS — they never construct a concrete impl.
 *
 * Migration (05_BUILD_SPEC §6.2) adds a `case "redis"` here + a RedisCache file.
 * Nothing else changes, because everything depends on the CacheStore interface.
 */
export function getCacheStore(): CacheStore {
  if (!globalForCache.__cacheStore) {
    switch (config.cache.driver) {
      case "memory":
      default:
        globalForCache.__cacheStore = new MemoryCache();
        break;
    }
  }
  return globalForCache.__cacheStore;
}
