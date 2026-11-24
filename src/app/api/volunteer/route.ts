import { NextResponse } from "next/server";
import type { Referee } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    skills?: unknown;
    referees?: unknown;
  } | null;

  const name = clip(b?.name, 200);
  const email = clip(b?.email, 254);
  if (!name || !emailRe.test(email)) {
    return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
  }
  const skills = Array.isArray(b?.skills) ? b.skills.map((s) => clip(s, 50)).filter(Boolean).slice(0, 12) : [];

  // Up to two referees. A referee needs a name and at least an email or a phone number; fully blank ones are ignored.
  const referees: Referee[] = [];
  for (const r of Array.isArray(b?.referees) ? b.referees.slice(0, 2) : []) {
    const rec = (r ?? {}) as Record<string, unknown>;
    const ref = { name: clip(rec.name, 200), relationship: clip(rec.relationship, 200), email: clip(rec.email, 254), phone: clip(rec.phone, 40) };
    if (!ref.name && !ref.relationship && !ref.email && !ref.phone) continue;
    if (!ref.name || (!ref.email && !ref.phone) || (ref.email && !emailRe.test(ref.email))) {
      return NextResponse.json({ error: "For each referee, please give a name and a valid email or phone number (or leave that referee blank)." }, { status: 400 });
    }
    referees.push({ ...ref, status: "not contacted" });
  }

  // The volunteers table allows anonymous inserts (status = 'new' only); admins read them in /admin.
  const supabase = await createClient();
  const { error } = await supabase.from("volunteers").insert({
    full_name: name,
    email,
    phone: clip(b?.phone, 40) || null,
    message: clip(b?.message, 2000) || null,
    skills,
    referees,
  });
  if (error) return NextResponse.json({ error: "We couldn't save your sign-up. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
