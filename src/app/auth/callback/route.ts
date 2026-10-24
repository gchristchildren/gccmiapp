import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation / magic-link landing: swaps the code for a session, then continues to `next`. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(safeNext === "/reset-password" ? `${origin}/forgot-password?error=expired` : `${origin}/login?error=auth`);
}
