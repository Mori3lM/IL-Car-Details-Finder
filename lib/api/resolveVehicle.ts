// Shared server-side core: validate → cache → adapter. Used by BOTH the public
// API route (lib/api/vehicleHandler.ts, which adds rate limiting + HTTP mapping)
// and the SSR car page (app/car/[plate]/page.tsx, which renders directly).
// Keeping this single source avoids duplicating the cache/fetch logic.

import { config } from "@/lib/config";
import type { CacheStore } from "@/lib/cache";
import { fetchVehicle, GovDataError, type FetchLike } from "@/lib/govData/adapter";
import type { VehicleReport } from "@/lib/govData/types";
import { parsePlate } from "@/lib/validation/plate";

/** Cache envelope — success OR a negative (not-found) marker. */
export type CacheEntry =
  | { kind: "found"; report: VehicleReport }
  | { kind: "not_found" };

/** Negative results cached only briefly (anti-enumeration without hiding a
 *  newly-registered plate for long). Capped at 5 minutes. */
export const NEGATIVE_TTL_SECONDS = Math.min(config.cache.ttlSeconds, 300);

export type ResolveResult =
  | { kind: "ok"; report: VehicleReport; cache: "HIT" | "MISS" }
  | { kind: "invalid"; message: string }
  | { kind: "not_found" }
  | { kind: "error" };

export interface ResolveDeps {
  plate: string; // raw, unvalidated
  cache: CacheStore;
  fetchImpl?: FetchLike;
}

export async function resolveVehicle({
  plate,
  cache,
  fetchImpl,
}: ResolveDeps): Promise<ResolveResult> {
  const parsed = parsePlate(plate);
  if (!parsed.ok) {
    return { kind: "invalid", message: parsed.error ?? "מספר רישוי לא תקין" };
  }

  const key = `vehicle:${parsed.value}`;

  const cached = await cache.get<CacheEntry>(key);
  if (cached) {
    return cached.kind === "found"
      ? { kind: "ok", report: cached.report, cache: "HIT" }
      : { kind: "not_found" };
  }

  let report: VehicleReport | null;
  try {
    report = await fetchVehicle(parsed.value, fetchImpl);
  } catch (err) {
    if (err instanceof GovDataError) {
      console.error(
        `[vehicle] upstream error for ${parsed.value}: ${err.detail ?? err.message}`,
      );
    } else {
      console.error(`[vehicle] unexpected error for ${parsed.value}:`, err);
    }
    return { kind: "error" };
  }

  if (!report) {
    await cache.set<CacheEntry>(key, { kind: "not_found" }, NEGATIVE_TTL_SECONDS);
    return { kind: "not_found" };
  }

  await cache.set<CacheEntry>(key, { kind: "found", report }, config.cache.ttlSeconds);
  return { kind: "ok", report, cache: "MISS" };
}
