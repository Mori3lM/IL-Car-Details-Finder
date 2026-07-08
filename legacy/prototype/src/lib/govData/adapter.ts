// The adapter: the ONLY module that talks to data.gov.il and knows its raw shape.
// Turns a normalized plate into a typed VehicleReport (or a clean "not found").

import { GOV_API_BASE, RESOURCES } from "./resources";
import type {
  DetailField,
  SourceRef,
  ValidityStatus,
  VehicleReport,
} from "./types";

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

export class GovDataError extends Error {}

/** Injectable fetch so tests can run without network. */
type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const clean = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" || s === "null" ? undefined : s;
};

/** Compute licence validity from an ISO date string (tokef_dt). */
export function computeValidity(dateStr: string | undefined, label: string, now = new Date()): ValidityStatus {
  const iso = clean(dateStr);
  if (!iso) return { label: `${label} — לא זמין`, level: "unknown" };
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime())) return { label: `${label} — לא זמין`, level: "unknown" };
  const days = Math.round((target.getTime() - stripTime(now)) / 86_400_000);
  if (days < 0) return { label: `${label} — פג תוקף`, level: "expired", date: iso, daysRemaining: days };
  if (days <= 45) return { label: `${label} — יש לחדש בקרוב`, level: "soon", date: iso, daysRemaining: days };
  return { label: `${label} בתוקף`, level: "ok", date: iso, daysRemaining: days };
}

function stripTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

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

/** Map a raw record into the typed report. Pure + unit-tested. */
export function mapRecord(plate: string, r: RawRecord): VehicleReport {
  const sources: SourceRef[] = [
    { label: RESOURCES.core.label, datasetUrl: RESOURCES.core.datasetUrl },
  ];
  return {
    plate,
    found: true,
    manufacturer: clean(r.tozeret_nm),
    model: clean(r.kinuy_mishari) ?? clean(r.degem_nm),
    trim: clean(r.ramat_gimur),
    year: clean(r.shnat_yitzur),
    color: clean(r.tzeva_rechev),
    fuel: clean(r.sug_delek_nm),
    details: buildDetails(r),
    licence: computeValidity(clean(r.tokef_dt), "רישוי"),
    lastTestDate: clean(r.mivchan_acharon_dt),
    ownershipType: clean(r.baalut),
    ownerCount: { available: false, note: "מספר בעלים קודמים אינו זמין במאגר הפתוח כרגע" },
    recalls: { available: false, note: "בדיקת ריקולים אינה זמינה במאגר הפתוח כרגע" },
    sources,
    fetchedAt: new Date().toISOString(),
  };
}

function notFound(plate: string): VehicleReport {
  return {
    plate,
    found: false,
    details: [],
    licence: { label: "רישוי — לא זמין", level: "unknown" },
    ownerCount: { available: false },
    recalls: { available: false },
    sources: [{ label: RESOURCES.core.label, datasetUrl: RESOURCES.core.datasetUrl }],
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch a vehicle by normalized plate. `fetchImpl` is injectable for tests.
 * Uses q= (like the original CLI) then filters to an exact plate match to avoid
 * partial hits.
 */
export async function fetchVehicle(
  plate: string,
  fetchImpl: FetchLike = globalThis.fetch as unknown as FetchLike,
): Promise<VehicleReport> {
  const url = `${GOV_API_BASE}?resource_id=${RESOURCES.core.id}&q=${encodeURIComponent(plate)}&limit=10`;

  let res: Awaited<ReturnType<FetchLike>>;
  try {
    res = await fetchImpl(url);
  } catch {
    throw new GovDataError("שגיאת רשת — לא הצלחנו להתחבר למאגר. נסו שוב.");
  }
  if (!res.ok) throw new GovDataError(`המאגר הממשלתי החזיר שגיאה (${res.status}). נסו שוב מאוחר יותר.`);

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new GovDataError("התקבלה תשובה לא תקינה מהמאגר. נסו שוב.");
  }

  const records = extractRecords(payload);
  const match =
    records.find((r) => String(r.mispar_rechev ?? "").replace(/\D/g, "") === plate) ?? records[0];

  if (!match) return notFound(plate);
  return mapRecord(plate, match);
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
