import { describe, it, expect } from "vitest";
import { MemoryRateLimiter } from "./memory";

describe("MemoryRateLimiter", () => {
  it("allows up to `max` requests, then blocks", async () => {
    let t = 0;
    const rl = new MemoryRateLimiter({ max: 3, windowMs: 60_000, now: () => t });
    expect((await rl.check("ip")).allowed).toBe(true);
    expect((await rl.check("ip")).allowed).toBe(true);
    expect((await rl.check("ip")).allowed).toBe(true);

    const blocked = await rl.check("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.limit).toBe(3);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("refills tokens over time", async () => {
    let t = 0;
    const rl = new MemoryRateLimiter({ max: 2, windowMs: 1_000, now: () => t });
    await rl.check("ip"); // 1 left
    await rl.check("ip"); // 0 left
    expect((await rl.check("ip")).allowed).toBe(false);

    t = 600; // refillPerMs = 2/1000 → 600ms yields 1.2 tokens
    expect((await rl.check("ip")).allowed).toBe(true);
  });

  it("isolates buckets per key (IP)", async () => {
    let t = 0;
    const rl = new MemoryRateLimiter({ max: 1, windowMs: 1_000, now: () => t });
    expect((await rl.check("a")).allowed).toBe(true);
    expect((await rl.check("a")).allowed).toBe(false);
    // A different key is unaffected.
    expect((await rl.check("b")).allowed).toBe(true);
  });

  it("reports remaining tokens as they are consumed", async () => {
    let t = 0;
    const rl = new MemoryRateLimiter({ max: 5, windowMs: 60_000, now: () => t });
    expect((await rl.check("ip")).remaining).toBe(4);
    expect((await rl.check("ip")).remaining).toBe(3);
  });
});
