import { describe, it, expect } from "vitest";
import { MemoryCache } from "./memory";

describe("MemoryCache", () => {
  it("stores and returns a value within its TTL", async () => {
    let t = 1_000;
    const cache = new MemoryCache(() => t);
    await cache.set("k", { a: 1 }, 60);
    expect(await cache.get<{ a: number }>("k")).toEqual({ a: 1 });
  });

  it("returns null after the TTL expires", async () => {
    let t = 0;
    const cache = new MemoryCache(() => t);
    await cache.set("k", "v", 10); // expires at t = 10_000ms
    t = 9_999;
    expect(await cache.get("k")).toBe("v");
    t = 10_000;
    expect(await cache.get("k")).toBeNull();
  });

  it("returns null for a missing key", async () => {
    const cache = new MemoryCache();
    expect(await cache.get("nope")).toBeNull();
  });

  it("deletes a key", async () => {
    const cache = new MemoryCache();
    await cache.set("k", 1, 60);
    await cache.delete("k");
    expect(await cache.get("k")).toBeNull();
  });

  it("evicts an expired entry on read (frees the slot)", async () => {
    let t = 0;
    const cache = new MemoryCache(() => t);
    await cache.set("k", 1, 1);
    expect(cache.size).toBe(1);
    t = 2_000;
    await cache.get("k");
    expect(cache.size).toBe(0);
  });
});
