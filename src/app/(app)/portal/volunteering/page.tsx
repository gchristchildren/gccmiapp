import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { volunteerSkills } from "@/lib/content";
import { fmtDate } from "@/lib/format";
import { saveMySkills, signUpForOpportunity, withdrawFromOpportunity } from "@/lib/actions/volunteering";

export const metadata = { title: "Volunteering" };
export const dynamic = "force-dynamic";

export default async function Volunteering() {
  const { supabase, user, profile } = await requireUser();
  const [{ data: opps }, { data: mine }] = await Promise.all([
    supabase.from("volunteer_opportunities").select("*").eq("published", true),
    supabase.from("opportunity_signups").select("opportunity_id").eq("profile_id", user.id),
  ]);
  const skills = new Set(profile?.skills ?? []);
  const signed = new Set((mine ?? []).map((m) => m.opportunity_id));
  const matches = (o: { skills: string[] }) => o.skills.filter((s) => skills.has(s)).length;
  const sorted = [...(opps ?? [])].sort((a, b) => matches(b) - matches(a) || (a.starts_on ?? "9").localeCompare(b.starts_on ?? "9"));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Volunteering</h1>

      <Card>
        <h2 className="font-bold">Your skills</h2>
        <p className="text-sm text-muted">Tell us what you can help with and we&apos;ll point you to roles that fit.</p>
        <form action={saveMySkills} className="mt-4">
          <div className="flex flex-wrap gap-2">
            {volunteerSkills.map((s) => (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" name="skills" value={s} defaultChecked={skills.has(s)} className="peer sr-only" />
                <span className="inline-block rounded-full border border-line px-4 py-1.5 text-sm transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand">{s}</span>
              </label>
            ))}
          </div>
          <button className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-brand-soft">Save skills</button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="font-bold">Open opportunities</h2>
        {sorted.map((o) => (
          <Card key={o.id} className="p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold">{o.title}</p>
                {o.starts_on && <p className="text-xs text-muted">{fmtDate(o.starts_on)}</p>}
                {matches(o) > 0 && <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand"><Sparkles className="size-3" /> Matches your skills</p>}
                {o.description && <p className="mt-2 text-muted">{o.description}</p>}
                {!!o.skills.length && <p className="mt-2 text-xs text-muted">Skills needed: {o.skills.join(", ")}</p>}
              </div>
              <form action={signed.has(o.id) ? withdrawFromOpportunity : signUpForOpportunity}>
                <input type="hidden" name="opportunity_id" value={o.id} />
                <button className={`rounded-full px-5 py-2.5 font-semibold ${signed.has(o.id) ? "border border-line hover:bg-brand-soft" : "bg-brand text-brand-fg hover:opacity-90"}`}>
                  {signed.has(o.id) ? "Signed up · withdraw" : "Sign up"}
                </button>
              </form>
            </div>
          </Card>
        ))}
        {!sorted.length && <p className="text-sm text-muted">No open opportunities right now. We&apos;ll notify you when one comes up.</p>}
      </div>
    </div>
  );
}
