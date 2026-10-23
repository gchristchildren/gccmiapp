import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncements({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Card>
        <h2 className="font-bold">Post an announcement</h2>
        <form action={createAnnouncement} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">Title<input name="title" required className={input} /></label>
          <label className="block text-sm font-medium">Message<textarea name="body" required rows={4} className={input} /></label>
          <label className="block text-sm font-medium">Audience
            <select name="audience" className={input}>
              <option value="all">Everyone</option>
              <option value="bible_club">Bible Club</option>
              <option value="academy">Academy</option>
              <option value="masterclass">Masterclass</option>
            </select>
          </label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Post</button>
        </form>
        <p className="mt-3 text-xs text-muted">Announcements show in the parent portal. Push notifications arrive in Phase 3.</p>
      </Card>
      {(data ?? []).map((n) => (
        <Card key={n.id} className="flex items-start justify-between gap-3 p-5 text-sm">
          <div>
            <p className="text-base font-bold">{n.title}</p>
            <p className="text-xs text-muted">{fmtDate(n.created_at)} · {n.audience}</p>
            <p className="mt-2 whitespace-pre-line">{n.body}</p>
          </div>
          <form action={deleteAnnouncement}>
            <input type="hidden" name="id" value={n.id} />
            <button aria-label="Delete announcement" className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-600"><Trash2 className="size-4" /></button>
          </form>
        </Card>
      ))}
    </div>
  );
}
