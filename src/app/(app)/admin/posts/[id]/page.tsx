import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deletePost } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; updated?: string; created?: string }> }) {
  const { id } = await params;
  const { error, updated, created } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/posts" className="text-sm font-medium text-brand">← Blog posts</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        {post.published && <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-semibold text-brand">View on site →</Link>}
      </div>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {(updated || created) && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">{created ? "Post created." : "Post updated."}</p>}
      <Card>
        <PostForm post={post} />
        <form action={deletePost} className="mt-5 border-t border-line pt-4">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message={`Delete "${post.title}"? This cannot be undone.`} className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
            Delete post
          </ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
