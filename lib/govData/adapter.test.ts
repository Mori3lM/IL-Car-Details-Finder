import { describe, it, expect } from "vitest";
import {
  computeValidity,
  fetchVehicle,
  GovDataError,
  mapRecord,
  type FetchLike,
} from "./adapter";

// A realistic core-registry record (fixture — no network).
const RECORD = {
  mispar_rechev: 12345678,
  tozeret_nm: "טויוטה",
  kinuy_mishari: "COROLLA",
  degem_nm: "ZRE21",
  ramat_gimur: "LUXURY",
  shnat_yitzur: 2020,
  tzeva_rechev: "לבן",
  sug_delek_nm: "בנזין",
  degem_manoa: "2ZR",
  kvutzat_zihum: 3,
  zmig_kidmi: "205/55R16",
  zmig_ahori: "205/55R16",
  baalut: "פרטי",
  misgeret: "JTDBR32E320012345",
  moed_aliya_lakvish: "2020-03-15",
  mivchan_acharon_dt: "2025-11-14",
  tokef_dt: "2026-11-14",
};

const NOW = new Date("2026-07-08T00:00:00");

const fetchOk =
  (payload: unknown): FetchLike =>
  async () => ({ ok: true, status: 200, json: async () => payload });
const fetchStatus =
  (status: number): FetchLike =>
  async () => ({ ok: false, status, json: async () => ({}) });
const fetchThrows = (): FetchLike => async () => {
  throw new Error("network down");
};
const fetchBadJson = (): FetchLike => async () => ({
  ok: true,
  status: 200,
  json: async () => {
    throw new Error("invalid json");
  },
});

describe("mapRecord", () => {
  it("maps a full record to a typed report with Hebrew labels", () => {
    const r = mapRecord("12345678", RECORD, NOW);
    expect(r.plate).toBe("12345678");
    expect(r.manufacturer).toBe("טויוטה");
    expect(r.model).toBe("COROLLA");
    expect(r.trim).toBe("LUXURY");
    expect(r.year).toBe("2020");
    expect(r.color).toBe("לבן");
    expect(r.fuel).toBe("בנזין");
    expect(r.ownershipType).toBe("פרטי");
    expect(r.lastTestDate).toBe("2025-11-14");
    expect(r.details.map((d) => d.label)).toContain("מספר שלדה (VIN)");
    expect(r.details.find((d) => d.label === "מספר שלדה (VIN)")?.value).toBe(
      "JTDBR32E320012345",
    );
    expect(r.sources).toHaveLength(1);
  });

  it("never invents owner count or recalls — both are unavailable", () => {
    const r = mapRecord("12345678", RECORD, NOW);
    expect(r.ownerCount.available).toBe(false);
    expect(r.ownerCount.note).toBeTruthy();
    expect(r.recalls.available).toBe(false);
    expect(r.recalls.note).toBeTruthy();
  });

  it("omits missing fields instead of guessing", () => {
    const r = mapRecord("12345678", { mispar_rechev: 12345678 }, NOW);
    expect(r.manufacturer).toBeUndefined();
    expect(r.model).toBeUndefined();
    expect(r.details).toHaveLength(0);
    expect(r.licence.level).toBe("unknown"); // no tokef_dt
  });
});

describe("computeValidity", () => {
  it("reports OK when far from expiry", () => {
    const v = computeValidity("2026-11-14", "רישוי", NOW);
    expect(v.level).toBe("ok");
    expect(v.daysRemaining).toBeGreaterThan(45);
    expect(v.date).toBe("2026-11-14");
  });

  it("reports SOON when within 45 days", () => {
    const v = computeValidity("2026-08-01", "רישוי", NOW);
    expect(v.level).toBe("soon");
    expect(v.daysRemaining).toBeGreaterThanOrEqual(0);
    expect(v.daysRemaining).toBeLessThanOrEqual(45);
  });

  it("reports EXPIRED when past", () => {
    const v = computeValidity("2026-01-01", "רישוי", NOW);
    expect(v.level).toBe("expired");
    expect(v.daysRemaining).toBeLessThan(0);
  });

  it("reports UNKNOWN for missing or invalid dates", () => {
    expect(computeValidity(undefined, "רישוי", NOW).level).toBe("unknown");
    expect(computeValidity("not-a-date", "רישוי", NOW).level).toBe("unknown");
  });
});

describe("fetchVehicle", () => {
  it("returns the exact-match record when several are returned", async () => {
    const payload = {
      result: { records: [{ mispar_rechev: 99 }, RECORD, { mispar_rechev: 77 }] },
    };
    const r = await fetchVehicle("12345678", fetchOk(payload), NOW);
    expect(r).not.toBeNull();
    expect(r?.manufacturer).toBe("טויוטה");
  });

  it("returns null when no record exactly matches the plate", async () => {
    const payload = { result: { records: [{ mispar_rechev: 99 }] } };
    expect(await fetchVehicle("12345678", fetchOk(payload), NOW)).toBeNull();
  });

  it("returns null when the registry has no records", async () => {
    const payload = { result: { records: [] } };
    expect(await fetchVehicle("12345678", fetchOk(payload), NOW)).toBeNull();
  });

  it("throws GovDataError on a network failure", async () => {
    await expect(fetchVehicle("12345678", fetchThrows(), NOW)).rejects.toBeInstanceOf(
      GovDataError,
    );
  });

  it("throws GovDataError on a non-200 upstream status", async () => {
    await expect(
      fetchVehicle("12345678", fetchStatus(503), NOW),
    ).rejects.toBeInstanceOf(GovDataError);
  });

  it("throws GovDataError on an invalid JSON body", async () => {
    await expect(fetchVehicle("12345678", fetchBadJson(), NOW)).rejects.toBeInstanceOf(
      GovDataError,
    );
  });

  it("does not leak internals in the user-facing message", async () => {
    try {
      await fetchVehicle("12345678", fetchStatus(500), NOW);
      throw new Error("expected to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(GovDataError);
      expect((e as GovDataError).message).not.toContain("500");
      expect((e as GovDataError).detail).toContain("500"); // detail is server-side only
    }
  });
});
