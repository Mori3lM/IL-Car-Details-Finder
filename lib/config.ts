// Central server-side configuration, read from env with LOCAL-FIRST defaults.
// No secrets live here: every value has a working default, so the app runs with an
// empty (or missing) .env.local. See .env.local.example for the documented keys.

function readString(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw && raw.trim() !== "" ? raw.trim() : fallback;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const config = {
  govApiBase: readString(
    "GOV_API_BASE",
    "https://data.gov.il/api/3/action/datastore_search",
  ),
  cache: {
    driver: readString("CACHE_DRIVER", "memory"),
    ttlSeconds: readNumber("CACHE_TTL_SECONDS", 86_400),
  },
  rateLimit: {
    driver: readString("RATE_LIMIT_DRIVER", "memory"),
    max: readNumber("RATE_LIMIT_MAX", 30),
    windowMs: readNumber("RATE_LIMIT_WINDOW_MS", 60_000),
  },
} as const;

export type AppConfig = typeof config;
