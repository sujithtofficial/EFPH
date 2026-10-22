import type { MetadataRoute } from "next";
import { IS_PREVIEW, SITE_URL } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", ...(IS_PREVIEW ? { disallow: "/" } : { allow: "/", disallow: ["/api/", "/give/thank-you"] }) }, sitemap: `${SITE_URL}/sitemap.xml` };
}
