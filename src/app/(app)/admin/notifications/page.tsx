import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { sendManualNotification } from "@/lib/actions/admin";
import { fmtDateTime } from "@/lib/format";
import { pushConfigured } from "@/lib/push";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function AdminNotifications({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const { error, sent } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: log }, { count }] = await Promise.all([
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("push_subscriptions").select("*", { count: "exact", head: true }),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {!pushConfigured() && <p role="alert" className="rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold">Push isn&apos;t configured: set the VAPID keys in the environment.</p>}
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {sent && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Sent to {sent} device{sent === "1" ? "" : "s"}.</p>}
      <Card>
        <p className="text-sm text-muted"><strong className="text-fg">{count ?? 0}</strong> devices have reminders turned on.</p>
        <h2 className="mt-4 font-bold">Send a notification</h2>
        <form action={sendManualNotification} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">Title<input name="title" required maxLength={60} className={input} placeholder="Parent meeting reminder" /></label>
          <label className="block text-sm font-medium">Message<textarea name="body" required maxLength={140} rows={2} className={input} /></label>
          <label className="block text-sm font-medium">Opens (optional, a page on this site)<input name="url" className={input} placeholder="/portal/announcements" /></label>
          <label className="block text-sm font-medium">Send to
            <select name="audience" className={input}>
              <option value="all">Everyone with reminders on</option>
              <option value="bible_club">Bible Club parents</option>
              <option value="masterclass">Masterclass members</option>
            </select>
          </label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Send now</button>
        </form>
        <p className="mt-3 text-xs text-muted">Automatic reminders (&ldquo;Bible Club starts tomorrow&rdquo;, event reminders) run every morning.</p>
      </Card>
      <Card className="p-0">
        <h2 className="p-5 pb-3 font-bold">Recent notifications</h2>
        <ul className="divide-y divide-line text-sm">
          {(log ?? []).map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div><p className="font-semibold">{n.title}</p><p className="text-muted">{n.body}</p><p className="text-xs text-muted">{fmtDateTime(n.created_at)} · {n.kind}</p></div>
              <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{n.sent_count} sent</span>
            </li>
          ))}
          {!log?.length && <li className="px-5 py-4 text-muted">Nothing sent yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
