import { fetchPosts } from "@/lib/posts";
import { abs } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await fetchPosts(50);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(`/blog/${p.slug}`)}</link>
      <guid isPermaLink="true">${abs(`/blog/${p.slug}`)}</guid>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || p.title)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${site.fullName} blog`)}</title>
    <link>${abs("/blog")}</link>
    <description>${esc("Articles on intentional parenting, faith and family from " + site.fullName)}</description>
    <language>en-gb</language>
    <atom:link href="${abs("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
