import { describe, it, expect } from "vitest";
import { mapRecord, computeValidity, fetchVehicle, GovDataError } from "../govData/adapter";

// A real record shape sampled from the live data.gov.il core resource.
const FIXTURE = {
  mispar_rechev: 1234567,
  tozeret_nm: "מאזדה יפן",
  kinuy_mishari: "מאזדה 3",
  degem_nm: "BM",
  ramat_gimur: "PREMIUM",
  shnat_yitzur: 2019,
  tzeva_rechev: "כסוף מטאלי",
  sug_delek_nm: "בנזין",
  degem_manoa: "PE",
  kvutzat_zihum: 7,
  zmig_kidmi: "205/60R16",
  zmig_ahori: "205/60R16",
  baalut: "פרטי",
  misgeret: "JMZBM1234567",
  moed_aliya_lakvish: "2019-03",
  mivchan_acharon_dt: "2025-11-01",
  tokef_dt: "2026-11-14",
};

describe("mapRecord", () => {
  const r = mapRecord("1234567", FIXTURE);

  it("maps identity fields", () => {
    expect(r.found).toBe(true);
    expect(r.manufacturer).toBe("מאזדה יפן");
    expect(r.model).toBe("מאזדה 3");
    expect(r.year).toBe("2019");
    expect(r.fuel).toBe("בנזין");
    expect(r.ownershipType).toBe("פרטי");
  });

  it("includes VIN in details", () => {
    expect(r.details.some((d) => d.value === "JMZBM1234567")).toBe(true);
  });

  it("marks owner-count and recalls as unavailable (never invents data)", () => {
    expect(r.ownerCount.available).toBe(false);
    expect(r.recalls.available).toBe(false);
  });

  it("omits missing fields instead of showing null", () => {
    const sparse = mapRecord("1234567", { mispar_rechev: 1234567, tokef_dt: null as unknown as string });
    expect(sparse.manufacturer).toBeUndefined();
    expect(sparse.details.length).toBe(0);
  });
});

describe("computeValidity", () => {
  const now = new Date("2026-07-08");
  it("flags valid licences", () => {
    expect(computeValidity("2026-12-18", "רישוי", now).level).toBe("ok");
  });
  it("flags soon-to-expire (<=45d)", () => {
    expect(computeValidity("2026-08-01", "רישוי", now).level).toBe("soon");
  });
  it("flags expired", () => {
    expect(computeValidity("2026-01-01", "רישוי", now).level).toBe("expired");
  });
  it("handles missing dates", () => {
    expect(computeValidity(undefined, "רישוי", now).level).toBe("unknown");
  });
});

describe("fetchVehicle", () => {
  const okResponse = (records: unknown[]) => ({
    ok: true,
    status: 200,
    json: async () => ({ result: { records } }),
  });

  it("returns a mapped report on match", async () => {
    const r = await fetchVehicle("1234567", async () => okResponse([FIXTURE]));
    expect(r.found).toBe(true);
    expect(r.model).toBe("מאזדה 3");
  });

  it("returns not-found when no record matches", async () => {
    const r = await fetchVehicle("9999999", async () => okResponse([]));
    expect(r.found).toBe(false);
  });

  it("throws GovDataError on HTTP error", async () => {
    await expect(
      fetchVehicle("1234567", async () => ({ ok: false, status: 500, json: async () => ({}) })),
    ).rejects.toBeInstanceOf(GovDataError);
  });

  it("throws GovDataError on network failure", async () => {
    await expect(
      fetchVehicle("1234567", async () => { throw new Error("network down"); }),
    ).rejects.toBeInstanceOf(GovDataError);
  });
});
