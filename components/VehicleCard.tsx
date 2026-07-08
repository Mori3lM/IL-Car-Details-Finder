import type { VehicleReport } from "@/lib/govData/types";
import { formatPlate } from "@/lib/validation/plate";
import { SourceLine } from "./SourceLine";

/** Identity card: plate badge, name (manufacturer + model), sub-line, detail grid. */
export function VehicleCard({ report }: { report: VehicleReport }) {
  const name =
    [report.manufacturer, report.model].filter(Boolean).join(" ") || "רכב";
  const sub = [report.year, report.color, report.fuel].filter(Boolean).join(" · ");

  // Technical details grid: trim (if present) + the mapped detail fields.
  const rows: { label: string; value: string }[] = [];
  if (report.trim) rows.push({ label: "רמת גימור", value: report.trim });
  rows.push(...report.details);

  return (
    <section className="card identity" aria-labelledby="car-name">
      <span className="plate" aria-label={`מספר רישוי ${formatPlate(report.plate)}`}>
        {formatPlate(report.plate)}
      </span>
      <h1 id="car-name">{name}</h1>
      {sub && <p className="identity__sub">{sub}</p>}

      {rows.length > 0 && (
        <dl className="dl-grid">
          {rows.map((r, i) => (
            <div key={`${r.label}-${i}`}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <SourceLine sources={report.sources} fetchedAt={report.fetchedAt} />
    </section>
  );
}
