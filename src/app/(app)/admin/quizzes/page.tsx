import Link from "next/link";
import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deleteQuizScore } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Bible Quiz scores" };
export const dynamic = "force-dynamic";

export default async function Quizzes({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: kids }, { data: scores }] = await Promise.all([
    supabase.from("children").select("id, first_name, last_name, age_group").order("first_name"),
    supabase.from("quiz_scores").select("*").order("taken_on", { ascending: false }).order("created_at", { ascending: false }).limit(100),
  ]);
  const name = new Map((kids ?? []).map((k) => [k.id, `${k.first_name} ${k.last_name}`]));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Bible Quiz scores</h1>
      <p className="text-sm text-muted">Parents see only their own child&apos;s scores in the portal. Scores are never shown publicly.</p>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">{saved} {saved === "1" ? "score" : "scores"} saved.</p>}

      <Link href="/admin/quizzes/new" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Record a quiz</Link>

      <div>
        <h2 className="mb-3 font-bold">Recent results</h2>
        <div className="space-y-2">
          {(scores ?? []).map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{name.get(s.child_id) ?? "Child"} <span className="font-normal text-muted">· {s.quiz_title}</span></p>
                <p className="text-muted">{fmtDate(s.taken_on)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand">{s.score}/{s.out_of}</span>
                <form action={deleteQuizScore}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton message="Delete this score?" className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/10">Delete</ConfirmButton>
                </form>
              </div>
            </Card>
          ))}
          {!scores?.length && <p className="text-sm text-muted">No quiz scores recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
