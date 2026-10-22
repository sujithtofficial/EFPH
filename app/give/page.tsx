"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Shield, CreditCard } from "lucide-react";
import { PURPOSES } from "@/lib/validation";
import { loadRazorpay, type PaymentResponse } from "@/lib/razorpay-checkout";

type State = "idle" | "loading" | "error" | "review";

export default function GivePage() {
  const [purpose, setPurpose] = useState<string>(PURPOSES[0]);
  const [amountINR, setAmountINR] = useState<number | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errMsg, setErrMsg] = useState("");
  const busy = useRef(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setState("loading"); setErrMsg("");
    const fail = (message: string) => { busy.current = false; setState("error"); setErrMsg(message); };
    let verifying = false;
    try {
      await loadRazorpay();
      const res = await fetch("/api/razorpay", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountINR), purpose, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      if (!window.Razorpay || !data.keyId) throw new Error("Online giving is currently unavailable. Please contact us.");
      const checkout = new window.Razorpay({
        key: data.keyId, order_id: data.orderId, amount: data.amount, currency: "INR",
        name: "Ebenezer Ministries", description: purpose, prefill: { name, email }, theme: { color: "#9a7540" },
        handler: async (response: PaymentResponse) => {
          verifying = true;
          try {
            const verify = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
            const result = await verify.json();
            if (!verify.ok) throw new Error(result.error || "Unable to confirm payment");
            router.push(`/give/thank-you?receipt=${result.receiptSent ? "sent" : "pending"}`);
          } catch {
            // The gateway may already have charged the donor. Do not invite a
            // second payment when verification is interrupted or capture pending.
            setErrMsg(`We could not confirm your payment status. Please contact us before giving again. Your payment reference is ${response.razorpay_payment_id}.`);
            setState("review");
          }
        },
        modal: { ondismiss: () => { if (!verifying) { busy.current = false; setState("idle"); } } },
      });
      checkout.on("payment.failed", () => fail("Payment failed. Please try again."));
      checkout.open();
    } catch (error) { fail(error instanceof Error ? error.message : "Something went wrong."); }
  };

  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-80 flex items-end pb-12 overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#1a1a0e] to-[#2a1f0a]">
        {/* Warm gold decorative accents */}
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #c9a96e 0%, transparent 45%), radial-gradient(circle at 20% 70%, #8a6f42 0%, transparent 35%)' }} />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 w-80 h-80 border border-[#c9a96e]/10 rounded-full" />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 w-52 h-52 border border-[#c9a96e]/20 rounded-full" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="eyebrow mb-2">Give Online</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">You&apos;re Welcome to Give</h1>
        </div>
      </section>

      <section className="section-pad bg-cream-gradient">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* ── Left — Welcome message ───────────────────── */}
          <div className="flex flex-col justify-center">
            <span className="eyebrow">Give Online</span>
            <h2 className="section-title mt-3 mb-4">You&apos;re Welcome to Give</h2>
            <div className="gold-bar" />
            <p className="text-gray-600 leading-relaxed text-[15px] mb-4">
              If you feel led to support the ministry at Ebenezer Faith Prayer House, you are most welcome to give through this page.
            </p>
            <p className="text-gray-600 leading-relaxed text-[15px] mb-4">
              There is absolutely no obligation, please give freely and cheerfully, only as you feel moved to do so.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your support helps sustain Sunday services, children&apos;s ministry, prison outreach, and our missions work through Push India.
            </p>
            <div className="mt-8 card-glass p-5 max-w-sm">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-[#c9a96e] shrink-0" />
                <p className="text-gray-600 text-sm">All payments are encrypted and secure. Your details are never stored on our servers.</p>
              </div>
            </div>
            <div className="mt-4 card-glass p-5 max-w-sm">
              <p className="text-sm text-gray-500">Prefer to give in person? Offering envelopes are available at the welcome desk every Sunday.</p>
            </div>
          </div>

          {/* ── Right — Donation Form ────────────────────── */}
          <div>
            <div className="card-glass rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-[#0a0f1e] mb-6">Make a Gift</h3>

              <div className="rounded-xl border border-[#b0925e]/30 bg-[#b0925e]/5 p-5 mb-6 flex items-center gap-4">
                <CreditCard size={26} className="text-gold-dark" />
                <div><p className="font-semibold text-navy text-sm">India (₹ INR)</p><p className="text-xs text-gray-500 mt-1">UPI · Cards · Net Banking</p></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={state === "loading"}>
                <fieldset disabled={state === "loading"} className="space-y-5">
                {/* Amount */}
                <div>
                  <label htmlFor="gift-amount" className="block text-sm font-medium text-[#0a0f1e] mb-2">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    id="gift-amount"
                    name="amount"
                    min={1}
                    max={500000}
                    step="0.01"
                    inputMode="decimal"
                    required
                    placeholder="Enter amount in ₹"
                    value={amountINR}
                    onChange={(e) => setAmountINR(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e] bg-white/80"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label htmlFor="gift-purpose" className="block text-sm font-medium text-[#0f172a] mb-1">Purpose</label>
                  <select id="gift-purpose" name="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e] bg-white/80">
                    {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                {/* Donor Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gift-name" className="block text-sm font-medium text-[#0f172a] mb-1">Name *</label>
                    <input id="gift-name" name="name" autoComplete="name" maxLength={100} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]" />
                  </div>
                  <div>
                    <label htmlFor="gift-email" className="block text-sm font-medium text-[#0f172a] mb-1">Email *</label>
                    <input id="gift-email" name="email" autoComplete="email" maxLength={254} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For receipt" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]" />
                  </div>
                </div>

                {errMsg && <p role="alert" className="text-red-700 text-sm leading-relaxed">{errMsg}</p>}

                <button
                  type="submit"
                  disabled={state === "loading" || state === "review" || !amountINR}
                  className="btn-gold w-full justify-center text-base py-4 disabled:opacity-60"
                >
                  {state === "loading" ? "Processing…" : (<><Heart size={18} /> Proceed to Give</>)}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  <Shield size={12} className="inline mr-1" />
                  Secured by Razorpay. Your payment info is never stored on our servers.
                </p>
                </fieldset>
              </form>
            </div>

            {/* Governance statement */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-500 text-xs leading-relaxed">
                Ebenezer Ministries upholds good governance principles in all our operations and maintains rigorous oversight of our financial processes and accountability to governing authorities. Please note that all contributions are final and non-refundable.
              </p>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}
