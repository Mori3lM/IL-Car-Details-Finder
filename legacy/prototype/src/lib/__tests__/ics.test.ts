import { describe, it, expect } from "vitest";
import { buildIcs } from "../ics";

describe("buildIcs", () => {
  const ics = buildIcs({ title: "חידוש רישוי", date: "2026-11-14", daysBefore: 30 });

  it("is a valid VCALENDAR", () => {
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
  });
  it("uses the all-day DTSTART date", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261114");
  });
  it("sets a 30-day alarm", () => {
    expect(ics).toContain("TRIGGER:-P30D");
    expect(ics).toContain("BEGIN:VALARM");
  });
  it("uses CRLF line endings", () => {
    expect(ics.includes("\r\n")).toBe(true);
  });
});
