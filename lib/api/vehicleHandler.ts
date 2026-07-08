// Public API handler for GET /api/vehicle/[plate]: rate-limit per IP, then defer
// to the shared resolveVehicle() core, then map the result to an HTTP response.
// Pure + dependency-injected so it's fully unit-testable (no network, no
// global singletons). The route file just wires real deps and serializes.

import type { CacheStore } from "@/lib/cache";
import type { RateLimiter } from "@/lib/rateLimit";
import type { FetchLike } from "@/lib/govData/adapter";
import type { VehicleReport } from "@/lib/govData/types";
import { resolveVehicle } from "./resolveVehicle";

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
  plate: string;
  ip: string;
  cache: CacheStore;
  rateLimiter: RateLimiter;
  fetchImpl?: FetchLike;
}

const NOT_FOUND_MESSAGE = "לא נמצא רכב עם מספר הרישוי הזה.";
const UPSTREAM_MESSAGE =
  "אירעה שגיאה בשליפת הנתונים מהמאגר הממשלתי. נסו שוב מאוחר יותר.";

export async function getVehicleResponse(
  req: VehicleRequest,
): Promise<VehicleResponse> {
  const { plate, ip, cache, rateLimiter, fetchImpl } = req;

  // Rate limit per IP first — protects the gov quota, blocks enumeration.
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

  const result = await resolveVehicle({ plate, cache, fetchImpl });
  switch (result.kind) {
    case "ok":
      return { status: 200, cache: result.cache, body: result.report };
    case "invalid":
      return {
        status: 400,
        body: { error: "invalid_plate", message: result.message },
      };
    case "not_found":
      return {
        status: 404,
        body: { error: "not_found", message: NOT_FOUND_MESSAGE },
      };
    case "error":
      return {
        status: 502,
        body: { error: "upstream_error", message: UPSTREAM_MESSAGE },
      };
  }
}
