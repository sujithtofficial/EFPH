import Link from "next/link";
import { CheckCircle, Heart, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Thank You!</h1>
        <p className="text-gray-600 leading-relaxed mb-2">
          Your gift has been received. A confirmation receipt has been sent to your email address.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          "God is not unjust; he will not forget your work and the love you have shown him." — Hebrews 6:10
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/give" className="btn-gold">
            <Heart size={16} /> Give Again
          </Link>
          <Link href="/" className="btn-outline">
            Back to Home <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
