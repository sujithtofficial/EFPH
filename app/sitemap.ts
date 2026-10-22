import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/ministries", "/events", "/live", "/gallery", "/contact", "/give", "/privacy-policy", "/terms"].map((path) => ({ url: `${SITE_URL}${path || "/"}` }));
}
