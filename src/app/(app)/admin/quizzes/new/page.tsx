import Link from "next/link";
import { Card } from "@/components/ui";
import { QuizForm } from "@/components/QuizForm";
import { requireAdmin } from "@/lib/auth";
import { ageGroups, ageLabel } from "@/lib/format";

export const metadata = { title: "Record a quiz" };
export const dynamic = "force-dynamic";

export default async function NewQuiz() {
  const { supabase } = await requireAdmin();
  const { data: kids } = await supabase.from("children").select("id, first_name, last_name, age_group").order("first_name");
  const groups = ageGroups
    .map((g) => ({ label: ageLabel(g), kids: (kids ?? []).filter((k) => k.age_group === g).map((k) => ({ id: k.id, name: `${k.first_name} ${k.last_name}`, group: g })) }))
    .filter((g) => g.kids.length);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/quizzes" className="text-sm font-medium text-brand">← Quiz scores</Link>
        <h1 className="mt-1 text-2xl font-bold">Record a quiz</h1>
        <p className="text-sm text-muted">Enter the quiz once and fill in a score for each child who took part. Parents see only their own child&apos;s scores.</p>
      </div>
      <Card><QuizForm groups={groups} today={today} /></Card>
    </div>
  );
}
