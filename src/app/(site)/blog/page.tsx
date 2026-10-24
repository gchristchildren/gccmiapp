import Link from "next/link";
import { ButtonLink, Container, PageHero } from "@/components/ui";
import { fetchPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata = { title: "News & blog" };
// Rendered fresh on each visit so admin edits (posts, events) show immediately.
export const dynamic = "force-dynamic";

export default async function Blog() {
  const posts = await fetchPosts();
  return (
    <>
      <PageHero title="News & blog" body="Updates, reflections and encouragement from GCCMI." />
      <Container className="py-12">
        {posts.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition hover:-translate-y-1">
                {p.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-muted">{new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</p>
                  <h2 className="mt-1 text-lg font-bold">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{p.excerpt}</p>
                  <span className="mt-4 text-sm font-semibold text-brand">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
            <p className="text-muted">New posts will appear here soon. You can read our existing posts on our blog.</p>
            <div className="mt-5"><ButtonLink href={site.blog} external>Read our blog</ButtonLink></div>
          </div>
        )}
      </Container>
    </>
  );
}
