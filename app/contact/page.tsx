"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, SendHorizonal, Navigation } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", type: "general" });
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setState("sent");
      setForm({ name: "", email: "", phone: "", message: "", type: "general" });
    } catch {
      setState("error");
      setError("Something went wrong. Please try again or email us directly.");
    }
  };

  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-80 flex items-end pb-12 overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#162040] to-[#1a3060]">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a96e 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a90d9 0%, transparent 40%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-[#c9a96e]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#c9a96e]/15 rounded-full" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="text-[#c9a96e] font-semibold uppercase tracking-widest text-sm mb-2">Reach Out</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Contact Us</h1>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* ── Info Panel ─────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-[#b0925e] font-semibold tracking-widest uppercase text-sm">We'd Love to Hear From You</span>
            <h2 className="text-3xl font-bold text-[#0f172a] mt-2 mb-6">Get in Touch</h2>
            <div className="w-16 h-1 bg-[#b0925e] mb-8" />

            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin size={22} className="text-[#b0925e] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#0f172a]">Address</p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-1">{CHURCH.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone size={22} className="text-[#b0925e] shrink-0" />
                <div>
                  <p className="font-semibold text-[#0f172a]">Phone</p>
                  <a href={`tel:${CHURCH.phone.replace(/\s/g, "")}`} className="text-gray-600 text-sm hover:text-[#b0925e] transition-colors">{CHURCH.phone}</a>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail size={22} className="text-[#b0925e] shrink-0" />
                <div>
                  <p className="font-semibold text-[#0f172a]">Email</p>
                  <a href={`mailto:${CHURCH.email}`} className="text-gray-600 text-sm hover:text-[#b0925e] transition-colors">{CHURCH.email}</a>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock size={22} className="text-[#b0925e] shrink-0" />
                <div>
                  <p className="font-semibold text-[#0f172a]">Office Hours</p>
                  <p className="text-gray-600 text-sm mt-1">{CHURCH.hours}</p>
                </div>
              </div>
            </div>

            {/* Map embed */}
            <div className="mt-8 rounded-sm overflow-hidden shadow-md h-64 border border-gray-200">
              <iframe
                src={CHURCH.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ebenezer Ministries Location"
              />
            </div>
            <a
              href={CHURCH.mapDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-[#b0925e] text-white text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-[#9a7d4e] transition-colors"
            >
              <Navigation size={16} /> Get Directions
            </a>
          </motion.div>

          {/* ── Contact Form ───────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <section id="prayer">
              <span className="text-[#b0925e] font-semibold tracking-widest uppercase text-sm">Message or Prayer Request</span>
              <h2 className="text-3xl font-bold text-[#0f172a] mt-2 mb-6">Send Us a Message</h2>
              <div className="w-16 h-1 bg-[#b0925e] mb-8" />

              {state === "sent" ? (
                <div className="bg-green-50 border border-green-200 rounded-sm p-8 text-center">
                  <p className="text-green-700 font-semibold text-lg">Thank you!</p>
                  <p className="text-green-600 text-sm mt-2">Your message has been received. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-1">Request Type</label>
                    <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e] bg-white">
                      <option value="general">General Enquiry</option>
                      <option value="prayer">Prayer Request</option>
                      <option value="visit">Plan a Visit</option>
                      <option value="counselling">Counselling Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-1">Full Name *</label>
                      <input required name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-1">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-1">Email *</label>
                    <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-1">Message / Prayer Request *</label>
                    <textarea required name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Share your message or prayer request here…" className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e] resize-none" />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="btn-gold w-full justify-center disabled:opacity-60"
                  >
                    {state === "sending" ? "Sending…" : (<><SendHorizonal size={18} /> Send Message</>)}
                  </button>
                </form>
              )}
            </section>
          </motion.div>
        </div>
      </section>
    </>
  );
}
