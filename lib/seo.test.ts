import { describe, it, expect } from "vitest";
import { buildVehicleJsonLd, serializeJsonLd } from "./seo";
import type { VehicleReport } from "@/lib/govData/types";

const base: VehicleReport = {
  plate: "1000028",
  manufacturer: "פורשה גרמניה",
  model: "MACAN S DIESEL",
  trim: "LUXURY",
  year: "2016",
  color: "לבן",
  fuel: "דיזל",
  details: [{ label: "מספר שלדה (VIN)", value: "WP1ZZZ95ZGLB70121" }],
  licence: { label: "רישוי בתוקף", level: "ok" },
  ownerCount: { available: false },
  recalls: { available: false },
  sources: [],
  fetchedAt: "2026-07-08T00:00:00.000Z",
};

describe("buildVehicleJsonLd", () => {
  it("emits a schema.org/Vehicle with the mapped fields", () => {
    const ld = buildVehicleJsonLd(base, "https://example.com/car/1000028");
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Vehicle");
    expect(ld.name).toBe("פורשה גרמניה MACAN S DIESEL");
    expect(ld.manufacturer).toEqual({ "@type": "Organization", name: "פורשה גרמניה" });
    expect(ld.vehicleModelDate).toBe("2016");
    expect(ld.fuelType).toBe("דיזל");
    expect(ld.vehicleIdentificationNumber).toBe("WP1ZZZ95ZGLB70121");
    expect(ld.url).toBe("https://example.com/car/1000028");
  });

  it("omits fields the registry didn't provide (no invented data)", () => {
    const sparse: VehicleReport = { ...base, model: undefined, fuel: undefined, details: [] };
    const ld = buildVehicleJsonLd(sparse, "https://example.com/car/1000028");
    expect("model" in ld).toBe(false);
    expect("fuelType" in ld).toBe(false);
    expect("vehicleIdentificationNumber" in ld).toBe(false);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so untrusted text cannot break out of <script>", () => {
    const s = serializeJsonLd({ name: "</script><script>alert(1)" });
    expect(s).not.toContain("</script>");
    expect(s).toContain("\\u003c/script>");
  });
});
