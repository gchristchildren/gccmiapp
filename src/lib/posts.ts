import { createPublicClient } from "@/lib/supabase/public";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string | null;
  published_at: string;
};
export type PublicPost = PostSummary & { body: string };

const summaryCols = "id, slug, title, excerpt, cover_url, published_at";

/** Google Drive "share" links are web pages, not images. Rewrite them to the direct thumbnail address. */
export function imageSrc(url: string | null): string | null {
  if (!url) return url;
  const id = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1] ?? url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1600` : url;
}

const fixCover = <T extends { cover_url: string | null }>(p: T): T => ({ ...p, cover_url: imageSrc(p.cover_url) });

/** Lists, cards, sitemap and feeds: everything except the (long) article text. */
export async function fetchPostSummaries(limit?: number): Promise<PostSummary[]> {
  let q = createPublicClient().from("posts").select(summaryCols).eq("published", true).order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []).map(fixCover);
}

/** Includes the full text. Only for the AI text file; use fetchPostSummaries for pages. */
export async function fetchPosts(limit?: number): Promise<PublicPost[]> {
  let q = createPublicClient().from("posts").select(`${summaryCols}, body`).eq("published", true).order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []).map(fixCover);
}

export async function fetchPost(slug: string): Promise<PublicPost | null> {
  const { data } = await createPublicClient().from("posts").select(`${summaryCols}, body`).eq("slug", slug).eq("published", true).maybeSingle();
  return data ? fixCover(data) : null;
}
