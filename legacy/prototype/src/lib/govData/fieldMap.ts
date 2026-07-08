// Hebrew field labels — ported from the original code.py `field_translation`.
// Kept as the single source of truth for how raw API field ids read in Hebrew.

export const FIELD_LABELS: Record<string, string> = {
  mispar_rechev: "מספר רכב",
  tozeret_nm: "יצרן",
  kinuy_mishari: "דגם מסחרי",
  degem_nm: "קוד דגם",
  ramat_gimur: "רמת גימור",
  shnat_yitzur: "שנת ייצור",
  tzeva_rechev: "צבע",
  sug_delek_nm: "סוג דלק",
  degem_manoa: "דגם מנוע",
  kvutzat_zihum: "קבוצת זיהום",
  zmig_kidmi: "צמיג קדמי",
  zmig_ahori: "צמיג אחורי",
  baalut: "סוג בעלות",
  misgeret: "מספר שלדה (VIN)",
  moed_aliya_lakvish: "מועד עלייה לכביש",
  mivchan_acharon_dt: "תאריך טסט אחרון",
  tokef_dt: "תוקף רישוי",
};

/** Raw API field id -> label, falling back to the id itself. */
export function labelFor(fieldId: string): string {
  return FIELD_LABELS[fieldId] ?? fieldId;
}
