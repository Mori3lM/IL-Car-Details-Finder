import { useState } from "react";
import type { VehicleReport, ValidityStatus } from "../lib/govData/types";
import { formatPlate } from "../lib/plate";
import { CheckIcon, WarnIcon, InfoIcon } from "./Icons";
import { downloadIcs } from "../lib/ics";
import { isSaved, saveVehicle, removeVehicle, getPrefs } from "../lib/storage";

function ilDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusRow({ s }: { s: ValidityStatus }) {
  const Icon = s.level === "ok" ? CheckIcon : s.level === "unknown" ? InfoIcon : WarnIcon;
  const days =
    s.daysRemaining === undefined
      ? null
      : s.daysRemaining < 0
        ? `אחור ${Math.abs(s.daysRemaining)} ימים`
        : `עוד ${s.daysRemaining} ימים`;
  return (
    <div className={`status ${s.level}`}>
      <Icon />
      <span>
        {s.label}
        {s.date ? ` · עד ${ilDate(s.date)}` : ""}
      </span>
      {days ? <span className="days">{days}</span> : null}
    </div>
  );
}

export function VehicleResult({ report }: { report: VehicleReport }) {
  const [saved, setSaved] = useState(() => isSaved(report.plate));

  if (!report.found) {
    return (
      <div className="card empty" role="status">
        <p><strong>לא נמצא רכב עם המספר {formatPlate(report.plate)}.</strong></p>
        <p className="hint">ודאו שהמספר הוקלד נכון. ייתכן שהרכב אינו במאגר הפעיל של משרד התחבורה.</p>
      </div>
    );
  }

  const title = [report.manufacturer, report.model].filter(Boolean).join(" ") || "רכב";

  function toggleSave() {
    if (saved) {
      removeVehicle(report.plate);
      setSaved(false);
    } else {
      saveVehicle({
        plate: report.plate,
        nickname: title,
        licenceExpiry: report.licence.date,
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
    }
  }

  function addReminder() {
    if (!report.licence.date) return;
    downloadIcs(
      {
        title: `חידוש רישוי רכב ${formatPlate(report.plate)} — ${title}`,
        date: report.licence.date,
        description: "תזכורת מ‑כרטיס רכב. המידע ממקורות משרד התחבורה ואינו תחליף לבדיקה פיזית.",
        daysBefore: getPrefs().reminderDaysBefore,
      },
      `rishui-${report.plate}.ics`,
    );
  }

  return (
    <>
      <section className="card identity" aria-labelledby="car-name">
        <span className="plate-badge" aria-label={`מספר רישוי ${formatPlate(report.plate)}`}>
          {formatPlate(report.plate)}
        </span>
        <h1 id="car-name">{title}</h1>
        <p className="sub">
          {[report.year, report.color, report.fuel, report.trim].filter(Boolean).join(" · ")}
        </p>
        {report.details.length > 0 && (
          <dl className="grid">
            {report.details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="source"><span aria-hidden="true">◆</span> מקור: {report.sources[0]?.label} · נשלף {ilDate(report.fetchedAt.slice(0, 10))}</p>
      </section>

      <section className="card" aria-labelledby="status-h">
        <h2 id="status-h">רישוי וטסט</h2>
        <StatusRow s={report.licence} />
        {report.lastTestDate ? (
          <div className="status unknown">
            <InfoIcon />
            <span>טסט אחרון בוצע ב‑{ilDate(report.lastTestDate)}</span>
          </div>
        ) : null}
        <div className="actions">
          <button className="btn primary" type="button" aria-pressed={saved} onClick={toggleSave}>
            {saved ? "✓ נשמר — הסר" : "שמור את הרכב"}
          </button>
          <button className="btn" type="button" onClick={addReminder} disabled={!report.licence.date}>
            הוסף תזכורת ליומן
          </button>
        </div>
        <p className="source"><span aria-hidden="true">◆</span> נשמר מקומית בדפדפן שלך בלבד — לא נשלח לשום שרת.</p>
      </section>

      <section className="card" aria-labelledby="owners-h">
        <h2 id="owners-h">בעלות</h2>
        <dl className="grid" style={{ marginTop: 0 }}>
          {report.ownershipType ? (
            <div><dt>סוג בעלות</dt><dd>{report.ownershipType}</dd></div>
          ) : null}
          <div>
            <dt>מספר בעלים קודמים</dt>
            <dd>{report.ownerCount.available ? String(report.ownerCount.data?.count) : <span className="na">לא זמין</span>}</dd>
          </div>
        </dl>
        {!report.ownerCount.available && report.ownerCount.note ? (
          <p className="source"><span aria-hidden="true">◆</span> {report.ownerCount.note}</p>
        ) : null}
      </section>

      <section className="card" aria-labelledby="recall-h">
        <h2 id="recall-h">ריקולים וקריאות בטיחות</h2>
        {report.recalls.available ? (
          <div className={`status ${report.recalls.data && report.recalls.data.open > 0 ? "expired" : "ok"}`}>
            {report.recalls.data && report.recalls.data.open > 0 ? <WarnIcon /> : <CheckIcon />}
            <span>
              {report.recalls.data && report.recalls.data.open > 0
                ? `${report.recalls.data.open} ריקולים פתוחים`
                : "אין ריקול פתוח ידוע"}
            </span>
          </div>
        ) : (
          <p className="na">לא זמין — {report.recalls.note}</p>
        )}
      </section>
    </>
  );
}
