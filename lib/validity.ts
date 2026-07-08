// Pure licence/test validity computation — shared by the server adapter and the
// client (my-cars recomputes a saved car's CURRENT status, which may have drifted
// since it was saved). No I/O, no deps beyond the ValidityStatus type.

import type { ValidityStatus } from "@/lib/govData/types";

const clean = (v: string | undefined): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" || s === "null" ? undefined : s;
};

function stripTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Compute validity from an ISO date string. `label` prefixes the Hebrew status. */
export function computeValidity(
  dateStr: string | undefined,
  label: string,
  now: Date = new Date(),
): ValidityStatus {
  const iso = clean(dateStr);
  if (!iso) return { label: `${label} — לא זמין`, level: "unknown" };
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime()))
    return { label: `${label} — לא זמין`, level: "unknown" };

  const days = Math.round((target.getTime() - stripTime(now)) / 86_400_000);
  if (days < 0)
    return { label: `${label} — פג תוקף`, level: "expired", date: iso, daysRemaining: days };
  if (days <= 45)
    return { label: `${label} — יש לחדש בקרוב`, level: "soon", date: iso, daysRemaining: days };
  return { label: `${label} בתוקף`, level: "ok", date: iso, daysRemaining: days };
}
