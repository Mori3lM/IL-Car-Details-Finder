// GET /api/vehicle/[plate] — the browser's ONLY entry point to vehicle data.
// All data.gov.il access happens server-side, behind here. This file is a thin
// wrapper: extract plate + client IP, wire the real cache/rate-limiter (via the
// interface factories — never a concrete impl), delegate to getVehicleResponse,
// and serialize. All logic + tests live in lib/api/vehicleHandler.ts.

import { getCacheStore } from "@/lib/cache";
import { getRateLimiter } from "@/lib/rateLimit";
import { getVehicleResponse } from "@/lib/api/vehicleHandler";

export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "local";
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ plate: string }> },
): Promise<Response> {
  const { plate } = await ctx.params;

  const result = await getVehicleResponse({
    plate,
    ip: clientIp(req),
    cache: getCacheStore(),
    rateLimiter: getRateLimiter(),
  });

  const headers: Record<string, string> = {};
  if (result.status === 200) headers["X-Cache"] = result.cache;
  if (result.status === 429) headers["Retry-After"] = String(result.retryAfterSeconds);

  return Response.json(result.body, { status: result.status, headers });
}
