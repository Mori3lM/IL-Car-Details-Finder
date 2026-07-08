"use client";

import { useState } from "react";
import Link from "next/link";
import { useSavedVehicles, useReminderDays } from "@/lib/useSaved";
import {
  removeVehicle,
  clearAllVehicles,
  setPrefs,
  type SavedVehicle,
} from "@/lib/storage";
import { computeValidity } from "@/lib/validity";
import { downloadIcs } from "@/lib/ics";
import { formatPlate } from "@/lib/validation/plate";
import { formatIsoDate } from "@/lib/format";
import { StatusChip } from "./StatusChip";
import { BookmarkIcon, CalendarPlusIcon, ShieldIcon } from "./Icons";

const LEAD_OPTIONS = [7, 14, 30, 45, 60, 90];

export function MyCars() {
  const saved = useSavedVehicles();
  const reminderDays = useReminderDays();
  const [announce, setAnnounce] = useState("");

  function addReminder(v: SavedVehicle) {
    if (!v.licenceExpiry) return;
    downloadIcs(
      {
        title: `חידוש רישוי רכב ${formatPlate(v.plate)}`,
        date: v.licenceExpiry,
        description: `תזכורת לחידוש רישוי הרכב ${formatPlate(v.plate)} (${v.name}).`,
        daysBefore: reminderDays,
      },
      `reminder-${v.plate}.ics`,
    );
    setAnnounce(`הורדה תזכורת יומן עבור ${v.name}.`);
  }

  function remove(v: SavedVehicle) {
    removeVehicle(v.plate);
    setAnnounce(`${v.name} הוסר מהרשימה.`);
  }

  function clearAll() {
    if (window.confirm("לנקות את כל הרכבים השמורים? הפעולה אינה הפיכה.")) {
      clearAllVehicles();
      setAnnounce("כל הרכבים נוקו מהרשימה.");
    }
  }

  if (saved.length === 0) {
    return (
      <>
        <div className="state">
          <div className="state__icon">
            <BookmarkIcon />
          </div>
          <p>
            עדיין לא שמרתם רכב. חפשו לפי מספר רישוי ולחצו ”שמור את הרכב” כדי לראות
            אותו כאן.
          </p>
          <div className="actions">
            <Link className="btn btn--primary" href="/">
              חיפוש רכב
            </Link>
          </div>
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">
          {announce}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="prefs">
        <label htmlFor="lead-time">תזכורת מראש (ימים לפני מועד חידוש הרישוי)</label>
        <select
          id="lead-time"
          className="select"
          value={reminderDays}
          onChange={(e) => {
            setPrefs({ reminderDaysBefore: Number(e.target.value) });
            setAnnounce(`התזכורת תיווצר ${e.target.value} ימים מראש.`);
          }}
        >
          {LEAD_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} ימים
            </option>
          ))}
        </select>
      </div>

      <ul className="saved-list">
        {saved.map((v) => {
          const status = computeValidity(v.licenceExpiry, "רישוי");
          return (
            <li key={v.plate} className="card saved-item">
              <div className="saved-item__main">
                <div className="saved-item__name">{v.name}</div>
                <div>
                  <span className="plate">{formatPlate(v.plate)}</span>
                </div>
                <StatusChip level={status.level} />
                {v.licenceExpiry && (
                  <p className="info-line">
                    רישוי בתוקף עד <strong>{formatIsoDate(v.licenceExpiry)}</strong>
                  </p>
                )}
              </div>
              <div className="saved-item__actions">
                <Link className="btn" href={`/car/${v.plate}`}>
                  פרטים
                </Link>
                <button
                  type="button"
                  className="btn"
                  onClick={() => addReminder(v)}
                  disabled={!v.licenceExpiry}
                >
                  <CalendarPlusIcon />
                  <span>תזכורת</span>
                </button>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => remove(v)}
                >
                  הסר
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button type="button" className="link-btn" onClick={clearAll}>
          נקה את כל הרשימה
        </button>
      </div>

      <p className="note">
        <ShieldIcon />
        <span>הרשימה נשמרת בדפדפן זה בלבד — שום דבר לא נשלח לשרת.</span>
      </p>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
    </>
  );
}
