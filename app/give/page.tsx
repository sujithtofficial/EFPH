"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Shield, Globe, CreditCard, ArrowRight, CheckCircle } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";

type Gateway = "razorpay" | "stripe";
type State = "idle" | "loading" | "error";

const PURPOSES = [
  "Tithes & Offerings",
  "General Offering",
  "Building Fund",
  "Missions & Outreach",
  "Children's Ministry",
  "Prison Ministry",
  "Other",
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function GivePage() {
  const [gateway, setGateway] = useState<Gateway>("razorpay");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [amountINR, setAmountINR] = useState<number | "">("");
  const [amountUSD, setAmountUSD] = useState<number | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleRazorpay = async () => {
    setState("loading");
    setErrMsg("");
    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) { setErrMsg("Could not load payment gateway. Please try again."); setState("error"); return; }

    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountINR), purpose, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.orderId,
        amount: data.amount,
        currency: "INR",
        name: "Ebenezer Ministries",
        description: purpose,
        prefill: { name, email },
        theme: { color: "#b0925e" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, purpose, name, email, amount: Number(amountINR) }),
          });
          if (verify.ok) {
            window.location.href = "/give/thank-you";
          } else {
            setErrMsg("Payment verified but confirmation failed. Please contact us.");
            setState("error");
          }
        },
        modal: { ondismiss: () => setState("idle") },
      });
      rzp.on("payment.failed", () => { setErrMsg("Payment failed. Please try again."); setState("error"); });
      rzp.open();
      setState("idle");
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  };

  const handleStripe = async () => {
    setState("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountUSD), purpose, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout creation failed");
      window.location.href = data.url;
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateway === "razorpay") handleRazorpay();
    else handleStripe();
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
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col justify-center">
            <span className="eyebrow">Give Online</span>
            <h2 className="section-title mt-3 mb-4">You're Welcome to Give</h2>
            <div className="gold-bar" />
            <p className="text-gray-600 leading-relaxed text-[15px] mb-4">
              If you feel led to support the ministry at Ebenezer Faith Prayer House, you are most welcome to give through this page.
            </p>
            <p className="text-gray-600 leading-relaxed text-[15px] mb-4">
              There is absolutely no obligation, please give freely and cheerfully, only as you feel moved to do so.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your support helps sustain Sunday services, children's ministry, prison outreach, and our missions work through Push India.
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
          </motion.div>

          {/* ── Right — Donation Form ────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="card-glass rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-[#0a0f1e] mb-6">Make a Gift</h3>

              {/* Gateway Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setGateway("razorpay")}
                  className={`flex flex-col items-center gap-1 border-2 rounded-sm py-3 px-4 text-sm font-semibold transition-colors ${gateway === "razorpay" ? "border-[#c9a96e] bg-[#c9a96e]/5 text-[#c9a96e]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <CreditCard size={20} />
                  India (₹ INR)
                  <span className="text-xs font-normal opacity-70">UPI · Cards · Net Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateway("stripe")}
                  className={`flex flex-col items-center gap-1 border-2 rounded-sm py-3 px-4 text-sm font-semibold transition-colors ${gateway === "stripe" ? "border-[#c9a96e] bg-[#c9a96e]/5 text-[#c9a96e]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Globe size={20} />
                  International ($ USD)
                  <span className="text-xs font-normal opacity-70">Cards · Apple/Google Pay</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-[#0a0f1e] mb-2">
                    {gateway === "razorpay" ? "Amount (₹ INR)" : "Amount ($ USD)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder={gateway === "razorpay" ? "Enter amount in ₹" : "Enter amount in $"}
                    value={gateway === "razorpay" ? amountINR : amountUSD}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      if (gateway === "razorpay") setAmountINR(val);
                      else setAmountUSD(val);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e] bg-white/80"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1">Purpose</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e] bg-white/80">
                    {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                {/* Donor Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-1">Name *</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-1">Email *</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For receipt" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]" />
                  </div>
                </div>

                {errMsg && <p className="text-red-600 text-sm">{errMsg}</p>}

                <button
                  type="submit"
                  disabled={state === "loading" || (!amountINR && gateway === "razorpay") || (!amountUSD && gateway === "stripe")}
                  className="btn-gold w-full justify-center text-base py-4 disabled:opacity-60"
                >
                  {state === "loading" ? "Processing…" : (<><Heart size={18} /> Proceed to Give</>)}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  <Shield size={12} className="inline mr-1" />
                  Secured by {gateway === "razorpay" ? "Razorpay" : "Stripe"}. Your payment info is never stored on our servers.
                </p>
              </form>
            </div>

            {/* Governance statement */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-500 text-xs leading-relaxed">
                Ebenezer Ministries upholds good governance principles in all our operations and maintains rigorous oversight of our financial processes and accountability to governing authorities. Please note that all contributions are final and non-refundable.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


    </>
  );
}
