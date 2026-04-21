"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import { PlayCircle, Calendar, Clock, MapPin, ArrowRight, Quote, ChevronDown } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";

const EVENTS = [
  {
    title: "Sunday Service",
    date: "Every Sunday",
    time: "7:15 AM (Tamil & Kannada) | 11:00 AM (English & Hindi)",
    venue: "Ebenezer Ministries, Bengaluru",
    desc: "Come and experience life-changing worship and the Word of God.",
    tag: "Weekly",
  },
  {
    title: "21 Day Fasting Prayer",
    date: "Last week of September – Second Sunday of October",
    time: "11:30 AM – 1:30 PM & 6:00 PM – 8:30 PM",
    venue: "Ebenezer Ministries",
    desc: "The congregation gathers to fast, pray and worship together as a family.",
    tag: "Annual",
  },
  {
    title: "Praise Fest",
    date: "Every 3rd Friday",
    time: "6:30 PM",
    venue: "Ebenezer Ministries",
    desc: "A monthly celebration of worship in song and spirit.",
    tag: "Monthly",
  },
];

const TESTIMONIALS = [
  {
    text: "You get a warm welcome from the people here. The church is based on Spiritual vision. The fasting prayer which happens here is like a festival. The entire congregation does not miss the fasting prayer for 21 days, which is amazing.",
    name: "",
  },
  {
    text: "It is a Bible based church. The members are Godly people who show genuine love and care. Sunday class is awesome for the kids and they can get to know the word of the Lord.",
    name: "",
  },
];

