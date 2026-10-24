import type { MetadataRoute } from "next";
import { programmes } from "@/lib/content";
import { fetchPosts } from "@/lib/posts";
import { abs } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts();
  const fixed: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ...programmes.map((p): [string, number, "monthly"] => [`/programmes/${p.slug}`, 0.9, "monthly"]),
    ["/about", 0.8, "monthly"],
    ["/events", 0.8, "weekly"],
    ["/blog", 0.8, "weekly"],
    ["/charity-impact", 0.7, "monthly"],
    ["/volunteer", 0.7, "monthly"],
    ["/instructors", 0.6, "monthly"],
    ["/gallery", 0.6, "monthly"],
    ["/books", 0.5, "monthly"],
    ["/contact", 0.7, "yearly"],
    ["/donate", 0.6, "yearly"],
  ];
  return [
    ...fixed.map(([path, priority, changeFrequency]) => ({ url: abs(path), priority, changeFrequency })),
    ...posts.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: new Date(p.published_at),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
