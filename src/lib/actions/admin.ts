"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { volunteerSkills } from "@/lib/content";
import { ageGroups, ukLocalToIso } from "@/lib/format";
import { notify, type Audience } from "@/lib/push";

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
  const aud = ["all", "bible_club", "academy", "masterclass"].includes(audience) ? audience : "all";
  const { error } = await supabase.from("announcements").insert({
    title: text(f, "title"),
    body: text(f, "body"),
    audience: aud,
    created_by: user.id,
  });
  if (error) fail("/admin/announcements", "Could not post the announcement.");
  if (f.get("send_push") === "on") {
    // Academy has no enrolment data yet, so it goes to everyone who has reminders on.
    const target: Audience = aud === "bible_club" ? { kind: "bible_club" } : aud === "masterclass" ? { kind: "masterclass" } : { kind: "all" };
    await notify(supabase, target, { kind: "announcement", title: text(f, "title"), body: text(f, "body").slice(0, 140), url: "/portal/announcements" }, user.id);
  }
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
  const { supabase, user } = await requireAdmin();
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
  if (f.get("send_push") === "on") {
    await notify(supabase, { kind: "all" }, { kind: "event", title: "New event added", body: title, url: "/events" }, user.id);
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function deleteEvent(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", text(f, "id"));
  revalidatePath("/admin", "layout");
  revalidatePath("/events");
  revalidatePath("/");
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

export async function sendManualNotification(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = text(f, "title");
  const body = text(f, "body");
  if (!title || !body) fail("/admin/notifications", "A title and message are required.");
  const url = text(f, "url");
  const audience = text(f, "audience");
  const target: Audience = audience === "bible_club" ? { kind: "bible_club" } : audience === "masterclass" ? { kind: "masterclass" } : { kind: "all" };
  const r = await notify(supabase, target, { kind: "manual", title, body, url: url.startsWith("/") ? url : "/portal" }, user.id);
  revalidatePath("/admin/notifications");
  if (r.skipped) fail("/admin/notifications", "Push isn't configured yet (missing VAPID keys).");
  redirect(`/admin/notifications?sent=${r.sent}`);
}

// ---------------------------------------------------------------- edit and delete
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOT_DONE = "That change didn't go through: you may not have permission yet, or the record no longer exists.";

export async function updateSession(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  const page = `/admin/sessions/${id}`;
  const group = text(f, "age_group");
  if (!text(f, "title") || !text(f, "starts_at")) fail(page, "Title and start time are required.");
  if (group !== "all" && !(ageGroups as readonly string[]).includes(group)) fail(page, "Choose an age group.");
  const { data, error } = await supabase.from("sessions").update({
    title: text(f, "title"),
    age_group: group,
    starts_at: ukLocalToIso(text(f, "starts_at")),
    venue: text(f, "venue"),
    memory_verse: text(f, "memory_verse") || null,
    lesson_summary: text(f, "lesson_summary") || null,
    published: f.get("published") === "on",
  }).eq("id", id).select("id");
  if (error || !data?.length) fail(page, NOT_DONE);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect(`${page}?updated=1`);
}

export async function deleteSession(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("sessions").delete().eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail(`/admin/sessions/${text(f, "id")}`, NOT_DONE);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/sessions");
}

export async function updateVolunteer(f: FormData) {
  const { supabase } = await requireAdmin();
  const email = text(f, "email");
  if (!text(f, "full_name") || !emailRe.test(email)) fail("/admin/volunteers", "A name and a valid email are required.");
  const status = text(f, "status");
  const { data, error } = await supabase.from("volunteers").update({
    full_name: text(f, "full_name"),
    email,
    phone: text(f, "phone") || null,
    message: text(f, "message") || null,
    skills: f.getAll("skills").map(String).filter((s) => volunteerSkills.includes(s)),
    status: ["new", "contacted", "active", "inactive"].includes(status) ? status : "new",
  }).eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/volunteers", NOT_DONE);
  revalidatePath("/admin", "layout");
  redirect("/admin/volunteers?updated=1");
}

export async function deleteVolunteer(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("volunteers").delete().eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/volunteers", NOT_DONE);
  revalidatePath("/admin", "layout");
  redirect("/admin/volunteers?deleted=1");
}

export async function updateParent(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("profiles").update({
    full_name: text(f, "full_name"),
    phone: text(f, "phone") || null,
  }).eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/families", NOT_DONE);
  revalidatePath("/admin", "layout");
  redirect("/admin/families?updated=1");
}

export async function updateChild(f: FormData) {
  const { supabase } = await requireAdmin();
  const dob = text(f, "date_of_birth");
  if (!text(f, "first_name") || !text(f, "last_name")) fail("/admin/families", "Both names are required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) fail("/admin/families", "Enter a valid date of birth.");
  if (!(ageGroups as readonly string[]).includes(text(f, "age_group"))) fail("/admin/families", "Choose an age group.");
  const { data, error } = await supabase.from("children").update({
    first_name: text(f, "first_name"),
    last_name: text(f, "last_name"),
    date_of_birth: dob,
    age_group: text(f, "age_group"),
    medical_notes: text(f, "medical_notes") || null,
    photo_consent: f.get("photo_consent") === "on",
  }).eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/families", NOT_DONE);
  revalidatePath("/admin", "layout");
  redirect("/admin/families?updated=1");
}

export async function deleteChildAdmin(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("children").delete().eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/families", NOT_DONE);
  revalidatePath("/admin", "layout");
  redirect("/admin/families?deleted=1");
}

/** Removes a parent's account and everything attached to it (children, registrations, consents). */
export async function deleteFamily(f: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_delete_family", { target: text(f, "id") });
  if (error) {
    const missing = /could not find the function|schema cache/i.test(error.message);
    fail("/admin/families", missing ? NOT_DONE : error.message || "Could not delete the family.");
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/families?deleted=1");
}

export async function updateConsentForm(f: FormData) {
  const { supabase } = await requireAdmin();
  const url = text(f, "file_url");
  if (!text(f, "title")) fail("/admin/forms", "A title is required.");
  if (url && !/^https:\/\//.test(url)) fail("/admin/forms", "The file link must start with https://");
  const { data, error } = await supabase.from("consent_forms").update({
    title: text(f, "title"),
    description: text(f, "description") || null,
    file_url: url || null,
    required: f.get("required") === "on",
  }).eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/forms", NOT_DONE);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/forms?updated=1");
}

export async function deleteConsentForm(f: FormData) {
  const { supabase } = await requireAdmin();
  // Parents' signatures for this form are deleted with it.
  const { data, error } = await supabase.from("consent_forms").delete().eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/forms", NOT_DONE);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/forms?deleted=1");
}

// ---------------------------------------------------------------- blog posts
const postSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70) || "post";
const coverOk = (u: string) => !u || /^(https:\/\/|\/)/.test(u);

export async function createPost(f: FormData) {
  const { supabase } = await requireAdmin();
  const title = text(f, "title");
  if (!title) fail("/admin/posts", "A title is required.");
  if (!coverOk(text(f, "cover_url"))) fail("/admin/posts", "The cover image link must start with https://");
  const date = text(f, "published_at");
  const { data, error } = await supabase.from("posts").insert({
    slug: `${postSlug(title)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    excerpt: text(f, "excerpt"),
    body: String(f.get("body") ?? "").trim(),
    cover_url: text(f, "cover_url") || null,
    published: f.get("published") === "on",
    ...(date ? { published_at: new Date(date + "T12:00:00Z").toISOString() } : {}),
  }).select("id").single();
  if (error || !data) fail("/admin/posts", "Could not save the post.");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/posts/${data!.id}?created=1`);
}

export async function updatePost(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  const page = `/admin/posts/${id}`;
  if (!text(f, "title")) fail(page, "A title is required.");
  if (!coverOk(text(f, "cover_url"))) fail(page, "The cover image link must start with https://");
  const date = text(f, "published_at");
  const { data, error } = await supabase.from("posts").update({
    title: text(f, "title"),
    excerpt: text(f, "excerpt"),
    body: String(f.get("body") ?? "").trim(),
    cover_url: text(f, "cover_url") || null,
    published: f.get("published") === "on",
    ...(date ? { published_at: new Date(date + "T12:00:00Z").toISOString() } : {}),
  }).eq("id", id).select("id, slug");
  if (error || !data?.length) fail(page, NOT_DONE);
  revalidatePath("/blog");
  revalidatePath(`/blog/${data![0].slug}`);
  revalidatePath("/");
  redirect(`${page}?updated=1`);
}

export async function deletePost(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("posts").delete().eq("id", text(f, "id")).select("id");
  if (error || !data?.length) fail("/admin/posts", NOT_DONE);
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/posts?deleted=1");
}
