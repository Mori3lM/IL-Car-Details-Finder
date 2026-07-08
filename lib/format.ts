// Display formatting helpers — Israeli conventions (DD.MM.YYYY, Hebrew plurals).

/** ISO (yyyy-mm-dd...) → Israeli date "14.11.2026". Empty string if unparseable. */
export function formatIsoDate(iso?: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

const day = (n: number) => (n === 1 ? "יום" : "ימים");

/** Days-remaining phrase: "עוד 132 ימים" / "היום" / "לפני 5 ימים". */
export function formatDaysRemaining(days?: number): string {
  if (days === undefined || Number.isNaN(days)) return "";
  if (days === 0) return "היום";
  if (days > 0) return `עוד ${days} ${day(days)}`;
  const abs = Math.abs(days);
  return `לפני ${abs} ${day(abs)}`;
}
