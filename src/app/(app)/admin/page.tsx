import { AlertTriangle, ArrowRight, BookOpen, CalendarX, FileWarning, GraduationCap, HandHeart } from "lucide-react";
import Link from "next/link";
import { BarChart } from "@/components/app/Charts";
import { Card } from "@/components/ui";
import { dashboardStats } from "@/lib/admin-stats";
import { requireAdmin } from "@/lib/auth";
import { fmtDate, fmtMoney } from "@/lib/format";

export const metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/London" }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function AdminDashboard() {
  const { supabase, profile } = await requireAdmin();
  const s = await dashboardStats(supabase);
  const first = (profile?.full_name ?? "").split(" ")[0];

  const delta =
    s.attendanceRate30 != null && s.attendancePrev != null ? s.attendanceRate30 - s.attendancePrev : null;

  const kpis = [
    {
      label: "Attendance (30 days)",
      value: s.attendanceRate30 != null ? `${s.attendanceRate30}%` : "–",
      sub: s.attendanceRate30 == null ? "Mark attendance to see this" : delta != null ? `${delta >= 0 ? "+" : ""}${delta} pts vs previous 30 days` : "No earlier data to compare",
    },
    { label: "Registrations this month", value: String(s.registrationsThisMonth), sub: `${s.childRegs} ${s.childRegs === 1 ? "child" : "children"} · ${s.eventRegs} event sign-ups` },
    { label: "Donations this month", value: fmtMoney(s.donationsThisMonthPence), sub: `${s.donationsThisMonthCount} gifts` },
    { label: "Active families", value: String(s.families), sub: `${s.children} ${s.children === 1 ? "child" : "children"} registered` },
  ];

  const actions = [
    { n: s.actions.newVolunteers, title: "New volunteer sign-ups", body: "People are waiting to hear from you.", href: "/admin/volunteers", cta: "Review volunteers", icon: HandHeart, tone: "attention" },
    { n: s.actions.pendingMasterclass, title: "Masterclass registrations to approve", body: "Members get lessons once you approve them.", href: "/admin/masterclass", cta: "Review registrations", icon: GraduationCap, tone: "attention" },
    { n: s.actions.missingConsent, title: "Children missing consent forms", body: "Required forms not yet signed by a parent.", href: "/admin/families", cta: "See families", icon: FileWarning, tone: "critical" },
    { n: s.actions.sessionsWithoutVerse, title: "Sessions this week without a memory verse", body: "Parents see the verse after each session.", href: "/admin/sessions", cta: "Add verses", icon: BookOpen, tone: "attention" },
    { n: s.actions.quietEvents, title: "Events within 2 weeks with no sign-ups", body: "Consider an announcement to promote them.", href: "/admin/announcements", cta: "Post announcement", icon: CalendarX, tone: "attention" },
  ].filter((a) => a.n > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting()}{first ? `, ${first}` : ""}</h1>
        <p className="text-sm text-muted">Here&apos;s how GCCMI is doing.</p>
      </div>

      <Card className="grid gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`px-2 ${i ? "lg:border-l lg:border-line lg:pl-6" : ""}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.sub}</p>
          </div>
        ))}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Needing action today <span className="ml-1 rounded-full bg-line px-2 py-0.5 text-xs">{actions.length}</span></h2>
            </div>
            {actions.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {actions.map((a) => (
                  <div key={a.title} className={`flex flex-col rounded-2xl border p-4 ${a.tone === "critical" ? "border-red-500/30 bg-red-500/5" : "border-gold/30 bg-gold-soft"}`}>
                    <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${a.tone === "critical" ? "bg-red-500/15 text-red-600 dark:text-red-400" : "bg-gold/20 text-gold"}`}>
                      {a.tone === "critical" ? <AlertTriangle className="size-3" /> : <a.icon className="size-3" />}
                      {a.tone === "critical" ? "Critical" : "Needs attention"}
                    </span>
                    <p className="mt-3 text-2xl font-bold">{a.n}</p>
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="mt-1 flex-1 text-xs text-muted">{a.body}</p>
                    <Link href={a.href} className="mt-4 inline-flex items-center justify-center gap-1 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-soft">
                      {a.cta} <ArrowRight className="size-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-brand-soft p-4 text-sm text-brand">Nothing needs your attention right now.</p>
            )}
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="font-bold">Attendance by week</h2>
              <p className="mb-4 text-xs text-muted">Last 8 weeks, % present</p>
              <BarChart data={s.weekly.map((w) => ({ label: w.label, value: w.value, muted: !w.has }))} unit="%" emptyLabel="Attendance appears once you mark a session" />
            </Card>
            <Card>
              <h2 className="font-bold">Donations by month</h2>
              <p className="mb-4 text-xs text-muted">Last 6 months</p>
              <BarChart data={s.donationMonths} unit="£" emptyLabel="Donations appear once the Stripe webhook is connected" />
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-bold">Children at risk</h2>
            <p className="text-xs text-muted">Missed the last 3 sessions</p>
            <p className="mt-3 text-3xl font-bold">{s.atRisk.length}</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {s.atRisk.slice(0, 6).map((c) => (
                <li key={c.id} className="flex justify-between py-2">
                  <span>{c.first_name} {c.last_name}</span>
                  <span className="text-muted">Ages {c.age_group}</span>
                </li>
              ))}
              {!s.atRisk.length && <li className="py-2 text-muted">No one flagged.</li>}
            </ul>
          </Card>
          <Card>
            <h2 className="font-bold">Event turnout</h2>
            <p className="text-xs text-muted">Sign-ups for upcoming events</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {s.turnout.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0"><span className="block truncate font-medium">{e.title}</span><span className="text-xs text-muted">{fmtDate(e.starts_on)}</span></span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{e.count}</span>
                </li>
              ))}
              {!s.turnout.length && <li className="py-2 text-muted">No upcoming events. <Link href="/admin/events" className="font-medium text-brand">Add one</Link></li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
