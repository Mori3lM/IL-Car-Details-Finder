import { describe, it, expect } from "vitest";
import { normalizePlate, formatPlate, looksLikeVin } from "../plate";

describe("normalizePlate", () => {
  it("strips dashes and spaces", () => {
    expect(normalizePlate("12-345-67").value).toBe("1234567");
    expect(normalizePlate(" 123 45 678 ").value).toBe("12345678");
  });
  it("rejects empty", () => {
    const r = normalizePlate("");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/להזין/);
  });
  it("rejects too short / too long", () => {
    expect(normalizePlate("123").ok).toBe(false);
    expect(normalizePlate("123456789").ok).toBe(false);
  });
  it("accepts 5–8 digits", () => {
    expect(normalizePlate("12345").ok).toBe(true);
    expect(normalizePlate("12345678").ok).toBe(true);
  });
});

describe("formatPlate", () => {
  it("groups 8 digits", () => expect(formatPlate("12345678")).toBe("123-45-678"));
  it("groups 7 digits", () => expect(formatPlate("1234567")).toBe("12-345-67"));
});

describe("looksLikeVin", () => {
  it("detects alphanumeric VINs", () => expect(looksLikeVin("WDB4632021X203975")).toBe(true));
  it("rejects pure digits", () => expect(looksLikeVin("1234567")).toBe(false));
});
