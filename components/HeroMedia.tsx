"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { ASSETS } from "@/lib/assets";

export default function HeroMedia() {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  return (
    <>
      <Image src={ASSETS.heroPoster} alt="Worship at Ebenezer Ministries" fill preload sizes="100vw" className="object-cover object-center" />
      <video
        ref={video}
        src={ASSETS.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      <div className="hero-shade absolute inset-0" />
      <button type="button" className="hero-video-control" aria-label={playing ? "Pause background video" : "Play background video"} aria-pressed={playing} onClick={async () => {
        if (!video.current?.paused) video.current?.pause();
        else { try { await video.current?.play(); } catch { return; } }
      }}>
        {playing ? <Pause size={15} /> : <Play size={15} />} <span> {playing ? "Pause" : "Play"}</span>
      </button>
    </>
  );
}
