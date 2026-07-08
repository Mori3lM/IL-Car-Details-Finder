// SEO helpers: schema.org/Vehicle JSON-LD for the car page.
// Only fields the registry actually returns are included — no invented data.

import type { VehicleReport } from "@/lib/govData/types";

export function buildVehicleJsonLd(
  report: VehicleReport,
  url: string,
): Record<string, unknown> {
  const name =
    [report.manufacturer, report.model].filter(Boolean).join(" ") ||
    `רכב ${report.plate}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    url,
  };

  if (report.manufacturer)
    jsonLd.manufacturer = { "@type": "Organization", name: report.manufacturer };
  if (report.model) jsonLd.model = report.model;
  if (report.trim) jsonLd.vehicleConfiguration = report.trim;
  if (report.year) jsonLd.vehicleModelDate = report.year;
  if (report.color) jsonLd.color = report.color;
  if (report.fuel) jsonLd.fuelType = report.fuel;

  const vin = report.details.find((d) => d.label.includes("VIN"))?.value;
  if (vin) jsonLd.vehicleIdentificationNumber = vin;

  return jsonLd;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** schema.org/FAQPage JSON-LD from a list of Q&A pairs. */
export function buildFaqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * Serialize JSON-LD for inline injection. Escapes `<` so untrusted registry text
 * can never break out of the <script> element (prevents </script> injection).
 * This is the only safe way to emit JSON-LD in React and is XSS-safe.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
