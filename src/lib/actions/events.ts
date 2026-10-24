"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registerForEvent(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/events");
  await supabase.from("event_registrations").upsert(
    { event_id: String(formData.get("event_id")), profile_id: data.user.id },
    { onConflict: "event_id,profile_id", ignoreDuplicates: true },
  );
  revalidatePath("/events");
}

export async function cancelEventRegistration(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/events");
  await supabase.from("event_registrations").delete().eq("event_id", String(formData.get("event_id"))).eq("profile_id", data.user.id);
  revalidatePath("/events");
}
