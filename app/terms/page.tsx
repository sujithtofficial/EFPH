import { Metadata } from "next";
import Link from "next/link";
import { CHURCH } from "@/lib/church";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${CHURCH.shortName}`,
  description: `Terms and conditions for ${CHURCH.name}.`,
};

export default function TermsPage() {
  return (
    <>
      {/* Banner */}
      <section className="bg-[#0f172a] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <p className="text-[#b0925e] font-semibold uppercase tracking-widest text-sm mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Terms &amp; Conditions</h1>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto prose prose-gray prose-headings:text-[#0f172a] prose-a:text-[#b0925e]">
          <p className="text-sm text-gray-500">Last updated: April 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the {CHURCH.shortName} website, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use this website.
          </p>

          <h2>2. Use of the Website</h2>
          <p>
            This website is provided for informational purposes about {CHURCH.name} and its ministries. You agree to use the website only for lawful purposes and in a manner that does not infringe the rights of others.
          </p>

          <h2>3. Donations</h2>
          <p>
            All donations made through this website are voluntary and given freely to support the ministry of {CHURCH.shortName}. By completing a donation, you acknowledge the following:
          </p>
          <ul>
            <li><strong>Non-refundable</strong> — All contributions are final and non-refundable. There is a strict no-refund policy in place.</li>
            <li><strong>Governance</strong> — {CHURCH.shortName} upholds good governance principles in all operations and maintains rigorous oversight of financial processes and accountability to governing authorities.</li>
            <li><strong>Processing</strong> — Donations in Indian Rupees (₹) are processed by Razorpay. International donations in US Dollars ($) are processed by Stripe.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, videos, logos, and design — is the property of {CHURCH.name} unless otherwise stated. You may not reproduce, distribute, or use any content without prior written permission.
          </p>

          <h2>5. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (e.g. YouTube, payment gateways, social media). We are not responsible for the content, privacy practices, or terms of those external sites.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            {CHURCH.shortName} provides this website on an &quot;as is&quot; basis. We make no warranties regarding the accuracy, completeness, or reliability of the content. We shall not be liable for any loss or damage arising from the use of this website.
          </p>

          <h2>7. Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. Continued use of the website after changes constitutes acceptance of the revised terms.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            For any questions regarding these terms, please contact us at{" "}
            <a href={`mailto:${CHURCH.email}`}>{CHURCH.email}</a> or call{" "}
            <a href={`tel:${CHURCH.phone.replace(/\s/g, "")}`}>{CHURCH.phone}</a>.
          </p>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link href="/" className="text-sm text-[#b0925e] hover:underline">← Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}
