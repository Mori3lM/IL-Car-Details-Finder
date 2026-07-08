import { describe, it, expect } from "vitest";
import { buildIcs } from "./index";

describe("buildIcs", () => {
  const ics = buildIcs(
    {
      title: "חידוש רישוי רכב 12-345-67",
      date: "2026-11-14",
      description: "תזכורת, בדיקה; עם תווים",
      daysBefore: 30,
    },
    "test-seed",
  );

  it("produces a well-formed VCALENDAR/VEVENT/VALARM with CRLF lines", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("\r\n");
  });

  it("uses an all-day DATE value and a lead-time alarm", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261114");
    expect(ics).toContain("TRIGGER:-P30D");
  });

  it("escapes commas and semicolons in text", () => {
    expect(ics).toContain("DESCRIPTION:תזכורת\\, בדיקה\\; עם תווים");
  });

  it("defaults the alarm lead time to 30 days", () => {
    const noLead = buildIcs({ title: "x", date: "2026-01-01" }, "s");
    expect(noLead).toContain("TRIGGER:-P30D");
  });
});
