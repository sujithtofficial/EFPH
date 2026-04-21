"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Users, Star, Shield } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";

// ─────────────────────────────────────────────────────────────────
// CONTENT — replace with real content once provided by the church
// ─────────────────────────────────────────────────────────────────

const VISION =
  "To make disciples of Christ Jesus. We do this through prayer, preaching the word and fellowship. We can encourage every individual to passionately follow, serve and grow in Christ.";

const MISSION =
  "To preach the undiluted Gospel of Jesus Christ, to make disciples of all nations, and to demonstrate the love of God through prayer, praise, and service.";

const CORE_BELIEFS = [
  {
    icon: <BookOpen size={20} />,
    title: "God the Father",
    desc: "We believe in the existence of God the Father, who reveals His unfailing love through His Son, Jesus Christ, and gives us the gift of the Holy Spirit.",
  },
  {
    icon: <BookOpen size={20} />,
    title: "The Word of God",
    desc: "We believe in the authenticity of the Bible as the only foundation for understanding who God is, according to His Word. \"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.\" — 2 Timothy 3:16-17",
  },
  {
    icon: <Users size={20} />,
    title: "The One True God",
    desc: "We believe in the one and only true God — the Creator, Redeemer, Preserver, and Ruler of the universe, infinite in holiness and perfection.",
  },
  {
    icon: <Star size={20} />,
    title: "The Work of Christ",
    desc: "We believe in the atoning work of Jesus Christ through the cross and His resurrection from the dead. \"Behold, the Lamb of God, who takes away the sin of the world.\" — John 1:29",
  },
  {
    icon: <Shield size={20} />,
    title: "The Blessed Hope",
    desc: "We prayerfully anticipate the second coming of our Lord Jesus Christ, as we proclaim: \"Come, Lord Jesus.\"",
  },
  {
    icon: <Heart size={20} />,
    title: "The Holy Spirit",
    desc: "We believe in the fellowship of the Holy Spirit, the third person of the Trinity, whose power leads, teaches, and comforts us. — 1 Corinthians 2:10-14",
  },
];

const fadeUp: Variants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

export default function AboutPage() {
  return (
    <>
      {/* ── Banner ──────────────────────────────────────────────── */}
      <section className="relative h-80 md:h-[420px] flex items-end pb-14 overflow-hidden">
        <Image src={ASSETS.aboutImage} alt="About Ebenezer Ministries" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/60 to-[#0a0f1e]/20" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="eyebrow mb-2">Who We Are</p>
          <h1 className="display-xl text-white leading-[1.05] max-w-xl">
            About <span className="text-gradient-gold">Ebenezer Ministries</span>
          </h1>
        </div>
      </section>

      {/* ── Our Story ───────────────────────────────────────────── */}
      <section className="section-pad bg-cream-gradient relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[200px] font-black text-[#c9a96e]/5 leading-none select-none pointer-events-none">E</div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title mt-3">{CHURCH.name}</h2>
            <div className="gold-bar" />
            <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
              Ebenezer Ministries was founded on a singular conviction: that a church built on prayer, praise, and service will see the hand of God move powerfully in its midst. We are rooted in the heart of Bengaluru — in the Mahadevapura neighbourhood — and our doors are open to all.
            </p>
            <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
              The name <strong>"Ebenezer"</strong> — meaning <em>"Thus far the Lord has helped us"</em> (1 Samuel 7:12) — defines our testimony. Every step of this ministry has been bathed in the faithfulness of God.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
              From weekly Sunday services in English, Hindi, Tamil, and Kannada to 21-day fasting prayer cycles, outreach, and children's Sunday school, Ebenezer Ministries is a full-spectrum ministry family.
            </p>
            <Link href="/ministries" className="btn-gold">Our Ministries <ArrowRight size={16} /></Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[460px]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
              <Image src={ASSETS.aboutImage2} alt="Church family" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Vision & Mission ────────────────────────────────────── */}
      <section className="section-pad bg-dark-gradient relative overflow-hidden">
        <div className="orb orb-gold w-96 h-96 top-0 right-0 opacity-10" />
        <div className="orb orb-blue w-64 h-64 bottom-0 left-0 opacity-10" style={{ animationDelay: "3s" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="eyebrow">Direction</span>
            <h2 className="section-title-light mt-3">Vision &amp; Mission</h2>
            <div className="gold-bar-center" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-dark p-8 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-[#c9a96e]/15 flex items-center justify-center mb-5">
                <Star size={22} className="text-[#c9a96e]" />
              </div>
              <h3 className="text-white font-bold text-xl mb-4">Our Vision</h3>
              <div className="w-8 h-0.5 bg-[#c9a96e] mb-5" />
              <p className="text-gray-400 leading-relaxed text-[15px]">{VISION}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="card-dark p-8 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-[#c9a96e]/15 flex items-center justify-center mb-5">
                <Star size={22} className="text-[#c9a96e]" />
              </div>
              <h3 className="text-white font-bold text-xl mb-4">Our Mission</h3>
              <div className="w-8 h-0.5 bg-[#c9a96e] mb-5" />
              <p className="text-gray-400 leading-relaxed text-[15px]">{MISSION}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Core Beliefs ────────────────────────────────────────── */}
      <section className="section-pad bg-[#0a0f1e] relative overflow-hidden">
        <div className="orb orb-gold w-64 h-64 top-10 left-1/2 -translate-x-1/2 opacity-8" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="eyebrow">What We Believe</span>
            <h2 className="section-title-light mt-3">Core Beliefs</h2>
            <div className="gold-bar-center" />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {CORE_BELIEFS.map((b, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card-dark p-6 rounded-2xl group hover:border-[#c9a96e]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center text-[#c9a96e] mb-4 group-hover:bg-[#c9a96e]/20 transition-colors">
                  {b.icon}
                </div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Service Times ───────────────────────────────────────── */}
      <section className="section-pad bg-cream-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow">Join Us</span>
            <h2 className="section-title mt-3">Service Times</h2>
            <div className="gold-bar-center" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHURCH.services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-5 text-center"
              >
                <p className="eyebrow mb-1">{s.day}</p>
                <p className="text-[#0a0f1e] font-bold text-base">{s.time}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.lang}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/contact" className="btn-gold">Plan Your Visit <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
