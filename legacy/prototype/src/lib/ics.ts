// Client-side .ics calendar file generation — zero backend, zero cost.
// The user's own calendar app fires the reminder.

export interface IcsOptions {
  title: string;
  date: string; // ISO yyyy-mm-dd (all-day event)
  description?: string;
  daysBefore?: number; // alarm lead time
}

function toIcsDate(iso: string): string {
  return iso.replace(/-/g, ""); // yyyymmdd for DATE value type
}

function escapeText(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Build a valid VCALENDAR string with a VALARM `daysBefore` the date. */
export function buildIcs(opts: IcsOptions): string {
  const { title, date, description = "", daysBefore = 30 } = opts;
  const dt = toIcsDate(date);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${dt}-${Math.random().toString(36).slice(2)}@il-car-finder`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IL Car Finder//HE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : "",
    "BEGIN:VALARM",
    `TRIGGER:-P${Math.max(0, Math.round(daysBefore))}D`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Trigger a download of the .ics in the browser. */
export function downloadIcs(opts: IcsOptions, filename = "reminder.ics"): void {
  const blob = new Blob([buildIcs(opts)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
