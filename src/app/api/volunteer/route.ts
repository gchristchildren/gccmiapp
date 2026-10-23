import { NextResponse } from "next/server";
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
  } | null;

  const name = clip(b?.name, 200);
  const email = clip(b?.email, 254);
  if (!name || !emailRe.test(email)) {
    return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
  }
  const skills = Array.isArray(b?.skills) ? b.skills.map((s) => clip(s, 50)).filter(Boolean).slice(0, 12) : [];

  // The volunteers table allows anonymous inserts (status = 'new' only); admins read them in /admin.
  const supabase = await createClient();
  const { error } = await supabase.from("volunteers").insert({
    full_name: name,
    email,
    phone: clip(b?.phone, 40) || null,
    message: clip(b?.message, 2000) || null,
    skills,
  });
  if (error) return NextResponse.json({ error: "We couldn't save your sign-up. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
