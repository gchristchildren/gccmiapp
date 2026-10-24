/** Turns a YouTube or Vimeo link into a privacy-friendly embed URL. Returns null for anything else. */
export function embedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const id = (v: string | null | undefined) => (v && /^[\w-]{6,20}$/.test(v) ? v : null);

  if (host === "youtu.be") {
    const v = id(u.pathname.slice(1));
    return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "youtube.com") {
    const v = id(u.searchParams.get("v")) ?? id(u.pathname.match(/^\/embed\/([\w-]+)/)?.[1]);
    return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = u.pathname.match(/(\d{5,12})/)?.[1];
    return v ? `https://player.vimeo.com/video/${v}` : null;
  }
  return null;
}
