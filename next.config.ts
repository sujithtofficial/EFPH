import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
  "form-action 'self' https://api.razorpay.com https://checkout.razorpay.com",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https://i.ytimg.com https://*.razorpay.com",
  "font-src 'self'", "media-src 'self'", "worker-src 'self' blob:",
  `connect-src 'self' ${isDev ? "ws: wss:" : ""} https://*.razorpay.com https://*.razorpay.in`,
  "frame-src https://www.youtube-nocookie.com https://www.google.com https://*.razorpay.com https://*.razorpay.in",
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/webp"], remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**", search: "" }] },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")' },
      ] },
      { source: "/:folder(images|videos)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};
export default config;
