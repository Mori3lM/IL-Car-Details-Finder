// CacheStore — the migration seam for caching.
//
// Route handlers depend on THIS interface, never on a concrete implementation.
// Local-first wires MemoryCache; production later swaps in a Redis/Upstash impl
// via the factory in ./index.ts + env (CACHE_DRIVER) — with no route changes.
//
// Methods are async so an async backend (Redis) is a drop-in replacement.

export interface CacheStore {
  /** Returns the stored value, or null if the key is missing OR expired. */
  get<T>(key: string): Promise<T | null>;

  /** Stores a value under `key`, expiring after `ttlSeconds`. */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  /** Removes a key (no-op if absent). */
  delete(key: string): Promise<void>;
}
