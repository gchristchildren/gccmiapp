import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { ButtonLink, Container } from "@/components/ui";
import { fetchPost } from "@/lib/posts";

// Rendered fresh on each visit so admin edits (posts, events) show immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  return { title: post?.title ?? "Blog", description: post?.excerpt || undefined };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();
  return (
    <article>
      <Container className="max-w-3xl py-14">
        <ButtonLink href="/blog" variant="ghost">← All posts</ButtonLink>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-muted">{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</p>
        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt="" className="mt-8 w-full rounded-3xl border border-line" />
        )}
        <div className="mt-8"><RichText text={post.body} /></div>
      </Container>
    </article>
  );
}
