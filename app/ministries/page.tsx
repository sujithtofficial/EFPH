"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const MINISTRIES = [
  {
    key: "youth",
    title: "Youth Ministry",
    desc: "Providing guidance and support to youth as they navigate through the most challenging part of their development and seek to grow in their walk with Christ.",
    verse: "Let no one despise your youth — 1 Timothy 4:12",
  },
  {
    key: "childrens",
    title: "Ebenezer Kingdom Kids",
    desc: "Instilling the love and presence of God in children and equipping the world to do the same.",
    verse: "Train up a child in the way he should go — Proverbs 22:6",
  },
  {
    key: "evangelism",
    title: "Evangelism",
    desc: "Reaching lost souls with the Gospel of Jesus Christ (Matthew 28:18-20) and sharing our Faith and God's Grace with others.",
    verse: "Go and make disciples of all nations — Matthew 28:19",
  },
  {
    key: "prayer",
    title: "Prayer & Intercession",
    desc: "Just as Jesus intercedes for us (Heb. 7:25), then we too must intercede for all mankind. Seeking restoration between Him and His fallen creation.",
    verse: "My house shall be called a house of prayer — Isaiah 56:7",
  },
  {
    key: "counselling",
    title: "Counselling",
    desc: "Guiding people, understanding their needs, and then using the Word of God to provide hope and the tools to help them handle the challenges of life in a manner pleasing to God.",
    verse: "He heals the brokenhearted — Psalm 147:3",
  },
  {
    key: "missions",
    title: "Push India",
    desc: "Visiting the various states of India and praying for the Good News of Jesus Christ to reach every village and town.",
    verse: "How beautiful are the feet of those who bring good news — Romans 10:15",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function MinistriesPage() {
  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-96 flex items-end pb-12 overflow-hidden">
        <Image src={ASSETS.ministries.evangelism} alt="Ministries" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-[#0f172a]/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="text-[#b0925e] font-semibold uppercase tracking-widest text-sm mb-2">What We Do</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Our Ministries</h1>
          <p className="text-gray-300/80 mt-3 max-w-xl text-sm">Explore our diverse ministries dedicated to serving our community and fostering spiritual growth.</p>
        </div>
      </section>

      {/* ── Ministry Grid ──────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MINISTRIES.map((m) => (
              <motion.div key={m.key} variants={fadeUp} className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={ASSETS.ministries[m.key as keyof typeof ASSETS.ministries]}
                    alt={m.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-bold text-lg">{m.title}</h3>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">{m.desc}</p>
                  <p className="text-[#b0925e] text-xs italic border-t border-gray-100 pt-4">{m.verse}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-[#0f172a] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Get Involved</h2>
          <p className="text-gray-300 mb-8">Every ministry runs on willing hearts. Reach out and find where you can serve.</p>
          <Link href="/contact" className="btn-gold">Contact Us <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
