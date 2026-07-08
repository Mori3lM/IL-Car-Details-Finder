// Pure, dependency-injected request handler for GET /api/vehicle/[plate].
// Contains all the logic (rate-limit → validate → cache → fetch); the route file
// just wires real deps and serializes. Kept DI so it's fully unit-testable with a
// fresh MemoryCache/MemoryRateLimiter and an injected gov fetch — no network, no
// global-singleton juggling.

import { config } from "@/lib/config";
import type { CacheStore } from "@/lib/cache";
import type { RateLimiter } from "@/lib/rateLimit";
import { fetchVehicle, GovDataError, type FetchLike } from "@/lib/govData/adapter";
import type { VehicleReport } from "@/lib/govData/types";
import { parsePlate } from "@/lib/validation/plate";

/** What we store in the cache — success OR a negative (not-found) marker. */
type CacheEntry =
  | { kind: "found"; report: VehicleReport }
  | { kind: "not_found" };

/** Negative results are cached only briefly (anti-enumeration without hiding a
 *  newly-registered plate for long). Capped at 5 minutes. */
const NEGATIVE_TTL_SECONDS = Math.min(config.cache.ttlSeconds, 300);

export type VehicleResponse =
  | { status: 200; cache: "HIT" | "MISS"; body: VehicleReport }
  | { status: 400; body: { error: "invalid_plate"; message: string } }
  | { status: 404; body: { error: "not_found"; message: string } }
  | {
      status: 429;
      retryAfterSeconds: number;
      body: { error: "rate_limited"; message: string; retryAfterSeconds: number };
    }
  | { status: 502; body: { error: "upstream_error"; message: string } };

export interface VehicleRequest {
  /** Raw plate from the URL (unvalidated). */
  plate: string;
  /** Client identifier for rate limiting (an IP). */
  ip: string;
  cache: CacheStore;
  rateLimiter: RateLimiter;
  /** Injectable fetch (tests). Defaults to global fetch inside the adapter. */
  fetchImpl?: FetchLike;
}

export async function getVehicleResponse(
  req: VehicleRequest,
): Promise<VehicleResponse> {
  const { plate, ip, cache, rateLimiter, fetchImpl } = req;

  // 1) Rate limit per IP — before any work (protects gov quota, blocks enumeration).
  const rl = await rateLimiter.check(ip);
  if (!rl.allowed) {
    const retryAfterSeconds = rl.retryAfterSeconds ?? 60;
    return {
      status: 429,
      retryAfterSeconds,
      body: {
        error: "rate_limited",
        message: "יותר מדי בקשות. נסו שוב בעוד רגע.",
        retryAfterSeconds,
      },
    };
  }

  // 2) Validate + normalize the plate (Zod boundary).
  const parsed = parsePlate(plate);
  if (!parsed.ok) {
    return {
      status: 400,
      body: { error: "invalid_plate", message: parsed.error ?? "מספר רישוי לא תקין" },
    };
  }
  const normalized = parsed.value;
  const cacheKey = `vehicle:${normalized}`;

  // 3) Serve from cache within TTL (no upstream call).
  const cached = await cache.get<CacheEntry>(cacheKey);
  if (cached) {
    if (cached.kind === "found") {
      return { status: 200, cache: "HIT", body: cached.report };
    }
    return {
      status: 404,
      body: { error: "not_found", message: "לא נמצא רכב עם מספר הרישוי הזה." },
    };
  }

  // 4) Cache miss → fetch from the gov API via the adapter.
  let report: VehicleReport | null;
  try {
    report = await fetchVehicle(normalized, fetchImpl);
  } catch (err) {
    // Log the internal detail server-side only; never leak it to the client.
    if (err instanceof GovDataError) {
      console.error(`[vehicle] upstream error for ${normalized}: ${err.detail ?? err.message}`);
    } else {
      console.error(`[vehicle] unexpected error for ${normalized}:`, err);
    }
    return {
      status: 502,
      body: {
        error: "upstream_error",
        message: "אירעה שגיאה בשליפת הנתונים מהמאגר הממשלתי. נסו שוב מאוחר יותר.",
      },
    };
  }

  if (!report) {
    await cache.set<CacheEntry>(cacheKey, { kind: "not_found" }, NEGATIVE_TTL_SECONDS);
    return {
      status: 404,
      body: { error: "not_found", message: "לא נמצא רכב עם מספר הרישוי הזה." },
    };
  }

  await cache.set<CacheEntry>(cacheKey, { kind: "found", report }, config.cache.ttlSeconds);
  return { status: 200, cache: "MISS", body: report };
}
