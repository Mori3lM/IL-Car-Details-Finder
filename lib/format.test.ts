import { describe, it, expect } from "vitest";
import { formatIsoDate, formatDaysRemaining } from "./format";

describe("formatIsoDate", () => {
  it("formats an ISO date as DD.MM.YYYY", () => {
    expect(formatIsoDate("2026-11-14")).toBe("14.11.2026");
    expect(formatIsoDate("2026-11-14T00:00:00")).toBe("14.11.2026");
  });
  it("returns empty for undefined and passes through unparseable input", () => {
    expect(formatIsoDate(undefined)).toBe("");
    expect(formatIsoDate("whatever")).toBe("whatever");
  });
});

describe("formatDaysRemaining", () => {
  it("handles future, today, and past", () => {
    expect(formatDaysRemaining(132)).toBe("עוד 132 ימים");
    expect(formatDaysRemaining(1)).toBe("עוד 1 יום");
    expect(formatDaysRemaining(0)).toBe("היום");
    expect(formatDaysRemaining(-5)).toBe("לפני 5 ימים");
  });
  it("returns empty for undefined/NaN", () => {
    expect(formatDaysRemaining(undefined)).toBe("");
    expect(formatDaysRemaining(Number.NaN)).toBe("");
  });
});
