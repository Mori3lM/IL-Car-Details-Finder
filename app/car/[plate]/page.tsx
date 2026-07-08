import type { Metadata } from "next";
import { getCacheStore } from "@/lib/cache";
import { resolveVehicle } from "@/lib/api/resolveVehicle";
import { RESOURCES } from "@/lib/govData/resources";
import { formatPlate } from "@/lib/validation/plate";
import { formatIsoDate } from "@/lib/format";
import { SearchBox } from "@/components/SearchBox";
import { VehicleCard } from "@/components/VehicleCard";
import { StatusRow } from "@/components/StatusRow";
import { EnrichmentBlock } from "@/components/EnrichmentBlock";
import { SaveActions } from "@/components/SaveActions";
import { SourceLine } from "@/components/SourceLine";
import { InvalidState, NotFoundState, ErrorState } from "@/components/states";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ plate: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { plate } = await params;
  const pretty = formatPlate(plate.replace(/\D/g, ""));
  return {
    title: `כרטיס רכב · ${pretty}`,
    description: `פרטי רכב, סטטוס רישוי וטסט עבור מספר רישוי ${pretty} — ממקורות משרד התחבורה.`,
  };
}

export default async function CarPage({ params }: Params) {
  const { plate } = await params;
  const result = await resolveVehicle({ plate, cache: getCacheStore() });

  if (result.kind === "invalid") {
    return (
      <main id="main" className="page">
        <InvalidState plate={plate} message={result.message} />
      </main>
    );
  }
  if (result.kind === "not_found") {
    return (
      <main id="main" className="page">
        <NotFoundState plate={plate} />
      </main>
    );
  }
  if (result.kind === "error") {
    return (
      <main id="main" className="page">
        <ErrorState />
      </main>
    );
  }

  const report = result.report;
  const name =
    [report.manufacturer, report.model].filter(Boolean).join(" ") || "רכב";

  return (
    <main id="main" className="page">
      <SearchBox initialValue={report.plate} />

      <div
        id="result"
        role="region"
        aria-label={`תוצאות עבור רכב ${formatPlate(report.plate)}`}
        tabIndex={-1}
      >
        <VehicleCard report={report} />

        {/* Status — the most prominent block (the product's "aha" moment). */}
        <section className="card" aria-labelledby="status-h">
          <h2 id="status-h">סטטוס רישוי וטסט</h2>
          <StatusRow status={report.licence} />
          {report.lastTestDate && (
            <p className="info-line">
              טסט אחרון: <strong>{formatIsoDate(report.lastTestDate)}</strong>
            </p>
          )}
          <SaveActions
            plate={report.plate}
            name={name}
            licenceExpiry={report.licence.date}
            licenceLevel={report.licence.level}
          />
          <SourceLine sources={report.sources} fetchedAt={report.fetchedAt} />
        </section>

        {/* Ownership — type from the core registry; owner count is not available. */}
        <section className="card" aria-labelledby="owner-h">
          <h2 id="owner-h">בעלות</h2>
          {report.ownershipType && (
            <dl className="dl-grid">
              <div>
                <dt>סוג בעלות</dt>
                <dd>{report.ownershipType}</dd>
              </div>
            </dl>
          )}
          <p className="info-line">מספר בעלים קודמים:</p>
          <EnrichmentBlock enrichment={report.ownerCount} />
          <SourceLine sources={report.sources} fetchedAt={report.fetchedAt} />
        </section>

        {/* Recalls — separate dataset, not wired → honest "לא זמין". */}
        <section className="card" aria-labelledby="recall-h">
          <h2 id="recall-h">ריקולים וקריאות בטיחות</h2>
          <EnrichmentBlock enrichment={report.recalls} />
          <SourceLine
            sources={[
              {
                label: RESOURCES.recalls.label,
                datasetUrl: RESOURCES.recalls.datasetUrl,
              },
            ]}
            extra="טרם חובר למאגר"
          />
        </section>
      </div>
    </main>
  );
}
