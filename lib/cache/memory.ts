import type { CacheStore } from "./types";

interface Entry {
  value: unknown;
  expiresAt: number; // epoch ms
}

/**
 * In-memory CacheStore (Map + per-entry TTL). Local-first implementation.
 *
 * The clock is injectable so TTL behaviour is unit-testable without real time.
 * Note: process-local and non-persistent — perfect for local dev; production
 * swaps in a shared store (that's exactly why the CacheStore seam exists).
 */
export class MemoryCache implements CacheStore {
  private readonly store = new Map<string, Entry>();
  private readonly now: () => number;

  constructor(now: () => number = () => Date.now()) {
    this.now = now;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const ttlMs = Math.max(0, ttlSeconds) * 1000;
    this.store.set(key, { value, expiresAt: this.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Introspection helper for tests — not part of the CacheStore seam. */
  get size(): number {
    return this.store.size;
  }
}
