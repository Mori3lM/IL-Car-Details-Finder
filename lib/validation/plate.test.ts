import { describe, it, expect } from "vitest";
import { parsePlate, formatPlate } from "./plate";

describe("parsePlate", () => {
  it("accepts 5–8 digit plates", () => {
    expect(parsePlate("12345")).toEqual({ ok: true, value: "12345" });
    expect(parsePlate("12345678")).toEqual({ ok: true, value: "12345678" });
  });

  it("strips separators and whitespace", () => {
    expect(parsePlate("12-345-67").value).toBe("1234567");
    expect(parsePlate(" 123 45 678 ").value).toBe("12345678");
  });

  it("keeps only digits from mixed input", () => {
    expect(parsePlate("12a34b5")).toEqual({ ok: true, value: "12345" });
  });

  it("rejects an empty input with a prompt to enter a plate", () => {
    const r = parsePlate("");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("להזין");
  });

  it("rejects letters-only input as empty", () => {
    expect(parsePlate("abcd").ok).toBe(false);
  });

  it("rejects too-short and too-long numbers", () => {
    expect(parsePlate("123").ok).toBe(false);
    expect(parsePlate("123").error).toContain("5 עד 8");
    expect(parsePlate("123456789").ok).toBe(false);
  });

  it("handles non-string input safely", () => {
    expect(parsePlate(undefined).ok).toBe(false);
    expect(parsePlate(12345 as unknown).ok).toBe(false);
  });
});

describe("formatPlate", () => {
  it("groups 8-digit plates", () => {
    expect(formatPlate("12345678")).toBe("123-45-678");
  });
  it("groups 7-digit plates", () => {
    expect(formatPlate("1234567")).toBe("12-345-67");
  });
  it("leaves shorter plates ungrouped", () => {
    expect(formatPlate("12345")).toBe("12345");
  });
});
