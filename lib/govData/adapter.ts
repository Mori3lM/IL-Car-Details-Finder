// The adapter: the ONLY module that talks to data.gov.il and knows its raw shape.
// Turns a normalized plate into a typed VehicleReport, or null when not found.
// Throws GovDataError on any upstream failure (the route maps that to a clean 502).

import { GOV_API_BASE, RESOURCES } from "./resources";
import { computeValidity } from "@/lib/validity";
import type { DetailField, SourceRef, VehicleReport } from "./types";

// Re-exported so existing importers (and tests) can keep using it from the adapter.
export { computeValidity };

/** Raw record fields we rely on (all optional — the API can omit any). */
interface RawRecord {
  mispar_rechev?: number | string;
  tozeret_nm?: string;
  kinuy_mishari?: string;
  degem_nm?: string;
  ramat_gimur?: string;
  shnat_yitzur?: number | string;
  tzeva_rechev?: string;
  sug_delek_nm?: string;
  degem_manoa?: string;
  kvutzat_zihum?: number | string;
  zmig_kidmi?: string;
  zmig_ahori?: string;
  baalut?: string;
  misgeret?: string;
  moed_aliya_lakvish?: string;
  mivchan_acharon_dt?: string;
  tokef_dt?: string;
  [k: string]: unknown;
}

/** Thrown for any upstream/transport failure. Message is user-safe (Hebrew). */
export class GovDataError extends Error {
  constructor(
    message: string,
    /** Internal detail for server-side logging only — never sent to the client. */
    readonly detail?: string,
  ) {
    super(message);
    this.name = "GovDataError";
  }
}

/** Minimal fetch contract, injectable so tests run offline. Global fetch satisfies it. */
export type FetchLike = (
  url: string,
  init?: { signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const UPSTREAM_TIMEOUT_MS = 8_000;

const clean = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" || s === "null" ? undefined : s;
};

function buildDetails(r: RawRecord): DetailField[] {
  const out: DetailField[] = [];
  const push = (label: string, v: unknown) => {
    const c = clean(v);
    if (c) out.push({ label, value: c });
  };
  push("דגם מנוע", r.degem_manoa);
  push("קבוצת זיהום", r.kvutzat_zihum);
  push("צמיג קדמי", r.zmig_kidmi);
  push("צמיג אחורי", r.zmig_ahori);
  push("מספר שלדה (VIN)", r.misgeret);
  push("מועד עלייה לכביש", r.moed_aliya_lakvish);
  return out;
}

/** Map a raw record into the typed report. Pure — no I/O, unit-tested. */
export function mapRecord(
  plate: string,
  r: RawRecord,
  now: Date = new Date(),
): VehicleReport {
  const sources: SourceRef[] = [
    { label: RESOURCES.core.label, datasetUrl: RESOURCES.core.datasetUrl },
  ];
  return {
    plate,
    manufacturer: clean(r.tozeret_nm),
    model: clean(r.kinuy_mishari) ?? clean(r.degem_nm),
    trim: clean(r.ramat_gimur),
    year: clean(r.shnat_yitzur),
    color: clean(r.tzeva_rechev),
    fuel: clean(r.sug_delek_nm),
    details: buildDetails(r),
    licence: computeValidity(clean(r.tokef_dt), "רישוי", now),
    lastTestDate: clean(r.mivchan_acharon_dt),
    ownershipType: clean(r.baalut),
    // Never invented — these live in separate, unverified datasets.
    ownerCount: {
      available: false,
      note: "מספר בעלים קודמים אינו זמין במאגר הפתוח כרגע",
    },
    recalls: {
      available: false,
      note: "בדיקת ריקולים אינה זמינה במאגר הפתוח כרגע",
    },
    sources,
    fetchedAt: now.toISOString(),
  };
}

function extractRecords(payload: unknown): RawRecord[] {
  if (
    payload &&
    typeof payload === "object" &&
    "result" in payload &&
    payload.result &&
    typeof payload.result === "object" &&
    "records" in payload.result &&
    Array.isArray((payload.result as { records: unknown }).records)
  ) {
    return (payload.result as { records: RawRecord[] }).records;
  }
  return [];
}

/**
 * Fetch a vehicle by NORMALIZED plate (digits only). Returns the typed report,
 * or null when no record exactly matches. Throws GovDataError on upstream failure.
 *
 * Security: the URL host is the fixed GOV_API_BASE constant; only `q` (the plate)
 * is user-derived and URL-encoded — user input never selects the host (no SSRF).
 */
export async function fetchVehicle(
  plate: string,
  fetchImpl: FetchLike = globalThis.fetch as unknown as FetchLike,
  now: Date = new Date(),
): Promise<VehicleReport | null> {
  const url = `${GOV_API_BASE}?resource_id=${RESOURCES.core.id}&q=${encodeURIComponent(
    plate,
  )}&limit=10`;

  let res: Awaited<ReturnType<FetchLike>>;
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch (e) {
    throw new GovDataError(
      "שגיאת רשת — לא הצלחנו להתחבר למאגר הממשלתי. נסו שוב.",
      e instanceof Error ? e.message : String(e),
    );
  }

  if (!res.ok) {
    throw new GovDataError(
      "המאגר הממשלתי אינו זמין כרגע. נסו שוב מאוחר יותר.",
      `upstream status ${res.status}`,
    );
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch (e) {
    throw new GovDataError(
      "התקבלה תשובה לא תקינה מהמאגר. נסו שוב.",
      e instanceof Error ? e.message : String(e),
    );
  }

  const records = extractRecords(payload);
  // Exact match only: a full-text `q` can return near-misses; showing the wrong
  // car would be worse than an honest "not found".
  const match = records.find(
    (r) => String(r.mispar_rechev ?? "").replace(/\D/g, "") === plate,
  );

  if (!match) return null;
  return mapRecord(plate, match, now);
}
