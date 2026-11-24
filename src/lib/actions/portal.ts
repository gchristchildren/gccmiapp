"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { countries } from "@/lib/countries";
import { ageGroups, CONSENT_VERSION } from "@/lib/format";

const back = (path: string, error: string): never => redirect(`${path}?error=${encodeURIComponent(error)}`);

const photoFlags = (f: FormData) => ({
  photo_website: f.get("photo_website") === "on",
  photo_social: f.get("photo_social") === "on",
  photo_print: f.get("photo_print") === "on",
  photo_funding: f.get("photo_funding") === "on",
});

export async function addChild(formData: FormData) {
  const { supabase, user } = await requireUser();
  const first = String(formData.get("first_name") ?? "").trim();
  const last = String(formData.get("last_name") ?? "").trim();
  const dob = String(formData.get("date_of_birth") ?? "");
  const group = String(formData.get("age_group") ?? "");

  if (!first || !last) back("/portal/children", "Please enter your child's first and last name.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || new Date(dob) > new Date()) back("/portal/children", "Please enter a valid date of birth.");
  if (!(ageGroups as readonly string[]).includes(group)) back("/portal/children", "Please choose an age group.");
  if (formData.get("consent") !== "on") back("/portal/children", "Please tick the consent box to register your child.");

  const { error } = await supabase.from("children").insert({
    parent_id: user.id,
    first_name: first,
    last_name: last,
    date_of_birth: dob,
    age_group: group,
    medical_notes: String(formData.get("medical_notes") ?? "").trim() || null,
    ...photoFlags(formData),
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  });
  if (error) back("/portal/children", "We couldn't save that. Please try again.");
  revalidatePath("/portal", "layout");
  redirect("/portal/children?added=1");
}

export async function deleteChild(formData: FormData) {
  const { supabase } = await requireUser();
  // RLS limits this to the signed-in parent's own children.
  await supabase.from("children").delete().eq("id", String(formData.get("id")));
  revalidatePath("/portal", "layout");
}

export async function signConsent(formData: FormData) {
  const { supabase, user } = await requireUser();
  // RLS only allows signing for the parent's own children.
  await supabase.from("consent_signatures").insert({
    form_id: String(formData.get("form_id")),
    child_id: String(formData.get("child_id")),
    signed_by: user.id,
  });
  revalidatePath("/portal", "layout");
}

/** Parents choose, per use, where photos and video of their child may appear. */
export async function updatePhotoPermissions(formData: FormData) {
  const { supabase } = await requireUser();
  // RLS limits this to the signed-in parent's own children.
  const { data, error } = await supabase.from("children").update(photoFlags(formData)).eq("id", String(formData.get("id"))).select("id");
  if (error || !data?.length) back("/portal/children", "We couldn't save that. Please try again.");
  revalidatePath("/portal", "layout");
  redirect("/portal/children?photos=1");
}

/** For children registered before the consent wording existed: the parent confirms it now. */
export async function confirmConsent(formData: FormData) {
  const { supabase } = await requireUser();
  if (formData.get("consent") !== "on") back("/portal/children", "Please tick the consent box to confirm.");
  const { data, error } = await supabase.from("children")
    .update({ consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION })
    .eq("id", String(formData.get("id"))).select("id");
  if (error || !data?.length) back("/portal/children", "We couldn't save that. Please try again.");
  revalidatePath("/portal", "layout");
  redirect("/portal/children?consented=1");
}

export async function updateCountry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const country = String(formData.get("country") ?? "").trim();
  if (!countries.includes(country)) back("/portal", "Please choose your country from the list.");
  await supabase.from("profiles").update({ country }).eq("id", user.id);
  revalidatePath("/portal", "layout");
  redirect("/portal");
}
