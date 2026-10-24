"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { volunteerSkills } from "@/lib/content";
import { notify } from "@/lib/push";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const pickSkills = (f: FormData) => f.getAll("skills").map(String).filter((s) => volunteerSkills.includes(s));

export async function saveMySkills(f: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ skills: pickSkills(f) }).eq("id", user.id);
  revalidatePath("/portal/volunteering");
}

export async function signUpForOpportunity(f: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("opportunity_signups").upsert(
    { opportunity_id: text(f, "opportunity_id"), profile_id: user.id },
    { onConflict: "opportunity_id,profile_id", ignoreDuplicates: true },
  );
  revalidatePath("/portal/volunteering");
}

export async function withdrawFromOpportunity(f: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("opportunity_signups").delete().eq("opportunity_id", text(f, "opportunity_id")).eq("profile_id", user.id);
  revalidatePath("/portal/volunteering");
}

// ---------------------------------------------------------------- admin
export async function createOpportunity(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = text(f, "title");
  if (!title) redirect(`/admin/opportunities?error=${encodeURIComponent("A title is required.")}`);
  const skills = pickSkills(f);
  const { error } = await supabase.from("volunteer_opportunities").insert({
    title,
    description: text(f, "description"),
    skills,
    event_id: text(f, "event_id") || null,
    starts_on: text(f, "starts_on") || null,
  });
  if (error) redirect(`/admin/opportunities?error=${encodeURIComponent("Could not save the opportunity.")}`);

  if (f.get("send_push") === "on" && skills.length) {
    // Tell people whose saved skills overlap with what this role needs.
    const { data: people } = await supabase.from("profiles").select("id").overlaps("skills", skills);
    const ids = (people ?? []).map((p) => p.id);
    if (ids.length) {
      await notify(supabase, { kind: "profiles", ids }, {
        kind: "opportunity", title: "A volunteer role matches your skills", body: title, url: "/portal/volunteering",
      }, user.id);
    }
  }
  revalidatePath("/admin/opportunities");
  revalidatePath("/volunteer");
  redirect("/admin/opportunities");
}

export async function setOpportunityPublished(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("volunteer_opportunities").update({ published: f.get("published") === "1" }).eq("id", text(f, "id"));
  revalidatePath("/admin/opportunities");
  revalidatePath("/volunteer");
}

export async function deleteOpportunity(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("volunteer_opportunities").delete().eq("id", text(f, "id"));
  revalidatePath("/admin/opportunities");
  revalidatePath("/volunteer");
}
