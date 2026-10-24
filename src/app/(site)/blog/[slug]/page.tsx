import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { ButtonLink, Container } from "@/components/ui";
import { fetchPost } from "@/lib/posts";
import { abs, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

// Rendered fresh on each visit so admin edits (posts, events) show immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Blog" };
  const description = post.excerpt || `${post.title}: an article from ${site.fullName}.`;
  const title = post.title.length > 55 ? `${post.title.slice(0, 52).replace(/\s+\S*$/, "")}...` : post.title;
  return pageMeta({
    title,
    description: description.length > 158 ? `${description.slice(0, 155).trimEnd()}...` : description,
    path: `/blog/${post.slug}`,
    image: post.cover_url,
    type: "article",
    publishedTime: post.published_at,
  });
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();
  return (
    <article>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title.slice(0, 110),
            description: post.excerpt || undefined,
            image: post.cover_url ? [post.cover_url.startsWith("http") ? post.cover_url : abs(post.cover_url)] : [abs("/og-default.png")],
            datePublished: post.published_at,
            dateModified: post.published_at,
            mainEntityOfPage: abs(`/blog/${post.slug}`),
            inLanguage: "en-GB",
            author: { "@id": abs("/#organization") },
            publisher: { "@id": abs("/#organization") },
          },
        ]}
      />
      <Container className="max-w-3xl py-14">
        <ButtonLink href="/blog" variant="ghost">← All posts</ButtonLink>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-muted">{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</p>
        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt={post.title} className="mt-8 w-full rounded-3xl border border-line" />
        )}
        <div className="mt-8"><RichText text={post.body} /></div>
      </Container>
    </article>
  );
}
