import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Db = SupabaseClient<Database>;

const DAY = 86_400_000;

export type DashboardStats = Awaited<ReturnType<typeof dashboardStats>>;

/** Everything the admin dashboard shows, computed from RLS-protected tables (admins can read all). */
export async function dashboardStats(db: Db) {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const monthStart = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), 1)).toISOString();
  const sixMonthsAgo = new Date(now - 183 * DAY).toISOString();
  const eightWeeksAgo = now - 56 * DAY;

  const [families, children, sessions, attendance, events, regs, donations, volunteers, forms, sigs, pendingMasterclass] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parent"),
    db.from("children").select("id, first_name, last_name, age_group, created_at"),
    db.from("sessions").select("id, title, age_group, starts_at, memory_verse").gte("starts_at", new Date(eightWeeksAgo).toISOString()).order("starts_at"),
    db.from("attendance").select("session_id, child_id, present").limit(10_000),
    db.from("events").select("id, title, starts_on, category").gte("starts_on", today).order("starts_on"),
    db.from("event_registrations").select("event_id, created_at").limit(10_000),
    db.from("donations").select("amount_pence, created_at, donation_type").gte("created_at", sixMonthsAgo),
    db.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("consent_forms").select("id").eq("required", true),
    db.from("consent_signatures").select("form_id, child_id"),
    db.from("masterclass_memberships").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const kids = children.data ?? [];
  const sess = sessions.data ?? [];
  const att = attendance.data ?? [];
  const sessById = new Map(sess.map((s) => [s.id, s]));

  // Attendance rate: last 30 days, and per week for the last 8 weeks.
  const rate = (rows: typeof att) => (rows.length ? Math.round((rows.filter((r) => r.present).length / rows.length) * 100) : null);
  const inLast = (days: number) =>
    att.filter((a) => {
      const s = sessById.get(a.session_id);
      return s && new Date(s.starts_at).getTime() >= now - days * DAY;
    });
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const start = now - (8 - i) * 7 * DAY;
    const rows = att.filter((a) => {
      const t = new Date(sessById.get(a.session_id)?.starts_at ?? 0).getTime();
      return t >= start && t < start + 7 * DAY;
    });
    return { label: `W${i + 1}`, value: rate(rows) ?? 0, has: rows.length > 0 };
  });

  // Donations per month (last 6) and this month.
  const monthKey = (iso: string) => iso.slice(0, 7);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() - (5 - i), 1));
    return { key: d.toISOString().slice(0, 7), label: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), value: 0 };
  });
  for (const d of donations.data ?? []) {
    const m = months.find((x) => x.key === monthKey(d.created_at));
    if (m) m.value += d.amount_pence / 100;
  }
  const donationsThisMonth = (donations.data ?? []).filter((d) => d.created_at >= monthStart);

  // Registrations this month: new children plus event sign-ups.
  const childRegs = kids.filter((c) => c.created_at >= monthStart).length;
  const eventRegs = (regs.data ?? []).filter((r) => r.created_at >= monthStart).length;

  // Event turnout: sign-ups per upcoming event.
  const turnout = (events.data ?? []).slice(0, 6).map((e) => ({
    ...e,
    count: (regs.data ?? []).filter((r) => r.event_id === e.id).length,
  }));

  // Children at risk: absent (or unmarked) for each of the last 3 sessions that had attendance taken.
  const markedSessions = new Set(att.map((a) => a.session_id));
  const presentSet = new Set(att.filter((a) => a.present).map((a) => `${a.session_id}:${a.child_id}`));
  const atRisk = kids
    .map((c) => {
      const last3 = sess
        .filter((s) => markedSessions.has(s.id) && new Date(s.starts_at).getTime() < now && (s.age_group === "all" || s.age_group === c.age_group))
        .slice(-3);
      return { child: c, misses: last3.length === 3 && last3.every((s) => !presentSet.has(`${s.id}:${c.id}`)) };
    })
    .filter((x) => x.misses)
    .map((x) => x.child);

  // Needs action.
  const signed = new Set((sigs.data ?? []).map((s) => `${s.form_id}:${s.child_id}`));
  const missingConsent = kids.filter((c) => (forms.data ?? []).some((f) => !signed.has(`${f.id}:${c.id}`))).length;
  const noVerse = sess.filter((s) => {
    const t = new Date(s.starts_at).getTime();
    return t >= now && t < now + 7 * DAY && !s.memory_verse;
  }).length;
  const quietEvents = (events.data ?? []).filter((e) => new Date(e.starts_on).getTime() < now + 14 * DAY && !(regs.data ?? []).some((r) => r.event_id === e.id)).length;

  return {
    families: families.count ?? 0,
    children: kids.length,
    attendanceRate30: rate(inLast(30)),
    attendancePrev: rate(att.filter((a) => {
      const t = new Date(sessById.get(a.session_id)?.starts_at ?? 0).getTime();
      return t < now - 30 * DAY && t >= now - 60 * DAY;
    })),
    weekly,
    registrationsThisMonth: childRegs + eventRegs,
    childRegs,
    eventRegs,
    donationsThisMonthPence: donationsThisMonth.reduce((n, d) => n + d.amount_pence, 0),
    donationsThisMonthCount: donationsThisMonth.length,
    donationMonths: months,
    turnout,
    atRisk,
    actions: {
      newVolunteers: volunteers.count ?? 0,
      pendingMasterclass: pendingMasterclass.count ?? 0,
      missingConsent,
      sessionsWithoutVerse: noVerse,
      quietEvents,
    },
  };
}
