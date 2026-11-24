import type { MetadataRoute } from "next";
import { programmes } from "@/lib/content";
import { fetchPublicEvents } from "@/lib/events";
import { fetchPostSummaries } from "@/lib/posts";
import { abs } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events] = await Promise.all([fetchPostSummaries(), fetchPublicEvents()]);
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
    ["/safeguarding", 0.5, "yearly"],
    ["/policies", 0.4, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/cookies", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
    ["/online-classes-rules", 0.3, "yearly"],
    ["/photo-policy", 0.3, "yearly"],
  ];
  return [
    ...fixed.map(([path, priority, changeFrequency]) => ({ url: abs(path), priority, changeFrequency })),
    ...events.map((e) => ({
      url: abs(`/events/${e.slug}`),
      lastModified: new Date(e.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: new Date(p.published_at),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
