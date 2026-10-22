"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Clock, PlayCircle, RefreshCw, Radio } from "lucide-react";
import { displayedVideo, isVerificationFresh, selectedServiceId, STATUS_LABELS, watchUrl, type BroadcastState, type BroadcastVideo, type LiveSnapshot, type PlaybackSession } from "@/lib/live-services";
import { startLivePolling } from "@/lib/live-polling";
import type { ServiceId } from "@/lib/youtube-feed";

const formatDate = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));
function Badge({ state }: { state: BroadcastState }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 ${state === "live" ? "text-red-100 bg-red-800/50" : "text-gold-light bg-white/10"}`}>{state === "live" && <Radio size={12} />}{STATUS_LABELS[state]}</span>;
}

export default function ServicePlayer({ initialSnapshot, initialService }: { initialSnapshot: LiveSnapshot; initialService?: ServiceId }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [choice, setChoice] = useState<ServiceId | undefined>(initialService);
  const [playback, setPlayback] = useState<PlaybackSession | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    const poller = startLivePolling({
      fetchSnapshot: async (signal) => {
        const response = await fetch("/api/live", { cache: "no-store", signal });
        if (!response.ok) throw new Error("Live status unavailable");
        return response.json();
      },
      isActive: () => document.visibilityState !== "hidden" && navigator.onLine,
      onSnapshot: setSnapshot,
      onFailure: () => setSnapshot(previous => ({ ...previous, verified: false })),
    });
    refresh.current = poller.refresh;
    const resume = () => { void poller.refresh(); };
    const expire = setInterval(() => setSnapshot(previous => previous.verified && !isVerificationFresh(previous.checkedAt) ? { ...previous, verified: false } : previous), 15000);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => { poller.stop(); clearInterval(expire); refresh.current = null; document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", resume); };
  }, []);

  const selectedId = selectedServiceId(snapshot, choice, playback);
  const selected = snapshot.services.find(service => service.id === selectedId) ?? snapshot.services[0];
  const video = displayedVideo(selected, playback, snapshot);
  const state: BroadcastState = !snapshot.verified && video?.state !== "replay" ? (video ? "unknown" : "unavailable") : video?.state ?? "unavailable";
  const watching = playback?.serviceId === selected.id;
  const canEmbed = video?.embeddable && (state === "live" || state === "replay" || state === "unknown");
  const href = watchUrl(selected, video);
  const newLive = watching && selected.status === "live" && selected.video?.id !== playback.video.id && snapshot.verified;
  const play = (target: BroadcastVideo) => setPlayback({ serviceId: selected.id, video: target });
  const currentReplay = selected.replay && selected.replay.id !== video?.id ? selected.replay : undefined;
  const cardState = (status: BroadcastState): BroadcastState => !snapshot.verified && ["live", "upcoming", "processing"].includes(status) ? "unknown" : status;

  return (
    <div>
      <fieldset className="mb-7">
        <legend className="sr-only">Choose a Sunday service</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          {snapshot.services.map(service => (
            <label key={service.id} className={`service-choice ${selected.id === service.id ? "is-selected" : ""}`}>
              <input type="radio" name="service" value={service.id} checked={selected.id === service.id} onChange={() => { setChoice(service.id); setPlayback(null); }} className="sr-only" />
              <span className="flex justify-between gap-3 items-center"><span className="font-semibold text-base sm:text-lg">{service.label}</span><span className="choice-indicator">{selected.id === service.id && <Check size={14} />}</span></span>
              <span className="flex items-center gap-2 text-sm mt-2 text-gray-400"><Clock size={14} /> Sunday · {service.time} IST</span>
              <span className="block mt-4"><Badge state={cardState(service.status)} /></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div aria-live="polite"><Badge state={state} /></div>
        <button type="button" className="text-xs text-gray-300 inline-flex items-center gap-2 min-h-11" disabled={refreshing} onClick={async () => {
          setRefreshing(true);
          try { await refresh.current?.(); } finally { setRefreshing(false); }
        }}><RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Checking…" : "Refresh status"}</button>
      </div>
      {!snapshot.verified && <p role="status" className="text-gray-300 text-sm leading-relaxed mb-5">Live status is temporarily unavailable. You can still watch the available services below.</p>}
      {newLive && <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-white text-sm">A live {selected.label} service is available.</p>{selected.video?.embeddable ? <button type="button" className="btn-gold text-xs" onClick={() => play(selected.video!)}>Watch live <Radio size={14} /></button> : <a href={watchUrl(selected)} target="_blank" rel="noopener noreferrer" className="btn-gold text-xs">Watch live on YouTube <ArrowUpRight size={14} /></a>}</div>}
      <div className="relative aspect-video min-h-[200px] bg-[#050a14] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
        {watching && playback ? (
          <iframe key={playback.video.id} src={`https://www.youtube-nocookie.com/embed/${playback.video.id}?rel=0&autoplay=1`} title={video?.title ?? playback.video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" />
        ) : video && canEmbed ? (
          <button type="button" onClick={() => play(video)} className="absolute inset-0 w-full h-full group" aria-label={`Play ${selected.label} Sunday service`}>
            <Image src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover opacity-60 group-hover:opacity-75 transition-opacity" />
            <span className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-4 bg-black/15"><PlayCircle className="text-gold-light w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.2} /><span className="text-white text-sm sm:text-base">{selected.label}</span></span>
          </button>
        ) : <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-5 text-center">
          <PlayCircle className="text-gold" size={38} />
          <p className="text-white text-sm sm:text-base">{state === "processing" ? "This service has ended. The replay is being prepared." : state === "upcoming" ? "This service has not started yet." : video ? "Watch this service on YouTube." : `${selected.label} Sunday Service`}</p>
          {state === "upcoming" && video?.scheduledAt && <p className="text-gray-300 text-xs">{formatDate(video.scheduledAt)} IST</p>}
          <a href={href} target="_blank" rel="noopener noreferrer" className="btn-gold text-xs">{state === "upcoming" ? "View scheduled service" : state === "processing" ? "Check replay on YouTube" : "Watch on YouTube"}<ArrowUpRight size={15} /></a>
        </div>}
      </div>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl"><p className="text-white text-sm font-medium">{video?.title ?? `${selected.label} Sunday Service`}</p>{video && <p className="text-gray-400 text-xs mt-2">{video.startedAt ? "Service started" : "Published"} {formatDate(video.startedAt ?? video.publishedAt)} IST</p>}</div>
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gold-light text-sm shrink-0">{state === "live" ? "Watch live on YouTube" : "Open in YouTube"}<ArrowUpRight size={16} /></a>
      </div>
      {(currentReplay || selected.playlistUrl) && <div className="mt-6 flex flex-wrap gap-5">
        {currentReplay && (currentReplay.embeddable ? <button type="button" className="text-sm text-gold-light underline underline-offset-4 min-h-11" onClick={() => play(currentReplay)}>Watch previous service</button> : <a href={watchUrl(selected, currentReplay)} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-light underline underline-offset-4 min-h-11 inline-flex items-center">Watch previous service on YouTube</a>)}
        {selected.playlistUrl && <a href={selected.playlistUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-light underline underline-offset-4 min-h-11 inline-flex items-center gap-1.5">Browse {selected.label} services <ArrowUpRight size={14} /></a>}
      </div>}
      {watching && state === "processing" && <p role="status" className="text-gray-300 text-sm mt-5">The live service has ended. Your player is kept open while YouTube prepares the replay.</p>}
      {watching && state === "unavailable" && <p role="status" className="text-gray-300 text-sm mt-5">This service is no longer available on YouTube. Choose another service to continue watching.</p>}
    </div>
  );
}
