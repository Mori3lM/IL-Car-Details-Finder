import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

// Only the stable public pages. Per-car pages are dynamic (millions of plates)
// and personal pages (/my-cars) are excluded — see robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = config.siteUrl.replace(/\/$/, "");
  const routes = ["/", "/about-data", "/privacy"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
