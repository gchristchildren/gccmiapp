/** Helpers for event photos and videos. */

export const MEDIA_BUCKET = "event-media";

export const mediaUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;

/** Turns a YouTube or Vimeo address into a safe embeddable address, or null if it is neither. */
export function embedSrc(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "m.youtube.com") id = u.pathname === "/watch" ? u.searchParams.get("v") : (u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ?? null);
  if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (host === "vimeo.com") {
    const vid = u.pathname.match(/^\/(\d+)/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}`;
  }
  if (host === "player.vimeo.com") {
    const vid = u.pathname.match(/^\/video\/(\d+)/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}`;
  }
  return null;
}

export type MediaItem = {
  id: string;
  kind: "image" | "video" | "embed";
  src: string;
  thumb: string | null;
  caption: string | null;
};

type Row = { id: string; kind: "image" | "video" | "embed"; path: string | null; thumb_path: string | null; embed_url: string | null; caption: string | null };

/** Rows from the database to what the gallery shows. Embeds that are not YouTube or Vimeo are dropped. */
export function toMediaItems(rows: Row[]): MediaItem[] {
  const out: MediaItem[] = [];
  for (const r of rows) {
    if (r.kind === "embed") {
      const src = r.embed_url ? embedSrc(r.embed_url) : null;
      if (src) out.push({ id: r.id, kind: "embed", src, thumb: null, caption: r.caption });
    } else if (r.path) {
      out.push({ id: r.id, kind: r.kind, src: mediaUrl(r.path), thumb: r.thumb_path ? mediaUrl(r.thumb_path) : null, caption: r.caption });
    }
  }
  return out;
}

/** Shrinks a photo in the browser before upload: a full-size copy and a small grid copy, both JPEG. */
export async function resizeImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not resize"))), "image/jpeg", quality));
}
