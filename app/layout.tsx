import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { CHURCH } from "@/lib/church";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${CHURCH.name} | ${CHURCH.tagline}`,
    template: `%s | ${CHURCH.shortName}`,
  },
  description: CHURCH.description,
  keywords: ["church", "Bengaluru", "EFPH", "Ebenezer Ministries", "Ebenezer", "prayer", "worship", "faith"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: CHURCH.website,
    siteName: CHURCH.name,
    title: CHURCH.name,
    description: CHURCH.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="antialiased min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: "var(--font-poppins)" },
            success: { iconTheme: { primary: "#b0925e", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
