"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import "yet-another-react-lightbox/styles.css";
import { ZoomIn } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

const ALBUMS = ASSETS.galleryAlbums;
const ALL_LABEL = "All Photos";

export default function GalleryPage() {
  const [activeAlbum, setActiveAlbum] = useState(ALL_LABEL);
  const [selected, setSelected] = useState<number | null>(null);

  const photos = useMemo(() => {
    if (activeAlbum === ALL_LABEL) {
      return ALBUMS.flatMap((a) => a.photos.map((src) => ({ src, album: a.name })));
    }
    const album = ALBUMS.find((a) => a.name === activeAlbum);
    return album ? album.photos.map((src) => ({ src, album: album.name })) : [];
  }, [activeAlbum]);

  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-80 flex items-end pb-12 overflow-hidden">
        <Image src={ASSETS.galleryBanner} alt="Gallery" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-[#0f172a]/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <p className="text-[#b0925e] font-semibold uppercase tracking-widest text-sm mb-2">Moments of Grace</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Gallery</h1>
        </div>
      </section>

      {/* ── Album Tabs + Grid ──────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-8">
            Moments of worship, fellowship, and celebration at Ebenezer Ministries.
          </p>

          {/* Album tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[ALL_LABEL, ...ALBUMS.map((a) => a.name)].map((name) => (
              <button
                key={name}
                aria-pressed={activeAlbum === name}
                onClick={() => { setActiveAlbum(name); setSelected(null); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeAlbum === name
                    ? "bg-[#b0925e] text-[#101b2c] shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {name}
                <span className="ml-1.5 text-xs opacity-70">
                  ({name === ALL_LABEL
                    ? ALBUMS.reduce((sum, a) => sum + a.photos.length, 0)
                    : ALBUMS.find((a) => a.name === name)?.photos.length ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Photo grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => setSelected(i)}
                className="relative block w-full aspect-[3/2] overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-[#b0925e]"
              >
                <Image
                  src={photo.src}
                  alt={`${photo.album} photo ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-[#0f172a]/0 group-hover:bg-[#0f172a]/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected !== null && <Lightbox open index={selected} close={() => setSelected(null)}
        slides={photos.map((photo) => ({ src: `/_next/image?url=${encodeURIComponent(photo.src)}&w=1920&q=75`, alt: `${photo.album} photo` }))}
        render={{ controls: () => <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-xs text-center pointer-events-none">{photos[selected].album} — {selected + 1} / {photos.length}</p> }}
        controller={{ closeOnBackdropClick: true }} carousel={{ preload: 1 }}
        on={{ view: ({ index }) => setSelected(index) }}
      />}
    </>
  );
}
