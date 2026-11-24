import { FileText } from "lucide-react";
import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deleteAssignment } from "@/lib/actions/admin";
import { ageLabel, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Assignments" };
export const dynamic = "force-dynamic";

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function Assignments({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase.from("assignments").select("*").order("created_at", { ascending: false }).limit(200);
  const list = rows ?? [];

  const [{ data: kids }, { data: parents }, signed] = await Promise.all([
    supabase.from("children").select("id, first_name, last_name, age_group").in("id", [...new Set(list.map((a) => a.child_id))]),
    supabase.from("profiles").select("id, full_name").in("id", [...new Set(list.map((a) => a.profile_id))]),
    list.length ? supabase.storage.from("assignments").createSignedUrls(list.map((a) => a.file_path), 3600) : Promise.resolve({ data: [] }),
  ]);
  const kid = new Map((kids ?? []).map((k) => [k.id, k]));
  const parent = new Map((parents ?? []).map((p) => [p.id, p.full_name]));
  const url = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Assignments</h1>
      <p className="text-sm text-muted">Class work uploaded by parents. Links open for one hour.</p>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Assignment deleted.</p>}
      {!list.length && <Card className="p-5 text-sm text-muted">No assignments uploaded yet.</Card>}
      {list.map((a) => {
        const k = kid.get(a.child_id);
        const link = url.get(a.file_path);
        return (
          <Card key={a.id} className="p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-bold">{k ? `${k.first_name} ${k.last_name}` : "Child"} <span className="text-sm font-normal text-muted">{k ? `· ${ageLabel(k.age_group)}` : ""}</span></p>
                <p className="text-muted">Uploaded by {parent.get(a.profile_id) || "a parent"} · {fmtDateTime(a.created_at)} · {kb(a.file_size)}</p>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 font-medium text-brand">
                    <FileText className="size-4" /> <span className="[overflow-wrap:anywhere]">{a.file_name}</span>
                  </a>
                ) : (
                  <p className="mt-2 text-muted">{a.file_name} (file not available)</p>
                )}
                {a.note && <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">{a.note}</p>}
              </div>
              <form action={deleteAssignment}>
                <input type="hidden" name="id" value={a.id} />
                <ConfirmButton message={`Delete "${a.file_name}"? This cannot be undone.`} className="rounded-full border border-red-500/40 px-4 py-1.5 font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">Delete</ConfirmButton>
              </form>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
