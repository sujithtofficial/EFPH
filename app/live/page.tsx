import { Suspense } from "react";
import Image from "next/image";
import { ExternalLink, PlayCircle, Radio } from "lucide-react";
import ServicePlayer, { type ServiceOption } from "@/components/ServicePlayer";
import { ASSETS } from "@/lib/assets";
import { CHURCH } from "@/lib/church";
import { getChurchVideos } from "@/lib/youtube";
import { findServiceVideo } from "@/lib/youtube-feed";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata = pageMetadata("/live", "Watch Live", "Watch Tamil and Kannada or English and Hindi Sunday services from Ebenezer Ministries, Bengaluru.");

export default async function LivePage() {
  const videos = await getChurchVideos();
  const playlist = (value: string | undefined) => value && /^[a-zA-Z0-9_-]{10,80}$/.test(value) ? value : undefined;
  const services: ServiceOption[] = [
    { id: "tamil-kannada", label: CHURCH.services[0].lang, time: CHURCH.services[0].time, video: findServiceVideo(videos, "tamil-kannada"), playlist: playlist(process.env.YOUTUBE_TAMIL_KANNADA_PLAYLIST_ID) },
    { id: "english-hindi", label: CHURCH.services[1].lang, time: CHURCH.services[1].time, video: findServiceVideo(videos, "english-hindi"), playlist: playlist(process.env.YOUTUBE_ENGLISH_HINDI_PLAYLIST_ID) },
  ];
  const popular = [...videos].sort((a, b) => b.views - a.views).slice(0, 6);
  return (
    <>
      <section className="page-banner relative overflow-hidden bg-navy">
        <Image src={ASSETS.heroPoster} alt="Live" fill className="object-cover" preload sizes="100vw" />
        <div className="absolute inset-0 bg-navy/75" />
        <div className="site-width relative z-10 w-full"><p className="eyebrow mb-4">Stream &amp; Watch</p><h1 className="page-title text-white">Watch Live</h1></div>
      </section>
      <section className="section-pad bg-dark-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="mb-9"><h2 className="section-title-light mb-4">Sunday Service</h2><p className="text-gray-400 text-sm leading-relaxed">Catch up on our latest service. We go live every Sunday at {CHURCH.services[0].time} and {CHURCH.services[1].time} IST.</p></div>
          <Suspense fallback={<div className="aspect-video bg-white/5 rounded-2xl" />}><ServicePlayer services={services} /></Suspense>
          <div className="mt-9 flex flex-wrap gap-3"><a href={`${CHURCH.social.youtube}/live`} target="_blank" rel="noopener noreferrer" className="btn-gold text-sm"><Radio size={17} /> Open Live Stream <ExternalLink size={14} /></a><a href={CHURCH.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-outline on-dark text-sm"><PlayCircle size={17} /> Subscribe on YouTube <ExternalLink size={14} /></a></div>
        </div>
      </section>
      <section className="section-pad bg-cream">
        <div className="site-width">
          <div className="text-center mb-12"><p className="eyebrow">From Our Channel</p><h2 className="section-title mt-3">Popular Messages</h2><div className="gold-bar-center" /></div>
          {popular.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {popular.map((video) => <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="card-glass overflow-hidden group">
              <div className="relative aspect-video bg-navy"><Image src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt={video.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" /></div>
              <div className="p-5"><h3 className="font-semibold text-sm leading-relaxed text-navy line-clamp-2">{video.title}</h3><p className="text-gray-500 text-xs mt-3">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(video.publishedAt))}</p></div>
            </a>)}
          </div>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Sunday Services", query: "sunday service", desc: "Weekly morning messages" },
              { label: "21 Day Fasting Prayer", query: "fasting prayer", desc: "Annual congregation fast" },
              { label: "Praise Fest", query: "praise fest", desc: "Monthly worship sessions" },
              { label: "Prayer Teachings", query: "prayer", desc: "How to pray and intercede" },
              { label: "Bible Study", query: "bible study", desc: "Verse-by-verse teaching" },
              { label: "Youth Messages", query: "youth", desc: "For teens and young adults" },
            ].map((category) => <a key={category.label} href={`${CHURCH.social.youtube}/search?query=${encodeURIComponent(category.query)}`} target="_blank" rel="noopener noreferrer" className="card-glass p-5 flex gap-4 items-start"><PlayCircle size={23} className="text-gold-dark shrink-0" /><div><p className="font-semibold text-sm text-navy">{category.label}</p><p className="text-gray-500 text-xs mt-1">{category.desc}</p></div></a>)}
          </div>
          <div className="text-center mt-10"><a href={CHURCH.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">Browse All Videos on YouTube <ExternalLink size={14} /></a></div>
        </div>
      </section>
    </>
  );
}
