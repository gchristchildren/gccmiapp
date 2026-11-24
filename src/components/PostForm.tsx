"use client";

import { useActionState, useEffect } from "react";
import { CoverUpload } from "@/components/CoverUpload";
import { RichEditor } from "@/components/RichEditor";
import { createPost, updatePost, type PostState } from "@/lib/actions/admin";

type Post = { id: string; title: string; excerpt: string; body: string; cover_url: string | null; published: boolean; published_at: string };

/** New-post and edit-post form. Errors show here; a successful save opens the post with a confirmation. */
export function PostForm({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState<PostState, FormData>(post ? updatePost : createPost, null);
  useEffect(() => {
    if (state?.saved) window.location.assign(`/admin/posts/${state.saved.id}?${state.saved.created ? "created" : "updated"}=1`);
  }, [state]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {post && <input type="hidden" name="id" value={post.id} />}
      <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required defaultValue={post?.title ?? ""} className={input} /></label>
      <label className="text-sm font-medium sm:col-span-2">Short summary (shown on the blog list)<textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} className={input} /></label>
      <div className="sm:col-span-2">
        <p className="text-sm font-medium">Post text</p>
        <div className="mt-1"><RichEditor defaultValue={post?.body ?? ""} /></div>
      </div>
      <CoverUpload inputClass={input} defaultValue={post?.cover_url ?? ""} />
      <label className="text-sm font-medium">Date<input name="published_at" type="date" defaultValue={post ? post.published_at.slice(0, 10) : ""} className={input} /></label>
      <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="published" defaultChecked={post ? post.published : true} className="size-4 accent-[var(--brand)]" /> {post ? "Published" : "Publish now"}</label>
      {state?.error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50 sm:w-fit">{pending ? "Saving…" : post ? "Save changes" : "Create post"}</button>
    </form>
  );
}
