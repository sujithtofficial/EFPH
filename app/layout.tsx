import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CHURCH } from "@/lib/church";
import { IS_PREVIEW, SITE_URL, pageMetadata } from "@/lib/seo";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  ...pageMetadata("/", CHURCH.name, CHURCH.description),
  metadataBase: new URL(SITE_URL),
  title: { default: `${CHURCH.name} | ${CHURCH.tagline}`, template: `%s | ${CHURCH.shortName}` },
  applicationName: CHURCH.shortName,
  robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
  icons: { icon: "/images/logo.jpg", apple: "/images/logo.jpg" },
};

const churchSchema = {
  "@context": "https://schema.org", "@type": "Church", "@id": `${SITE_URL}/#church`,
  name: CHURCH.name, url: SITE_URL, description: CHURCH.description,
  image: `${SITE_URL}/images/home/hero.jpg`, logo: `${SITE_URL}/images/logo.jpg`,
  telephone: CHURCH.phone, email: CHURCH.email,
  address: { "@type": "PostalAddress", streetAddress: "41,42 1st Main Road, 8th Cross, Ramakrishna Reddy Layout, B Narayanapura, Mahadevapura", addressLocality: "Bengaluru", addressRegion: "Karnataka", postalCode: "560048", addressCountry: "IN" },
  sameAs: Object.values(CHURCH.social),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="antialiased min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 pt-20">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(churchSchema).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
