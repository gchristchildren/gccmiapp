import Link from "next/link";
import { PostForm } from "@/components/PostForm";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Blog posts" };
export const dynamic = "force-dynamic";

export default async function AdminPosts({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posts").select("id, title, published, published_at").order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Blog posts</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Post deleted.</p>}
      <Card>
        <h2 className="font-bold">New post</h2>
        <div className="mt-4"><PostForm /></div>
      </Card>
      <div className="space-y-3">
        {(data ?? []).map((p) => (
          <Link key={p.id} href={`/admin/posts/${p.id}`} className="block rounded-3xl border border-line bg-surface p-5 text-sm shadow-card transition hover:-translate-y-0.5">
            <p className="text-base font-bold">{p.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-brand-soft text-brand" : "bg-gold-soft text-gold"}`}>{p.published ? "Published" : "Draft"}</span></p>
            <p className="text-muted">{new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}</p>
          </Link>
        ))}
        {!data?.length && <p className="text-sm text-muted">No posts yet.</p>}
      </div>
    </div>
  );
}
