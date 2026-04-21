"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, Radio, ExternalLink, Calendar } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const CHANNEL_ID = ASSETS.youtubeChannelId;
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

// YouTube embed URLs
// Live stream (active on Sundays) — shows current live or "no stream" message
const LIVE_URL = `https://www.youtube-nocookie.com/embed/live_stream?channel=${CHANNEL_ID}&rel=0&modestbranding=1&autoplay=1`;
// Latest uploads playlist (for non-Sunday days)
// Uploads playlist ID = channel ID with "UC" replaced by "UU"
const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, "UU");
const LATEST_URL = `https://www.youtube-nocookie.com/embed/videoseries?list=${UPLOADS_PLAYLIST_ID}&rel=0&modestbranding=1`;

type VideoItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium: { url: string }; high: { url: string } };
    publishedAt: string;
  };
};

function isSundayNow(): boolean {
  return new Date().getDay() === 0;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function LivePage() {
  const [isLiveDay, setIsLiveDay] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    setIsLiveDay(isSundayNow());

    const controller = new AbortController();

    fetch("/api/youtube?maxResults=6&order=viewCount", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.items?.length) setVideos(data.items);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          // silently ignore non-abort errors
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingVideos(false);
      });

    return () => {
      controller.abort();
      setLoadingVideos(false);
    };
  }, []);

  const embedUrl = isLiveDay ? LIVE_URL : LATEST_URL;

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────────── */}
      <section className="relative h-72 md:h-80 flex items-end pb-12 overflow-hidden">
        <Image src={ASSETS.heroPoster} alt="Live" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-dark-gradient/80" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <div className="flex items-center gap-3 mb-3">
            {isLiveDay ? (
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                <Radio size={11} /> Live Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                <Calendar size={11} /> Next Service: Sunday
              </span>
            )}
          </div>
          <p className="eyebrow mb-2">Stream &amp; Watch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Watch Live</h1>
        </div>
      </section>

      {/* ── Main Player ────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 lg:px-16 bg-dark-gradient relative overflow-hidden">
        <div className="orb orb-gold w-80 h-80 top-0 right-0 opacity-10" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            {isLiveDay ? (
              <>
                <h2 className="section-title-light mb-2">Sunday Service — Live Now</h2>
                <p className="text-gray-400 text-sm">
                  We&apos;re live! Join the congregation online for today&apos;s Sunday service.
                </p>
              </>
            ) : (
              <>
                <h2 className="section-title-light mb-2">Previous Sunday Service</h2>
                <p className="text-gray-400 text-sm">
                  Catch up on our latest service. We go live every Sunday at 9:00 AM and 11:30 AM IST.
                </p>
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={isLiveDay ? "Ebenezer Ministries Sunday Service Live" : "Ebenezer Ministries Latest Service"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 w-full h-full border-0"
            />
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <PlayCircle size={18} /> Subscribe on YouTube <ExternalLink size={14} />
            </Link>
            {isLiveDay && (
              <Link
                href={`https://www.youtube.com/channel/${CHANNEL_ID}/live`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <Radio size={16} /> Open in YouTube <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Videos ────────────────────────────────────── */}
      <section className="section-pad bg-cream-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow">From Our Channel</span>
            <h2 className="section-title mt-3">Popular Messages</h2>
            <div className="gold-bar-center" />
          </div>

          {loadingVideos ? (
            /* Skeleton */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <motion.a
                  key={v.id.videoId}
                  href={`https://www.youtube.com/watch?v=${v.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group block card-glass rounded-2xl overflow-hidden card-hover"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.snippet.thumbnails.high?.url ?? v.snippet.thumbnails.medium?.url}
                      alt={v.snippet.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#0a0f1e]/0 group-hover:bg-[#0a0f1e]/40 transition-colors duration-300 flex items-center justify-center">
                      <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[#0a0f1e] font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#c9a96e] transition-colors">
                      {v.snippet.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(v.snippet.publishedAt)}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            /* Fallback when API key not configured — channel playlist link cards */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Sunday Services", query: "sunday+service", desc: "Weekly morning messages" },
                { label: "21 Day Fasting Prayer", query: "fasting+prayer", desc: "Annual congregation fast" },
                { label: "Praise Fest", query: "praise+fest", desc: "Monthly worship sessions" },
                { label: "Prayer Teachings", query: "prayer", desc: "How to pray and intercede" },
                { label: "Bible Study", query: "bible+study", desc: "Verse-by-verse teaching" },
                { label: "Youth Messages", query: "youth", desc: "For teens and young adults" },
              ].map((c, i) => (
                <motion.a
                  key={i}
                  href={`https://www.youtube.com/channel/${CHANNEL_ID}/search?query=${c.query}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group card-glass rounded-2xl p-6 card-hover flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a96e]/20 transition-colors">
                    <PlayCircle size={22} className="text-[#c9a96e]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0a0f1e] text-sm group-hover:text-[#c9a96e] transition-colors">{c.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{c.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
              Browse All Videos on YouTube <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
