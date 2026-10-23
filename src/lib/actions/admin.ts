"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ageGroups, ukLocalToIso } from "@/lib/format";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);

// Every action re-checks admin: the UI hiding a button is not a security boundary.

export async function createSession(f: FormData) {
  const { supabase } = await requireAdmin();
  const group = text(f, "age_group");
  if (!text(f, "title") || !text(f, "starts_at")) fail("/admin/sessions", "Title and start time are required.");
  if (group !== "all" && !(ageGroups as readonly string[]).includes(group)) fail("/admin/sessions", "Choose an age group.");
  const { error } = await supabase.from("sessions").insert({
    title: text(f, "title"),
    age_group: group,
    starts_at: ukLocalToIso(text(f, "starts_at")),
    venue: text(f, "venue"),
    memory_verse: text(f, "memory_verse") || null,
    lesson_summary: text(f, "lesson_summary") || null,
  });
  if (error) fail("/admin/sessions", "Could not save the session.");
  revalidatePath("/admin", "layout");
  redirect("/admin/sessions");
}

export async function updateSessionContent(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  await supabase.from("sessions").update({
    memory_verse: text(f, "memory_verse") || null,
    lesson_summary: text(f, "lesson_summary") || null,
  }).eq("id", id);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

export async function saveAttendance(f: FormData) {
  const { supabase } = await requireAdmin();
  const sessionId = text(f, "session_id");
  const present = new Set(f.getAll("present").map(String));
  const childIds = f.getAll("child").map(String);
  const rows = childIds.map((child_id) => ({ session_id: sessionId, child_id, present: present.has(child_id) }));
  if (rows.length) await supabase.from("attendance").upsert(rows, { onConflict: "session_id,child_id" });
  revalidatePath("/admin", "layout");
  redirect(`/admin/sessions/${sessionId}?saved=1`);
}

export async function createAnnouncement(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const audience = text(f, "audience");
  if (!text(f, "title") || !text(f, "body")) fail("/admin/announcements", "Title and message are required.");
  const { error } = await supabase.from("announcements").insert({
    title: text(f, "title"),
    body: text(f, "body"),
    audience: ["all", "bible_club", "academy", "masterclass"].includes(audience) ? audience : "all",
    created_by: user.id,
  });
  if (error) fail("/admin/announcements", "Could not post the announcement.");
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("announcements").delete().eq("id", text(f, "id"));
  revalidatePath("/admin/announcements");
  revalidatePath("/portal", "layout");
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

export async function createEvent(f: FormData) {
  const { supabase } = await requireAdmin();
  const title = text(f, "title");
  if (!title || !text(f, "starts_on")) fail("/admin/events", "Title and date are required.");
  const { error } = await supabase.from("events").insert({
    slug: `${slugify(title)}-${text(f, "starts_on")}`,
    title,
    category: text(f, "category"),
    starts_on: text(f, "starts_on"),
    time_label: text(f, "time_label"),
    venue: text(f, "venue"),
    address: text(f, "address"),
    summary: text(f, "summary"),
    register_url: text(f, "register_url") || null,
  });
  if (error) fail("/admin/events", "Could not save the event (check the category and that it isn't a duplicate).");
  revalidatePath("/admin", "layout");
  redirect("/admin/events");
}

export async function deleteEvent(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", text(f, "id"));
  revalidatePath("/admin", "layout");
}

export async function createConsentForm(f: FormData) {
  const { supabase } = await requireAdmin();
  if (!text(f, "title")) fail("/admin/forms", "A title is required.");
  const url = text(f, "file_url");
  if (url && !/^https:\/\//.test(url)) fail("/admin/forms", "The file link must start with https://");
  await supabase.from("consent_forms").insert({
    title: text(f, "title"),
    description: text(f, "description") || null,
    file_url: url || null,
    required: f.get("required") === "on",
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/forms");
}

export async function setVolunteerStatus(f: FormData) {
  const { supabase } = await requireAdmin();
  const status = text(f, "status");
  if (!["new", "contacted", "active", "inactive"].includes(status)) return;
  await supabase.from("volunteers").update({ status }).eq("id", text(f, "id"));
  revalidatePath("/admin", "layout");
}
