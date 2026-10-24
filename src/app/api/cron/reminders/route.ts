import { NextResponse } from "next/server";
import { notify } from "@/lib/push";
import { createServiceClient } from "@/lib/supabase/admin";

const londonDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });

/**
 * Daily reminders ("Bible Club starts tomorrow", "Your event is tomorrow").
 * Called by Vercel Cron (see vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 * Each reminder is claimed in reminder_log first, so a retry never sends twice.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  let db;
  try {
    db = createServiceClient();
  } catch {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 500 });
  }

  const tomorrow = londonDate(new Date(Date.now() + 86_400_000));
  const claim = async (key: string) => {
    const { error } = await db.from("reminder_log").insert({ key });
    return !error; // a duplicate key means it was already sent
  };
  const results: string[] = [];

  // Bible Club sessions tomorrow -> parents whose children are in that age group.
  const { data: sessions } = await db.from("sessions").select("*").eq("published", true)
    .gte("starts_at", new Date(Date.now() - 86_400_000).toISOString())
    .lte("starts_at", new Date(Date.now() + 3 * 86_400_000).toISOString());
  for (const s of sessions ?? []) {
    if (londonDate(new Date(s.starts_at)) !== tomorrow || !(await claim(`session:${s.id}:tomorrow`))) continue;
    const kids = s.age_group === "all"
      ? await db.from("children").select("parent_id")
      : await db.from("children").select("parent_id").eq("age_group", s.age_group);
    const ids = [...new Set((kids.data ?? []).map((k) => k.parent_id))];
    const time = new Date(s.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
    const r = await notify(db, { kind: "profiles", ids }, {
      kind: "reminder", title: "Bible Club starts tomorrow", body: `${s.title} at ${time}${s.venue ? `, ${s.venue}` : ""}`, url: "/portal/schedule",
    });
    results.push(`session ${s.title}: ${r.skipped ? "push not configured" : `${r.sent} sent`}`);
  }

  // Events tomorrow -> people registered for them.
  const { data: events } = await db.from("events").select("*").eq("published", true).eq("starts_on", tomorrow);
  for (const e of events ?? []) {
    if (!(await claim(`event:${e.id}:tomorrow`))) continue;
    const { data: regs } = await db.from("event_registrations").select("profile_id").eq("event_id", e.id);
    const r = await notify(db, { kind: "profiles", ids: (regs ?? []).map((x) => x.profile_id) }, {
      kind: "reminder", title: `${e.title} is tomorrow`, body: [e.time_label, e.venue].filter(Boolean).join(" · ") || "See you there!", url: "/events",
    });
    results.push(`event ${e.title}: ${r.skipped ? "push not configured" : `${r.sent} sent`}`);
  }

  return NextResponse.json({ ok: true, date: tomorrow, results });
}
