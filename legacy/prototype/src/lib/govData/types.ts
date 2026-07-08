// Typed shape the whole UI consumes. The adapter is the ONLY place that knows the
// raw data.gov.il API shape; everything downstream uses these types.

export interface SourceRef {
  label: string; // e.g. "משרד התחבורה — מאגר רכב פרטי ומסחרי"
  datasetUrl: string;
}

export interface DetailField {
  label: string; // Hebrew label
  value: string; // display-ready value
}

/** Result of computing days remaining until a validity date. */
export type ValidityLevel = "ok" | "soon" | "expired" | "unknown";

export interface ValidityStatus {
  label: string; // "רישוי בתוקף" / "פג תוקף" ...
  level: ValidityLevel;
  date?: string; // ISO date from the registry
  daysRemaining?: number;
}

/** An enrichment block that may or may not be available from the free API. */
export interface Enrichment<T> {
  available: boolean;
  data?: T;
  note?: string; // shown when not available, e.g. "לא זמין במאגר הפתוח"
}

export interface VehicleReport {
  plate: string; // normalized digits
  found: boolean;

  // Identity
  manufacturer?: string; // tozeret_nm
  model?: string; // kinuy_mishari || degem_nm
  trim?: string; // ramat_gimur
  year?: string; // shnat_yitzur
  color?: string; // tzeva_rechev
  fuel?: string; // sug_delek_nm

  // Technical details (rendered as a grid)
  details: DetailField[];

  // Status
  licence: ValidityStatus; // from tokef_dt
  lastTestDate?: string; // mivchan_acharon_dt

  // Ownership
  ownershipType?: string; // baalut (from core record)
  ownerCount: Enrichment<{ count: number; type?: string }>;

  // Safety
  recalls: Enrichment<{ open: number; items: string[] }>;

  sources: SourceRef[];
  fetchedAt: string; // ISO timestamp
}
