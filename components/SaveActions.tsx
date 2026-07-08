"use client";

import { useState } from "react";
import { saveVehicle, removeVehicle, getPrefs } from "@/lib/storage";
import type { SavedVehicle } from "@/lib/storage";
import { useIsSaved } from "@/lib/useSaved";
import { downloadIcs } from "@/lib/ics";
import { formatPlate } from "@/lib/validation/plate";
import {
  BookmarkIcon,
  CalendarPlusIcon,
  CheckIcon,
  InfoIcon,
  ShieldIcon,
} from "./Icons";

interface SaveActionsProps {
  plate: string;
  name: string;
  licenceExpiry?: string; // ISO date (tokef_dt)
  licenceLevel?: SavedVehicle["licenceLevel"];
}

/**
 * The result page's CTA: save the car (localStorage) + download an .ics reminder.
 * Everything is device-local — nothing is sent to the server. Save state is read
 * in an effect (after hydration) to avoid a server/client mismatch.
 */
export function SaveActions({
  plate,
  name,
  licenceExpiry,
  licenceLevel,
}: SaveActionsProps) {
  // Saved state comes from the external store (localStorage) — reactive, and with
  // a stable server snapshot so there's no hydration mismatch.
  const saved = useIsSaved(plate);
  const [announce, setAnnounce] = useState("");

  function toggleSave() {
    if (saved) {
      removeVehicle(plate);
      setAnnounce("הרכב הוסר מהרשימה שלך.");
    } else {
      saveVehicle({
        plate,
        name,
        licenceExpiry,
        licenceLevel,
        savedAt: new Date().toISOString(),
      });
      setAnnounce("הרכב נשמר ברשימה שלך (מקומית בדפדפן).");
    }
  }

  function addReminder() {
    if (!licenceExpiry) return;
    const prefs = getPrefs();
    downloadIcs(
      {
        title: `חידוש רישוי רכב ${formatPlate(plate)}`,
        date: licenceExpiry,
        description: `תזכורת לחידוש רישוי הרכב ${formatPlate(plate)} (${name}).`,
        daysBefore: prefs.reminderDaysBefore,
      },
      `reminder-${plate}.ics`,
    );
    setAnnounce(
      `הורד קובץ יומן לתזכורת חידוש הרישוי, ${prefs.reminderDaysBefore} ימים מראש.`,
    );
  }

  return (
    <>
      <div className="actions">
        <button
          type="button"
          className={`btn ${saved ? "btn--saved" : "btn--primary"}`}
          onClick={toggleSave}
          aria-pressed={saved}
        >
          {saved ? <CheckIcon /> : <BookmarkIcon />}
          <span>{saved ? "נשמר — הסר מהרשימה" : "שמור את הרכב"}</span>
        </button>
        <button
          type="button"
          className="btn"
          onClick={addReminder}
          disabled={!licenceExpiry}
        >
          <CalendarPlusIcon />
          <span>הוסף תזכורת ליומן</span>
        </button>
      </div>

      {!licenceExpiry && (
        <p className="note">
          <InfoIcon />
          <span>תאריך תוקף הרישוי אינו זמין, ולכן לא ניתן ליצור תזכורת.</span>
        </p>
      )}
      <p className="note">
        <ShieldIcon />
        <span>נשמר מקומית בדפדפן שלך בלבד — שום דבר לא נשלח לשרת.</span>
      </p>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
    </>
  );
}
