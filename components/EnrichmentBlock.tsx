import type { Enrichment } from "@/lib/govData/types";
import { InfoIcon } from "./Icons";

/**
 * Renders an enrichment block (owner count, recalls). When the underlying
 * dataset isn't wired, we show an honest "לא זמין" note — NEVER invented data
 * (05_BUILD_SPEC §11). `available` is false throughout the local build.
 */
export function EnrichmentBlock({
  enrichment,
  unavailableFallback = "לא זמין במאגר הפתוח כרגע",
}: {
  enrichment: Enrichment<unknown>;
  unavailableFallback?: string;
}) {
  if (!enrichment.available) {
    return (
      <p className="enrichment--na">
        <InfoIcon />
        <span>{enrichment.note ?? unavailableFallback} · לא זמין</span>
      </p>
    );
  }
  // (Future) available branch is rendered by callers that pass real data.
  return null;
}
