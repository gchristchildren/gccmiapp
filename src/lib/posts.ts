import { createPublicClient } from "@/lib/supabase/public";

export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  published_at: string;
};

const cols = "id, slug, title, excerpt, body, cover_url, published_at";

export async function fetchPosts(limit?: number): Promise<PublicPost[]> {
  let q = createPublicClient().from("posts").select(cols).eq("published", true).order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data ?? [];
}

export async function fetchPost(slug: string): Promise<PublicPost | null> {
  const { data } = await createPublicClient().from("posts").select(cols).eq("slug", slug).eq("published", true).maybeSingle();
  return data;
}
