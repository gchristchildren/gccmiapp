import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Claims = { sub?: string; email?: string; exp?: number };

function decode(token: string): Claims | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Signed-in user and profile, or a redirect to /login. Use in portal and admin server code.
 *
 * Fast path: the session token is read from the cookie (no network call) and the profile is fetched
 * with it. Supabase verifies the token's signature on that query and row-level security only returns
 * the profile for a valid token, so a forged or expired token gets no profile and is sent to /login.
 * Wrapped in cache() so the layout and the page of one request share a single lookup.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const claims = data.session ? decode(data.session.access_token) : null;
  if (!claims?.sub || (claims.exp && claims.exp * 1000 < Date.now())) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect("/login");

  return { supabase, user: { id: claims.sub, email: claims.email }, profile };
});

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/portal");
  return ctx;
}
