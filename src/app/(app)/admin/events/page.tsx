import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createEvent, deleteEvent } from "@/lib/actions/admin";
import { eventCategories } from "@/lib/content";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: regs }] = await Promise.all([
    supabase.from("events").select("*").order("starts_on", { ascending: false }),
    supabase.from("event_registrations").select("event_id"),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Card>
        <h2 className="font-bold">Add an event</h2>
        <form action={createEvent} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required className={input} /></label>
          <label className="text-sm font-medium">Category
            <select name="category" className={input}>{eventCategories.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="text-sm font-medium">Date<input name="starts_on" type="date" required className={input} /></label>
          <label className="text-sm font-medium">Time<input name="time_label" placeholder="10:00 – 12:00" className={input} /></label>
          <label className="text-sm font-medium">Venue<input name="venue" className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Address (used for the map link)<input name="address" className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Summary<textarea name="summary" rows={2} className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Registration link (optional, https://)<input name="register_url" type="url" className={input} /></label>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="send_push" className="size-4 accent-[var(--brand)]" /> Notify people with reminders on (&ldquo;New event added&rdquo;)</label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Add event</button>
        </form>
        <p className="mt-3 text-xs text-muted">Events appear on the public Events page straight away.</p>
      </Card>
      {(data ?? []).map((e) => (
        <Card key={e.id} className="flex items-start justify-between gap-3 p-5 text-sm">
          <div>
            <p className="text-base font-bold">{e.title}</p>
            <p className="text-muted">{e.category} · {fmtDate(e.starts_on)} · {e.venue || "venue tbc"}</p>
            <p className="mt-1 text-xs font-medium text-brand">{(regs ?? []).filter((r) => r.event_id === e.id).length} sign-ups</p>
          </div>
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={e.id} />
            <button aria-label="Delete event" className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-600"><Trash2 className="size-4" /></button>
          </form>
        </Card>
      ))}
      {!data?.length && <p className="text-sm text-muted">No events yet.</p>}
    </div>
  );
}
