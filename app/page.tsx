import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Calendar, Clock, MapPin, ArrowRight, Quote, ArrowDown } from "lucide-react";
import HeroMedia from "@/components/HeroMedia";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", CHURCH.name, CHURCH.description);

const EVENTS = [
  {
    title: "Youth Meeting",
    date: "Every Last Saturday",
    time: "6:30 PM",
    venue: "Ebenezer Ministries",
    desc: "A vibrant gathering for young people to worship, connect, and grow together in Christ.",
    tag: "Monthly",
  },
  {
    title: "Praise Fest",
    date: "Every 3rd Friday",
    time: "6:30 PM",
    venue: "Ebenezer Ministries",
    desc: "A monthly celebration of worship in song and spirit.",
    tag: "Monthly",
  },
  {
    title: "Night Prayer",
    date: "Every 2nd Friday",
    time: "10:30 PM – 4:00 AM",
    venue: "Ebenezer Ministries",
    desc: "An all-night prayer vigil — seeking the face of God through worship, intercession, and the Word.",
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

export default function HomePage() {
  return (
    <>
      <section className="home-hero relative isolate flex items-center overflow-hidden bg-navy">
        <HeroMedia />
        <div className="site-width relative z-10 w-full py-20 pointer-events-none">
          <p className="eyebrow hero-eyebrow mb-7">Welcome to {CHURCH.shortName}</p>
          <h1 className="hero-title text-white max-w-4xl">
            Come As You Are.<br />
            <span className="text-gold-light">Encounter God.</span><br />
            Find Community.
          </h1>
          <div className="mt-10 flex flex-wrap gap-3 pointer-events-auto">
            <Link href="/live" className="btn-gold"><PlayCircle size={18} /> Watch Live</Link>
            <Link href="/contact?type=visit#prayer" className="btn-outline on-dark">Plan a Visit <ArrowRight size={17} /></Link>
          </div>
        </div>
        <a href="#service-times" aria-label="View service times" className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70 p-2"><ArrowDown size={19} /></a>
      </section>

      <section id="service-times" aria-label="Service times" className="service-strip">
        <div className="site-width grid sm:grid-cols-2">
          {CHURCH.services.map((service, index) => (
            <Link key={service.lang} href={index < 2 ? `/live?service=${index === 0 ? "tamil-kannada" : "english-hindi"}` : "/contact"} className="service-item group">
              <span className="eyebrow">{service.day}</span>
              <span className="flex items-baseline gap-3 mt-2"><span className="text-2xl font-semibold text-white tracking-tight">{service.time}</span><span className="text-xs text-gray-400">IST</span></span>
              <span className="flex justify-between items-center mt-1 text-sm text-gray-300">{service.lang}<ArrowRight size={17} className="text-gold group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-pad bg-cream" id="welcome">
        <div className="site-width grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="eyebrow">Welcome Note</p>
            <h2 className="section-title mt-4 max-w-lg">We Are a Christ Centered Church</h2>
            <div className="gold-bar" />
            <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">We at Ebenezer Ministries welcome you to attend our life changing worship, listen to the mysteries of the word of God and fellowship with saints.</p>
            <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">We as a church are more like a family. We come together on Sundays to worship and celebrate Jesus. We explore the mysteries of His word to help people connect their lives to God and also help people connect their lives to <strong>CHRIST</strong>.</p>
            <div className="flex flex-wrap gap-3"><Link href="/about" className="btn-gold">Learn More <ArrowRight size={16} /></Link><Link href="/contact?type=visit#prayer" className="btn-outline">Plan a Visit</Link></div>
          </div>
          <div className="relative pb-8 sm:pl-7">
            <div className="welcome-photo relative aspect-[5/4] overflow-hidden rounded-t-[5rem] rounded-br-2xl">
              <Image src={ASSETS.welcomeImage} alt="Congregation worshipping during the New Year service" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
            <blockquote className="scripture-card relative -mt-14 mr-7 sm:mr-14 p-6 sm:p-8">
              <Quote size={23} className="text-gold-dark mb-3" aria-hidden="true" />
              <p className="font-display text-xl text-navy leading-relaxed">&quot;Shall I bring it to the time of birth, and not cause delivery?&quot;</p>
              <cite className="eyebrow block mt-4 not-italic">Isaiah 66:9</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section-pad bg-dark-gradient">
        <div className="site-width">
          <div className="flex flex-wrap gap-6 items-end justify-between mb-12">
            <div><p className="eyebrow">What&apos;s On</p><h2 className="section-title-light mt-3">Upcoming Events</h2></div>
            <Link href="/events" className="text-gold-light text-sm inline-flex items-center gap-2">View All Events <ArrowRight size={17} /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {EVENTS.map((event, index) => (
              <article key={event.title} className="event-card">
                <div className="flex items-center justify-between border-b border-white/15 pb-5 mb-6"><span className="eyebrow">{event.tag}</span><span className="font-display text-4xl text-white/25">0{index + 1}</span></div>
                <h3 className="font-display text-[28px] leading-tight text-white mb-6">{event.title}</h3>
                <div className="space-y-3 mb-6 text-sm text-gray-300">
                  <p className="flex gap-3"><Calendar size={15} className="text-gold shrink-0 mt-0.5" />{event.date}</p>
                  <p className="flex gap-3"><Clock size={15} className="text-gold shrink-0 mt-0.5" />{event.time}</p>
                  <p className="flex gap-3"><MapPin size={15} className="text-gold shrink-0 mt-0.5" />{event.venue}</p>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">{event.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-width">
          <div className="text-center mb-12"><p className="eyebrow">What People Say</p><h2 className="section-title mt-3">Testimonies</h2><div className="gold-bar-center" /></div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimony, index) => (
              <blockquote key={index} className="testimony-card">
                <Quote size={30} className="text-gold-dark mb-6" aria-hidden="true" />
                <p className="text-gray-600 leading-[1.9] text-[15px]">{testimony.text}</p>
                {testimony.name && <cite className="block mt-5 not-italic text-sm font-semibold">{testimony.name}</cite>}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad prayer-section">
        <div className="site-width flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between">
          <div className="max-w-2xl"><p className="eyebrow">We Care For You</p><h2 className="section-title-light mt-3 mb-5">Submit a Prayer Request</h2><p className="text-gray-300 text-[15px] leading-relaxed max-w-xl">Our pastoral team prays over every request. You are not alone, we stand with you in faith.</p></div>
          <Link href="/contact?type=prayer#prayer" className="btn-gold shrink-0">Submit Prayer Request <ArrowRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}
