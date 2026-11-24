import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deleteMessage, setMessageStatus } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function Messages({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="text-sm text-muted">Messages sent from the Contact page. Reply by email, then mark them replied.</p>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Message deleted.</p>}
      {!data?.length && <Card className="p-5 text-sm text-muted">No messages yet.</Card>}
      {(data ?? []).map((m) => (
        <Card key={m.id} className="p-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold">
                {m.name} {m.status === "new" && <span className="ml-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-gold">New</span>}
              </p>
              <p className="text-muted"><a href={`mailto:${m.email}`} className="text-brand">{m.email}</a> · {fmtDate(m.created_at)}</p>
              <p className="mt-3 whitespace-pre-wrap [overflow-wrap:anywhere]">{m.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={setMessageStatus}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="status" value={m.status === "new" ? "replied" : "new"} />
                <button className="rounded-full border border-line px-4 py-1.5 font-semibold hover:bg-brand-soft">
                  {m.status === "new" ? "Mark replied" : "Mark new"}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton message="Delete this message?" className="rounded-full border border-line px-4 py-1.5 font-semibold text-red-600 hover:bg-red-500/10">Delete</ConfirmButton>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
