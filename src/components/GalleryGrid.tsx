"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Photo = { src: string; w: number; h: number };

/** Photo grid with a simple lightbox: click to enlarge, arrow keys or buttons to browse, Esc to close. */
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group mb-3 block w-full overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <Image
              src={p.src}
              alt="GCCMI event photo"
              width={p.w}
              height={p.h}
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className="h-auto w-full transition duration-300 group-hover:scale-105"
              loading={i < 6 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {current && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={close}>
          <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="size-5" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronRight className="size-6" />
          </button>
          <Image
            src={current.src}
            alt="GCCMI event photo"
            width={current.w}
            height={current.h}
            sizes="100vw"
            className="max-h-[88vh] w-auto max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
            priority
          />
          <p className="absolute bottom-4 text-xs text-white/70">{(open ?? 0) + 1} / {photos.length}</p>
        </div>
      )}
    </>
  );
}
