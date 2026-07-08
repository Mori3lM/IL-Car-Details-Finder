import { describe, it, expect, vi } from "vitest";
import { MemoryCache } from "@/lib/cache/memory";
import { MemoryRateLimiter } from "@/lib/rateLimit/memory";
import type { FetchLike } from "@/lib/govData/adapter";
import { getVehicleResponse } from "./vehicleHandler";

const RECORD = { mispar_rechev: 12345678, tozeret_nm: "טויוטה", tokef_dt: "2027-01-01" };
const foundPayload = { result: { records: [RECORD] } };
const emptyPayload = { result: { records: [] } };

/** A vi.fn fetch returning `payload`, castable to FetchLike, with a call counter. */
function spyFetch(payload: unknown) {
  return vi.fn(async () => ({ ok: true, status: 200, json: async () => payload }));
}

function generousLimiter() {
  return new MemoryRateLimiter({ max: 100, windowMs: 60_000 });
}

describe("getVehicleResponse", () => {
  it("returns 200 (MISS) then 200 (HIT) without a second upstream call", async () => {
    const cache = new MemoryCache();
    const rateLimiter = generousLimiter();
    const fetchImpl = spyFetch(foundPayload);

    const first = await getVehicleResponse({
      plate: "12345678",
      ip: "1.1.1.1",
      cache,
      rateLimiter,
      fetchImpl: fetchImpl as unknown as FetchLike,
    });
    expect(first.status).toBe(200);
    if (first.status === 200) {
      expect(first.cache).toBe("MISS");
      expect(first.body.manufacturer).toBe("טויוטה");
    }

    const second = await getVehicleResponse({
      plate: "12345678",
      ip: "1.1.1.1",
      cache,
      rateLimiter,
      fetchImpl: fetchImpl as unknown as FetchLike,
    });
    expect(second.status).toBe(200);
    if (second.status === 200) expect(second.cache).toBe("HIT");
    expect(fetchImpl.mock.calls.length).toBe(1); // cache hit skipped the upstream call
  });

  it("returns 400 for an invalid plate", async () => {
    const res = await getVehicleResponse({
      plate: "abc",
      ip: "1.1.1.1",
      cache: new MemoryCache(),
      rateLimiter: generousLimiter(),
      fetchImpl: spyFetch(foundPayload) as unknown as FetchLike,
    });
    expect(res.status).toBe(400);
    if (res.status === 400) expect(res.body.error).toBe("invalid_plate");
  });

  it("returns 404 for a not-found plate and negatively caches it", async () => {
    const cache = new MemoryCache();
    const rateLimiter = generousLimiter();
    const fetchImpl = spyFetch(emptyPayload);

    const first = await getVehicleResponse({
      plate: "12345678",
      ip: "1.1.1.1",
      cache,
      rateLimiter,
      fetchImpl: fetchImpl as unknown as FetchLike,
    });
    expect(first.status).toBe(404);

    const second = await getVehicleResponse({
      plate: "12345678",
      ip: "1.1.1.1",
      cache,
      rateLimiter,
      fetchImpl: fetchImpl as unknown as FetchLike,
    });
    expect(second.status).toBe(404);
    expect(fetchImpl.mock.calls.length).toBe(1); // negative cache prevented a re-fetch
  });

  it("returns 502 on an upstream failure (no internals leaked)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const res = await getVehicleResponse({
      plate: "12345678",
      ip: "1.1.1.1",
      cache: new MemoryCache(),
      rateLimiter: generousLimiter(),
      fetchImpl: fetchImpl as unknown as FetchLike,
    });
    expect(res.status).toBe(502);
    if (res.status === 502) {
      expect(res.body.error).toBe("upstream_error");
      expect(res.body.message).not.toContain("network down");
    }
    errSpy.mockRestore();
  });

  it("returns 429 once the per-IP limit is exceeded", async () => {
    const cache = new MemoryCache();
    const rateLimiter = new MemoryRateLimiter({ max: 2, windowMs: 60_000 });
    const fetchImpl = spyFetch(foundPayload);
    const call = () =>
      getVehicleResponse({
        plate: "12345678",
        ip: "9.9.9.9",
        cache,
        rateLimiter,
        fetchImpl: fetchImpl as unknown as FetchLike,
      });

    expect((await call()).status).toBe(200);
    expect((await call()).status).toBe(200);
    const blocked = await call();
    expect(blocked.status).toBe(429);
    if (blocked.status === 429) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.body.error).toBe("rate_limited");
    }
  });
});
