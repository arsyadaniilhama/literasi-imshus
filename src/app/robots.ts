import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// ============================================================
// robots.txt — kontrol crawling Google & mesin pencari lain
// ============================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
