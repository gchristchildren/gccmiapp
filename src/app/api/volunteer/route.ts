import { NextResponse } from "next/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    skills?: string[];
  } | null;

  if (!b?.name?.trim() || !emailRe.test(b.email ?? "")) {
    return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
  }

  // Phase 2: persist to Supabase (volunteers table) and notify admins.
  // Until then we refuse, so nobody believes a sign-up was saved when it was not.
  return NextResponse.json({ error: "Volunteer sign-up opens soon. Please check back shortly." }, { status: 503 });
}