const fadeUp: Variants = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeIn: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8 } } };

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[680px] flex items-center overflow-hidden">
        {/* Parallax video */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110 z-0">
          <video
            autoPlay muted loop playsInline preload="none"
            poster={ASSETS.heroPoster}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={ASSETS.heroVideo} type="video/mp4" />
          </video>
        </motion.div>

        {/* Multi-layer dark overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0f1e]/85 via-[#0a0f1e]/60 to-[#0a0f1e]/90" />

        {/* Decorative orbs */}
        <div className="orb orb-gold w-96 h-96 z-[1] -top-20 -right-20" />
        <div className="orb orb-blue w-72 h-72 z-[1] bottom-20 left-10" style={{ animationDelay: "3s" }} />

        {/* Noise texture */}
        <div className="absolute inset-0 z-[2] noise" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full"
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px bg-gradient-to-r from-[#c9a96e] to-transparent" />
              <span className="eyebrow">Welcome to {CHURCH.shortName}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="display-xl text-white mb-4 leading-[1.05]">
              Come As You{" "}
              <span className="text-gradient-gold">Are.</span>
              <br />
              Encounter God.{" "}
              <span className="text-gradient-gold">Find Community.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-gray-300/90 text-lg md:text-xl leading-relaxed mb-2 max-w-xl font-light">
              We are a Christ centered church
            </motion.p>

            <motion.p variants={fadeUp} className="text-gray-300/90 text-lg md:text-xl leading-relaxed mb-10 max-w-xl font-light">
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href="/live" className="btn-gold">
                <PlayCircle size={18} /> Watch Live
              </Link>
              <Link href="/contact" className="btn-outline">
                Plan a Visit <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60"
        >
          <ChevronDown size={20} className="text-white animate-bounce" />
        </motion.div>
      </section>

      {/* ── SERVICE TIMES BAR ─────────────────────────────────────── */}
      <section className="bg-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c9a96e]/5 via-transparent to-[#c9a96e]/5" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CHURCH.services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-dark p-4 text-center hover:border-[#c9a96e]/40 transition-colors"
              >
                <p className="eyebrow mb-1">{s.day}</p>
                <p className="text-white font-bold text-base">{s.time}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.lang}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WELCOME ───────────────────────────────────────────────── */}
      <section className="section-pad bg-cream-gradient relative overflow-hidden">
        {/* Big decorative letter */}
        <div className="absolute top-8 right-8 text-[200px] font-black text-[#c9a96e]/5 leading-none select-none pointer-events-none">
          E
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="eyebrow">Welcome Note</span>
            <h2 className="section-title mt-3 mb-2">Come As You Are</h2>
            <div className="gold-bar" />
            <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
              We at Ebenezer Ministries welcome you to attend our life changing worship, listen to the mysteries of the word of God and fellowship with saints.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
              We as a church are more like a family. We come together on Sundays to worship and celebrate Jesus. We explore the mysteries of His word to help people connect their lives to God and also help people connect their lives to <strong>CHRIST</strong>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="btn-gold">Learn More <ArrowRight size={16} /></Link>
              <Link href="/contact" className="btn-outline text-[#c9a96e]">Plan a Visit</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
              <Image src={ASSETS.aboutImage} alt="Church community" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/30 to-transparent" />
            </div>
            {/* Scripture card floating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -left-8 card-glass p-6 max-w-[250px] shadow-xl ring-glow"
            >
              <Quote size={18} className="text-[#c9a96e] mb-2" />
              <p className="text-xs font-medium italic leading-relaxed text-gray-700">
                "Shall I bring it to the time of birth, and not cause delivery?"
              </p>
              <p className="text-[10px] mt-2 text-[#c9a96e] font-semibold uppercase tracking-widest">Isaiah 66:9</p>
            </motion.div>
            {/* Small accent badge */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-dark-gradient flex items-center justify-center ring-glow float-slow"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-[#c9a96e] text-xl font-black">✦</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────────── */}
      <section className="section-pad bg-dark-gradient relative overflow-hidden">
        <div className="orb orb-gold w-80 h-80 top-10 right-0" />
        <div className="orb orb-purple w-64 h-64 bottom-10 left-0" style={{ animationDelay: "4s" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} className="eyebrow">What's On</motion.span>
            <motion.h2 variants={fadeUp} className="section-title-light mt-3">Upcoming Events</motion.h2>
            <motion.div variants={fadeIn} className="gold-bar-center" />
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {EVENTS.map((ev, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card-dark p-7 card-hover group cursor-default"
              >
                <span className="inline-block bg-[#c9a96e]/15 text-[#c9a96e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  {ev.tag}
                </span>
                <h3 className="text-white font-bold text-lg mb-4 group-hover:text-[#c9a96e] transition-colors">{ev.title}</h3>
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-400"><Calendar size={13} className="text-[#c9a96e] shrink-0" />{ev.date}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><Clock size={13} className="text-[#c9a96e] shrink-0" />{ev.time}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><MapPin size={13} className="text-[#c9a96e] shrink-0" />{ev.venue}</div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed border-t border-white/5 pt-4">{ev.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Link href="/events" className="btn-outline">View All Events <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="section-pad bg-cream-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#c9a96e]/15 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="eyebrow">What People Say</span>
            <h2 className="section-title mt-3">Testimonies</h2>
            <div className="gold-bar-center" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
                className="card-glass p-8 card-hover"
              >
                <Quote size={28} className="text-[#c9a96e] mb-5 opacity-70" />
                <p className="text-gray-600 leading-relaxed italic mb-6 text-[15px]">{t.text}</p>
                {t.name && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#9a7540] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✦</span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{t.name}</span>
                </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRAYER CTA ────────────────────────────────────────────── */}
      <section className="section-pad bg-dark-gradient relative overflow-hidden text-center">
        <div className="orb orb-gold w-64 h-64 top-0 left-1/2 -translate-x-1/2 opacity-10" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">We Care For You</span>
            <h2 className="section-title-light mt-3 mb-4">Submit a Prayer Request</h2>
            <div className="gold-bar-center" />
            <p className="text-gray-400 mb-8 text-[15px] leading-relaxed">
              Our pastoral team prays over every request. You are not alone, we stand with you in faith.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact#prayer" className="btn-gold">
                Submit Prayer Request <ArrowRight size={16} />
              </Link>
            </div>
            {/* Subtle give link — minimal, non-pushy */}
            <p className="mt-10 text-gray-600 text-sm">
              Would you like to support the ministry?{" "}
              <Link href="/give" className="link-underline text-[#c9a96e]">Give here</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
