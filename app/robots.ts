import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = config.siteUrl.replace(/\/$/, "");
  return {
    // /my-cars is a personal, localStorage-only page with no crawl value.
    // /api is data plumbing. Everything else (incl. /car/*) is crawlable.
    rules: { userAgent: "*", allow: "/", disallow: ["/my-cars", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
