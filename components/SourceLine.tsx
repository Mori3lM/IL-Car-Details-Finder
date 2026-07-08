import type { SourceRef } from "@/lib/govData/types";
import { formatIsoDate } from "@/lib/format";

/** Provenance line shown under every data block: source(s) + fetch date. */
export function SourceLine({
  sources,
  fetchedAt,
  extra,
}: {
  sources: SourceRef[];
  fetchedAt?: string;
  extra?: string;
}) {
  const updated = fetchedAt ? formatIsoDate(fetchedAt) : "";
  return (
    <p className="source">
      <span aria-hidden="true">◆ </span>
      מקור: {sources.map((s) => s.label).join(" · ")}
      {updated ? ` · נשלף ב-${updated}` : ""}
      {extra ? ` · ${extra}` : ""}
    </p>
  );
}
