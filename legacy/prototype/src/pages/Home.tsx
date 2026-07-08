import { useEffect, useRef, useState } from "react";
import { SearchBox } from "../components/SearchBox";
import { VehicleResult } from "../components/VehicleResult";
import { ResultSkeleton, ErrorBox } from "../components/states";
import { fetchVehicle, GovDataError } from "../lib/govData/adapter";
import type { VehicleReport } from "../lib/govData/types";

type Phase = "idle" | "loading" | "done" | "error";

export function Home({ autoPlate }: { autoPlate?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [error, setError] = useState<string>("");
  const [current, setCurrent] = useState<string>("");
  const liveRef = useRef<HTMLDivElement>(null);

  async function run(plate: string) {
    setCurrent(plate);
    setPhase("loading");
    setError("");
    try {
      const r = await fetchVehicle(plate);
      setReport(r);
      setPhase("done");
    } catch (e) {
      setError(e instanceof GovDataError ? e.message : "אירעה שגיאה לא צפויה. נסו שוב.");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (autoPlate) run(autoPlate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlate]);

  return (
    <>
      {phase === "idle" && (
        <>
          <h1>בדיקת רכב לפי מספר רישוי</h1>
          <p className="hint">מזינים מספר — ומקבלים את פרטי הרכב, סטטוס רישוי וטסט, ותזכורת ליומן. חינם, ממקורות משרד התחבורה.</p>
        </>
      )}

      <SearchBox initial={current} onSearch={run} />
      <p id="plate-hint" className="hint">מספר רישוי בן 5–8 ספרות (עם או בלי מקפים).</p>

      <div id="result" role="region" aria-live="polite" aria-label="תוצאות הרכב" ref={liveRef} tabIndex={-1}>
        {phase === "loading" && <ResultSkeleton />}
        {phase === "error" && <ErrorBox message={error} onRetry={() => run(current)} />}
        {phase === "done" && report && <VehicleResult report={report} />}
      </div>
    </>
  );
}
