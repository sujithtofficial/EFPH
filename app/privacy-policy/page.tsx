import { Metadata } from "next";
import Link from "next/link";
import { CHURCH } from "@/lib/church";

export const metadata: Metadata = {
  title: `Privacy Policy | ${CHURCH.shortName}`,
  description: `Privacy policy for ${CHURCH.name}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Banner */}
      <section className="bg-[#0f172a] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <p className="text-[#b0925e] font-semibold uppercase tracking-widest text-sm mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto prose prose-gray prose-headings:text-[#0f172a] prose-a:text-[#b0925e]">
          <p className="text-sm text-gray-500">Last updated: April 2026</p>

          <h2>1. Introduction</h2>
          <p>
            {CHURCH.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy of all visitors to our website. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or make a donation.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Contact information</strong> — name, email address, and phone number when you submit a contact form or prayer request.</li>
            <li><strong>Donation information</strong> — name, email address, and donation amount when you give online. Payment card details are processed directly by our payment partners (Razorpay and Stripe) and are never stored on our servers.</li>
            <li><strong>Usage data</strong> — anonymised analytics data such as pages visited, browser type, and device information, collected to improve the website experience.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your enquiries and prayer requests.</li>
            <li>To send donation receipts and confirmation emails.</li>
            <li>To improve and maintain the website.</li>
            <li>To comply with legal and regulatory requirements.</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers (payment gateways, email services) solely to fulfil the purposes described above, and only under strict confidentiality agreements.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data. All donation transactions are encrypted using industry-standard SSL/TLS protocols. Payment information is handled exclusively by PCI-DSS compliant processors.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Our website may use essential cookies to ensure proper functionality. We do not use third-party tracking or advertising cookies.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to your personal data.</li>
            <li>Request correction or deletion of your personal data.</li>
            <li>Withdraw consent for communications at any time.</li>
          </ul>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
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
