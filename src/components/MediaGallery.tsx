"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "@/lib/media";

/** Photo grid with a full-screen viewer, plus playable videos. */
export function MediaGallery({ items, eventTitle }: { items: MediaItem[]; eventTitle: string }) {
  const photos = items.filter((m) => m.kind === "image");
  const videos = items.filter((m) => m.kind !== "image");
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  const current = open === null ? null : photos[open];
  return (
    <div className="space-y-10">
      {!!videos.length && (
        <section aria-label="Videos">
          <h2 className="text-xl font-bold">Videos</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {videos.map((v) => (
              <figure key={v.id} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                {v.kind === "video" ? (
                  <video src={v.src} controls playsInline preload="metadata" className="aspect-video w-full bg-black" />
                ) : (
                  <iframe
                    src={v.src}
                    title={v.caption || `${eventTitle} video`}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="aspect-video w-full"
                  />
                )}
                {v.caption && <figcaption className="px-4 py-3 text-sm text-muted">{v.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {!!photos.length && (
        <section aria-label="Photos">
          <h2 className="text-xl font-bold">Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2" aria-label={p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1} of ${photos.length}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb ?? p.src} alt={p.caption || `${eventTitle} photo ${i + 1}`} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
              </button>
            ))}
          </div>
        </section>
      )}

      {current && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={() => setOpen(null)}>
          <div className="flex justify-between p-3 text-sm text-white/80">
            <span>{(open ?? 0) + 1} / {photos.length}</span>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="size-5" /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-14" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.caption || `${eventTitle} photo ${(open ?? 0) + 1}`} className="max-h-full max-w-full object-contain" />
            {photos.length > 1 && (
              <>
                <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="absolute left-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-3"><ChevronLeft className="size-6" /></button>
                <button type="button" aria-label="Next photo" onClick={() => step(1)} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-3"><ChevronRight className="size-6" /></button>
              </>
            )}
          </div>
          {current.caption && <p className="p-4 text-center text-sm text-white/90">{current.caption}</p>}
        </div>
      )}
    </div>
  );
}
