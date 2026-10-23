import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Signed-in user and profile, or a redirect to /login. Use in portal and admin server components. */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  return { supabase, user: data.user, profile };
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") redirect("/portal");
  return ctx;
}
