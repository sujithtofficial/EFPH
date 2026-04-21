"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ASSETS } from "@/lib/assets";

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

  const prev = () => setSelected((s) => (s !== null ? (s - 1 + photos.length) % photos.length : null));
  const next = () => setSelected((s) => (s !== null ? (s + 1) % photos.length : null));

  return (
    <>
      {/* ── Banner ─────────────────────────────────────── */}
      <section className="relative h-72 md:h-80 flex items-end pb-12 overflow-hidden">
        <Image src={ALBUMS[0].photos[0]} alt="Gallery" fill className="object-cover" priority sizes="100vw" />
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
                onClick={() => { setActiveAlbum(name); setSelected(null); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeAlbum === name
                    ? "bg-[#b0925e] text-white shadow-md"
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
              <motion.button
                key={photo.src}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                onClick={() => setSelected(i)}
                className="relative block w-full overflow-hidden rounded-sm group focus:outline-none focus:ring-2 focus:ring-[#b0925e]"
              >
                <Image
                  src={photo.src}
                  alt={`${photo.album} photo ${i + 1}`}
                  width={600}
                  height={400}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-[#0f172a]/0 group-hover:bg-[#0f172a]/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lightbox ───────────────────────────────────── */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ paddingTop: "62.5%" }}>
                <Image
                  src={photos[selected].src}
                  alt={`${photos[selected].album} photo`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <p className="text-center text-gray-400 text-xs mt-3">
                {photos[selected].album} — {selected + 1} / {photos.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
