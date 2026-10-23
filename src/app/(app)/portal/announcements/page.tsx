import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function Announcements() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Announcements</h1>
      {(data ?? []).map((n) => (
        <Card key={n.id} className="p-5 text-sm">
          <p className="text-base font-bold">{n.title}</p>
          <p className="text-xs text-muted">{fmtDate(n.created_at)}</p>
          <p className="mt-2 whitespace-pre-line">{n.body}</p>
        </Card>
      ))}
      {!data?.length && <p className="text-sm text-muted">No announcements yet.</p>}
    </div>
  );
}
