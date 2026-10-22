import type { Metadata } from "next";
import { CHURCH } from "./church";

export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://project-njo3j.vercel.app").origin;
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
export const SHARE_IMAGE = { url: "/images/social-card.jpg", width: 1200, height: 630, alt: CHURCH.name };

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title: path === "/" ? { absolute: `${CHURCH.name} | ${CHURCH.tagline}` } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_IN", siteName: CHURCH.name, url: path, title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
}
