import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deletePost, updatePost } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; updated?: string; created?: string }> }) {
  const { id } = await params;
  const { error, updated, created } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

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
        <form action={updatePost} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={post.id} />
          <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required defaultValue={post.title} className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Short summary<textarea name="excerpt" rows={2} defaultValue={post.excerpt} className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Post text<textarea name="body" rows={16} defaultValue={post.body} className={input} /></label>
          <label className="text-sm font-medium">Cover image link (https://)<input name="cover_url" type="url" defaultValue={post.cover_url ?? ""} className={input} /></label>
          <label className="text-sm font-medium">Date<input name="published_at" type="date" defaultValue={post.published_at.slice(0, 10)} className={input} /></label>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="published" defaultChecked={post.published} className="size-4 accent-[var(--brand)]" /> Published</label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save changes</button>
        </form>
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
