import Link from "next/link";
import { BarChart } from "@/components/app/Charts";
import { Card } from "@/components/ui";
import { loadAnalytics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth";
import { ageLabel, fmtDate } from "@/lib/format";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export default async function Analytics() {
  const { supabase } = await requireAdmin();
  const a = await loadAnalytics(supabase);
  const t = a.totals;
  const pct = (n: number) => (t.parents ? `${Math.round((n / t.parents) * 100)}%` : "–");
  const topCountries = a.countriesSorted.slice(0, 10);
  const maxCountry = Math.max(...topCountries.map((c) => c[1]), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted">Who our parents are and how they use the portal. Countries are the ones parents told us.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Parents" value={t.parents} hint={`${t.new30} joined in the last 30 days`} />
        <Stat label="Children" value={t.children} hint={`${t.withKids} parents have registered a child`} />
        <Stat label="Active in 7 days" value={t.active7} hint={`${t.active30} in 30 days · ${t.neverSignedIn} never signed in`} />
        <Stat label="Notifications on" value={pct(t.pushOn)} hint={`${t.pushOn} parents · ${pct(t.news)} agreed to news emails`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">New parents by month</h2>
          <div className="mt-4"><BarChart data={a.months} /></div>
        </Card>
        <Card>
          <h2 className="font-bold">Children by age group</h2>
          <div className="mt-4"><BarChart data={a.ageCounts.map((g) => ({ label: ageLabel(g.group), value: g.value }))} /></div>
        </Card>
        <Card>
          <h2 className="font-bold">Children per family</h2>
          <div className="mt-4"><BarChart data={a.perFamily} /></div>
        </Card>
        <Card>
          <h2 className="font-bold">Where parents live</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topCountries.map(([c, n]) => (
              <li key={c}>
                <div className="flex justify-between">
                  {c === "Not given" ? <span className="text-muted">Not given</span> : <Link href={`/admin/parents?country=${encodeURIComponent(c)}`} className="font-medium text-brand hover:underline">{c}</Link>}
                  <span>{n}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-line"><div className="h-2 rounded-full bg-brand" style={{ width: `${(n / maxCountry) * 100}%` }} /></div>
              </li>
            ))}
            {a.countriesSorted.length > 10 && <li className="text-xs text-muted">and {a.countriesSorted.length - 10} more. Use the Parents page to filter by any country.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-bold">Sign-ins</h2>
        <p className="text-sm text-muted">
          {a.tracking.since
            ? `Recording since ${fmtDate(a.tracking.since)}. ${a.tracking.last30} sign-ins in the last 30 days, about ${a.tracking.perActiveParentPerWeek} a week for each parent who signed in.`
            : "Recording has just started. Charts fill in as parents sign in. Before this, only each parent’s latest sign-in is known (see Active in 7 days above)."}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div><h3 className="mb-2 text-sm font-semibold">Per week (last 8 weeks)</h3><BarChart data={a.weeks} /></div>
          <div><h3 className="mb-2 text-sm font-semibold">Busiest days (last 90 days)</h3><BarChart data={a.byDay} /></div>
        </div>
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold">Busiest hours, UK time (last 90 days)</h3>
          <BarChart data={a.byHour} height={140} />
        </div>
      </Card>
    </div>
  );
}
