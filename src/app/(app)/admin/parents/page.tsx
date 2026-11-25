import { Download } from "lucide-react";
import Link from "next/link";
import { SaveAudienceForm } from "@/components/SaveAudienceForm";
import { Card } from "@/components/ui";
import { applyAudience, audienceQuery, isFiltered, kidBands, loadParents, NO_COUNTRY, parseAudience } from "@/lib/audience";
import { requireAdmin } from "@/lib/auth";
import { ageGroups, ageLabel, fmtDate } from "@/lib/format";

export const metadata = { title: "Parents" };
export const dynamic = "force-dynamic";

const SHOW = 200;
const bandLabel: Record<string, string> = { none: "No children", "1": "1 child", "2": "2 children", "3+": "3 or more" };

export default async function Parents({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const filter = parseAudience(params);
  const all = await loadParents(supabase);
  const rows = applyAudience(all, filter);
  const qs = audienceQuery(filter);
  const link = (kind: string) => `/admin/parents/export?kind=${kind}${qs ? `&${qs}` : ""}`;

  const countryList = [...new Set(all.map((r) => r.country).filter(Boolean))].sort();
  const notGiven = all.filter((r) => !r.country).length;
  const kidsTotal = rows.reduce((n, r) => n + r.children.length, 0);
  const field = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm";
  const tri = (name: string, label: string, value: string) => (
    <label className="text-sm font-medium">
      {label}
      <select name={name} defaultValue={value === "any" ? "" : value} className={field}>
        <option value="">Any</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
  const sendingToNonConsenting = rows.some((r) => !r.news);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Parents</h1>
        <p className="text-sm text-muted">
          {all.length} {all.length === 1 ? "parent" : "parents"} in total. Choose who you want to see, then download their details.
        </p>
      </div>

      <Card className="p-5">
        <form method="get" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium sm:col-span-2">
              Name or email
              <input name="q" defaultValue={filter.q} className={field} placeholder="Search…" />
            </label>
            <label className="text-sm font-medium">
              Joined from
              <input type="date" name="from" defaultValue={filter.from} className={field} />
            </label>
            <label className="text-sm font-medium">
              Joined to
              <input type="date" name="to" defaultValue={filter.to} className={field} />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Country (hold Ctrl or Cmd to choose several)
              <select name="country" multiple size={6} defaultValue={filter.countries} className={field}>
                <option value={NO_COUNTRY}>Not given ({notGiven})</option>
                {countryList.map((c) => (
                  <option key={c} value={c}>{c} ({all.filter((r) => r.country === c).length})</option>
                ))}
              </select>
            </label>
            <fieldset className="text-sm">
              <legend className="font-medium">Number of children</legend>
              <div className="mt-2 space-y-1">
                {kidBands.map((b) => (
                  <label key={b} className="flex items-center gap-2">
                    <input type="checkbox" name="kids" value={b} defaultChecked={filter.kids.includes(b)} className="accent-brand" /> {bandLabel[b]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="text-sm">
              <legend className="font-medium">Has a child in</legend>
              <div className="mt-2 space-y-1">
                {ageGroups.map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input type="checkbox" name="age" value={g} defaultChecked={filter.ages.includes(g)} className="accent-brand" /> {ageLabel(g)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {tri("mc", "Masterclass member", filter.masterclass)}
            {tri("push", "Notifications on", filter.push)}
            {tri("news", "Agreed to news emails", filter.news)}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90">Show these parents</button>
            {isFiltered(filter) && (
              <Link href="/admin/parents" className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold hover:bg-brand-soft">Clear</Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <p className="text-lg font-bold">
          {rows.length} {rows.length === 1 ? "parent" : "parents"}, {kidsTotal} {kidsTotal === 1 ? "child" : "children"}
          {isFiltered(filter) && <span className="text-sm font-normal text-muted"> (of {all.length})</span>}
        </p>
        <p className="mt-1 text-sm text-muted">
          {rows.filter((r) => r.pushOn).length} have notifications on · {rows.filter((r) => r.news).length} agreed to news emails
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={link("emails")} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90">
            <Download className="h-4 w-4" aria-hidden /> Download emails
          </a>
          <a href={link("full")} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-brand-soft">
            <Download className="h-4 w-4" aria-hidden /> Download full list with children
          </a>
        </div>
        {isFiltered(filter) && rows.length > 0 && (
          <>
            <SaveAudienceForm query={qs} />
            <p className="mt-3 text-sm">
              <Link href={`/admin/notifications?aud=${encodeURIComponent(qs)}`} className="font-semibold text-brand hover:underline">
                Send a notification to these {rows.filter((r) => r.pushOn).length} parents with notifications on →
              </Link>
            </p>
          </>
        )}
        {sendingToNonConsenting && rows.length > 0 && (
          <p className="mt-3 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Some of these parents have not agreed to news emails. Use these addresses only for things about their own children and classes. For newsletters or fundraising, set “Agreed to news emails” to Yes first. Every download is recorded.
          </p>
        )}
      </Card>

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-brand-soft text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Children</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, SHOW).map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">{r.name || "(no name)"}</p>
                  <p className="break-all text-xs text-muted">{r.email}</p>
                  {r.phone && <p className="text-xs text-muted">{r.phone}</p>}
                </td>
                <td className="px-4 py-3">{r.country || <span className="text-muted">Not given</span>}</td>
                <td className="px-4 py-3">
                  {r.children.length ? (
                    <ul className="space-y-0.5">
                      {r.children.map((c, i) => <li key={i}>{c.name} <span className="text-xs text-muted">· {ageLabel(c.ageGroup)}</span></li>)}
                    </ul>
                  ) : <span className="text-muted">None</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.joined)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.lastSignIn ? fmtDate(r.lastSignIn) : <span className="text-muted">Never</span>}</td>
                <td className="px-4 py-3 text-xs">
                  {r.pushOn && <span className="mr-1 rounded-full bg-brand-soft px-2 py-0.5">Notifications</span>}
                  {r.masterclass && <span className="mr-1 rounded-full bg-brand-soft px-2 py-0.5">Masterclass</span>}
                  {r.news && <span className="rounded-full bg-brand-soft px-2 py-0.5">News emails</span>}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No parents match these choices.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > SHOW && <p className="text-sm text-muted">Showing the first {SHOW}. Downloads include all {rows.length}.</p>}
    </div>
  );
}
