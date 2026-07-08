// Plate input validation + normalization (server boundary).
// Security: whitelist digits only, enforce length 5–8 BEFORE any upstream call
// (07_SECURITY_SPEC §1). Zod is the validator; friendly Hebrew messages on top.
// Normalization logic ported from the prototype (legacy/prototype/src/lib/plate.ts).

import { z } from "zod";

const digitsOnly = (s: string): string => s.replace(/\D/g, "");

/**
 * Zod schema: any string → digits-only, must be 5–8 digits.
 * Israeli plates are 5–8 digits (older cars 5–6, current 7–8).
 */
export const plateSchema = z
  .string()
  .transform(digitsOnly)
  .refine((d) => d.length >= 5 && d.length <= 8, {
    message: "מספר רישוי לא תקין — נדרשות 5 עד 8 ספרות",
  });

export interface PlateParse {
  ok: boolean;
  value: string; // normalized digits (empty on failure)
  error?: string; // friendly Hebrew message
}

/** Validate + normalize a raw plate. Never throws. */
export function parsePlate(raw: unknown): PlateParse {
  const input = typeof raw === "string" ? raw : "";
  const result = plateSchema.safeParse(input);
  if (result.success) return { ok: true, value: result.data };

  const isEmpty = digitsOnly(input).length === 0;
  return {
    ok: false,
    value: "",
    error: isEmpty
      ? "יש להזין מספר רישוי"
      : (result.error.issues[0]?.message ?? "מספר רישוי לא תקין"),
  };
}

/** Pretty display grouping: 12-345-67 (8 digits) or 12-345-67 (7 digits). */
export function formatPlate(digits: string): string {
  if (digits.length === 8)
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  if (digits.length === 7)
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  return digits;
}
