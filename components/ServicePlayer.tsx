"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Check, Clock, PlayCircle } from "lucide-react";
import type { ChurchVideo, ServiceId } from "@/lib/youtube-feed";
import { CHURCH } from "@/lib/church";

export type ServiceOption = { id: ServiceId; label: string; time: string; video?: ChurchVideo; playlist?: string };

export default function ServicePlayer({ services }: { services: ServiceOption[] }) {
  const search = useSearchParams();
  const initialService = search.get("service") === "english-hindi" ? "english-hindi" : "tamil-kannada";
  const [choice, setChoice] = useState<ServiceId | null>(null);
  const [playing, setPlaying] = useState(false);
  const selected = services.find((service) => service.id === (choice ?? initialService)) ?? services[0];
  const embed = selected.playlist ? `https://www.youtube-nocookie.com/embed/videoseries?list=${selected.playlist}&rel=0&autoplay=1` : selected.video ? `https://www.youtube-nocookie.com/embed/${selected.video.id}?rel=0&autoplay=1` : undefined;
  const watch = selected.playlist ? `https://www.youtube.com/playlist?list=${selected.playlist}` : selected.video ? `https://www.youtube.com/watch?v=${selected.video.id}` : `${CHURCH.social.youtube}/search?query=${encodeURIComponent(selected.label + " Sunday Service")}`;

  return (
    <div>
      <fieldset className="mb-8">
        <legend className="sr-only">Choose a Sunday service</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <label key={service.id} className={`service-choice ${selected.id === service.id ? "is-selected" : ""}`}>
              <input type="radio" name="service" value={service.id} checked={selected.id === service.id} onChange={() => { setChoice(service.id); setPlaying(false); }} className="sr-only" />
              <span className="flex justify-between gap-3 items-center"><span className="font-semibold text-base sm:text-lg">{service.label}</span><span className="choice-indicator">{selected.id === service.id && <Check size={14} />}</span></span>
              <span className="flex items-center gap-2 text-sm mt-2 text-gray-400"><Clock size={14} /> Sunday · {service.time} IST</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="relative aspect-video bg-[#050a14] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
        {playing && embed ? (
          <iframe key={selected.id} src={embed} title={`${selected.label} Sunday service`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" />
        ) : embed ? (
          <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 w-full h-full group" aria-label={`Play ${selected.label} Sunday service`}>
            {selected.video && <Image src={`https://i.ytimg.com/vi/${selected.video.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover opacity-60 group-hover:opacity-75 transition-opacity" />}
            <span className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-4 bg-black/15"><PlayCircle className="text-gold-light w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.2} /><span className="text-white text-sm sm:text-base">{selected.label}</span></span>
          </button>
        ) : <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-6 text-center"><PlayCircle className="text-gold" size={44} /><p className="text-white">{selected.label} Sunday Service</p><a href={watch} target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">Watch on YouTube <ArrowUpRight size={16} /></a></div>}
      </div>
      <div aria-live="polite" className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl"><p className="text-white text-sm font-medium">{selected.video?.title ?? `${selected.label} Sunday Service`}</p>{selected.video && <p className="text-gray-400 text-xs mt-2">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(selected.video.publishedAt))}</p>}</div>
        <a href={watch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gold-light text-sm shrink-0">Open in YouTube <ArrowUpRight size={16} /></a>
      </div>
    </div>
  );
}
