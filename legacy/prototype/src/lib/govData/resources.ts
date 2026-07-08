// data.gov.il resource configuration.
//
// The CORE registry is confirmed working and rich (identity, test/licence dates,
// ownership type, VIN, colour, emissions...). Owner-count and recalls live in
// SEPARATE datasets. Their resource ids are intentionally left null: until each is
// verified to return records, the UI honestly shows "לא זמין" rather than inventing
// data. Wiring one later is a one-line change here — no other code changes.

export const GOV_API_BASE = "https://data.gov.il/api/3/action/datastore_search";

export interface ResourceConfig {
  id: string | null;
  label: string;
  datasetUrl: string;
}

export const RESOURCES = {
  // Confirmed: 4.1M+ active private/commercial vehicles.
  core: {
    id: "053cea08-09bc-40ec-8f7a-156f0677aff3",
    label: "משרד התחבורה — מאגר רכב פרטי ומסחרי",
    datasetUrl: "https://data.gov.il/dataset/private-and-commercial-vehicles",
  } as ResourceConfig,

  // Enrichment slots — fill `id` once a dataset is verified to return records.
  ownerHistory: {
    id: null,
    label: "משרד התחבורה — היסטוריית בעלות",
    datasetUrl: "https://www.gov.il/he/departments/dynamiccollectors/private_vehicle_history_2",
  } as ResourceConfig,

  recalls: {
    id: null,
    label: "משרד התחבורה — קריאות שירות ובטיחות (ריקולים)",
    datasetUrl: "https://data.gov.il/dataset/recall",
  } as ResourceConfig,
} as const;
