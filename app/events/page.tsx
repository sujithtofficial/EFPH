"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const EVENTS = [
  {
    category: "Weekly",
    title: "Sunday Service — Tamil & Kannada",
    date: "Every Sunday",
    time: "7:15 AM",
    venue: "Ebenezer Ministries, Bengaluru",
    desc: "Morning worship service led by Pastor Joy John Samuel in Tamil and Kannada. All are welcome.",
    image: "/images/christmas/IMG_1504.jpg",
    imagePosition: "top" as const,
  },
  {
    category: "Weekly",
    title: "Sunday Service — English & Hindi",
    date: "Every Sunday",
    time: "11:00 AM",
    venue: "Ebenezer Ministries, Bengaluru",
    desc: "Late morning worship service led by Sister Simi Joy in English and Hindi. All are welcome.",
    image: "/images/newyear/DSC01196.jpg",
  },
  {
    category: "Monthly",
    title: "Youth Meeting",
    date: "Every Last Saturday",
    time: "6:30 PM",
    venue: "Ebenezer Ministries",
    desc: "A vibrant gathering for young people to worship, connect, and grow together in Christ.",
    image: ASSETS.ministries.youth,
  },
  {
    category: "Monthly",
    title: "Praise Fest",
    date: "Every 3rd Friday",
    time: "6:30 PM",
    venue: "Ebenezer Ministries",
    desc: "An evening of uninhibited, Spirit-filled worship — celebrating Jesus through song, dance, and testimony.",
    image: ASSETS.giveBanner,
  },
  {
    category: "Monthly",
    title: "Night Prayer",
    date: "Every 2nd Friday",
    time: "10:30 PM – 4:00 AM",
    venue: "Ebenezer Ministries",
    desc: "An all-night prayer vigil — seeking the face of God through worship, intercession, and the Word.",
    image: ASSETS.ministries.prayer,
  },
  {
    category: "Annual",
    title: "21 Day Fasting Prayer",
    date: "Last week of September – 2nd Sunday of October",
    time: "Morning: 11:30 AM – 1:30 PM | Evening: 6:00 PM – 8:30 PM",
    venue: "Ebenezer Ministries",
    desc: "Our flagship corporate fast. The entire church comes together for 21 days of prayer, fasting, worship, and the Word. Expect breakthrough.",
    image: ASSETS.ministries.evangelism,
  },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function EventsPage() {
  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-96 flex items-end pb-12 overflow-hidden">
        <Image src={ASSETS.eventBanner} alt="Events" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-[#0f172a]/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="text-[#b0925e] font-semibold uppercase tracking-widest text-sm mb-2">What's Happening</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Events</h1>
        </div>
      </section>

      {/* ── Event Cards ────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENTS.map((ev, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <Image src={ev.image} alt={ev.title} fill className={`object-cover hover:scale-105 transition-transform duration-500 ${'imagePosition' in ev ? 'object-top' : ''}`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  <span className="absolute top-3 left-3 bg-[#b0925e] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    {ev.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-[#0f172a] font-bold text-lg mb-3">{ev.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} className="text-[#b0925e] shrink-0" />{ev.date}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} className="text-[#b0925e] shrink-0" />{ev.time}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={14} className="text-[#b0925e] shrink-0" />{ev.venue}</div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{ev.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stay Updated CTA ───────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-[#faf8f5] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4">Stay Updated</h2>
          <p className="text-gray-500 mb-8">Follow us on Facebook and Instagram for the latest event announcements and service highlights.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="https://www.facebook.com/EFPHChurchBangalore/" target="_blank" rel="noopener noreferrer" className="btn-gold">Facebook <ArrowRight size={16} /></Link>
            <Link href="https://instagram.com/efphchurch" target="_blank" rel="noopener noreferrer" className="btn-outline">Instagram <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
