import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as { name?: string; email?: string; message?: string; website?: string } | null;
  // Hidden "website" field: real visitors leave it empty, bots fill it in. Pretend it worked.
  if (b?.website) return NextResponse.json({ ok: true });

  const name = clip(b?.name, 200);
  const email = clip(b?.email, 254);
  const message = clip(b?.message, 4000);
  if (!name || !emailRe.test(email) || !message) {
    return NextResponse.json({ error: "Please enter your name, a valid email and a message." }, { status: 400 });
  }
  // The contact_messages table allows anonymous inserts (status = 'new' only); admins read them in /admin/messages.
  const { error } = await (await createClient()).from("contact_messages").insert({ name, email, message });
  if (error) return NextResponse.json({ error: "We couldn't send your message. Please try again or email us." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
