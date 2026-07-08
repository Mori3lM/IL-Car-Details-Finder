// Plate / VIN input normalization + validation.
// Israeli license plates are 5–8 digits (older cars 5–6, current 7–8).

export interface PlateResult {
  ok: boolean;
  value: string;
  error?: string;
}

/** Normalize a raw plate string: strip spaces, dashes and any non-digit. */
export function normalizePlate(raw: string): PlateResult {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 0) {
    return { ok: false, value: "", error: "יש להזין מספר רישוי" };
  }
  if (digits.length < 5 || digits.length > 8) {
    return { ok: false, value: digits, error: "מספר רישוי לא תקין — נדרשות 5 עד 8 ספרות" };
  }
  return { ok: true, value: digits };
}

/** Pretty display: 12-345-67 (8 digits) or 123-45-678 style grouping. */
export function formatPlate(digits: string): string {
  if (digits.length === 8) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  if (digits.length === 7) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  return digits;
}

/** A VIN/chassis is alphanumeric; used to decide which field an input targets. */
export function looksLikeVin(raw: string): boolean {
  const v = (raw ?? "").trim();
  return /[A-Za-z]/.test(v) && v.replace(/\s/g, "").length >= 6;
}
