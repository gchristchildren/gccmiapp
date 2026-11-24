"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { isHttpsUrl, ukLocalToIso } from "@/lib/format";
import { notify } from "@/lib/push";
import { embedUrl } from "@/lib/video";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);

// ---------------------------------------------------------------- members
export async function registerMasterclass() {
  const { supabase, user } = await requireUser();
  await supabase.from("masterclass_memberships").upsert(
    { profile_id: user.id, year: new Date().getFullYear() },
    { onConflict: "profile_id,year", ignoreDuplicates: true },
  );
  revalidatePath("/portal/masterclass");
}

export async function toggleLesson(f: FormData) {
  const { supabase, user } = await requireUser();
  const lessonId = text(f, "lesson_id");
  if (f.get("done") === "1") {
    await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId).eq("profile_id", user.id);
  } else {
    await supabase.from("lesson_progress").upsert({ lesson_id: lessonId, profile_id: user.id }, { onConflict: "profile_id,lesson_id", ignoreDuplicates: true });
  }
  revalidatePath(`/portal/masterclass/${text(f, "slug")}`);
}

export async function claimCertificate(f: FormData) {
  const { supabase, user, profile } = await requireUser();
  const courseId = text(f, "course_id");
  // The database only allows this once every lesson of the course is complete.
  const { data } = await supabase
    .from("certificates")
    .upsert(
      { profile_id: user.id, course_id: courseId, holder_name: profile?.full_name || user.email || "GCCMI student" },
      { onConflict: "profile_id,course_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  const id = data?.id ?? (await supabase.from("certificates").select("id").eq("course_id", courseId).eq("profile_id", user.id).maybeSingle()).data?.id;
  if (!id) redirect(`/portal/masterclass/${text(f, "slug")}?error=${encodeURIComponent("Complete every lesson to earn your certificate.")}`);
  redirect(`/portal/masterclass/certificate/${id}`);
}

// ---------------------------------------------------------------- admin
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);

type Kind = "course" | "live" | "replay";
const kindOf = (f: FormData): Kind => (["course", "live", "replay"] as const).find((k) => k === text(f, "kind")) ?? "course";

/** Saves the live-class time and the private link (live or replay) that belong to a one-off Masterclass. */
async function saveOneOff(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], id: string, kind: Kind, f: FormData) {
  const url = text(f, "link_url");
  if (kind === "course") {
    await supabase.from("course_links").delete().eq("course_id", id);
    return;
  }
  // A live class keeps a live link, a replay keeps a replay link; the other kind of link is dropped.
  await supabase.from("course_links").delete().eq("course_id", id).neq("kind", kind);
  if (url) await supabase.from("course_links").upsert({ course_id: id, kind, url });
  else await supabase.from("course_links").delete().eq("course_id", id).eq("kind", kind);
}

function oneOffFields(f: FormData, page: string) {
  const kind = kindOf(f);
  const url = text(f, "link_url");
  if (url && !isHttpsUrl(url)) fail(page, "The link must start with https://");
  const when = text(f, "event_at");
  if (kind === "live" && !when) fail(page, "Give the live class a date and time.");
  return { kind, event_at: kind === "live" ? ukLocalToIso(when) : null };
}

export async function createCourse(f: FormData) {
  const { supabase } = await requireAdmin();
  const title = text(f, "title");
  if (!title) fail("/admin/masterclass", "A title is required.");
  const { kind, event_at } = oneOffFields(f, "/admin/masterclass");
  const { data, error } = await supabase.from("courses").insert({
    slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description: text(f, "description"),
    schedule_note: text(f, "schedule_note"),
    starts_on: text(f, "starts_on") || null,
    kind,
    event_at,
  }).select("id").single();
  if (error || !data) fail("/admin/masterclass", "Could not create it.");
  await saveOneOff(supabase, data!.id, kind, f);
  redirect(`/admin/masterclass/${data!.id}`);
}

export async function setCoursePublished(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  await supabase.from("courses").update({ published: f.get("published") === "1" }).eq("id", id);
  revalidatePath("/admin/masterclass", "layout");
  revalidatePath("/portal/masterclass", "layout");
  revalidatePath("/programmes/masterclass");
}

export async function addLesson(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "course_id");
  const page = `/admin/masterclass/${id}`;
  if (!text(f, "title")) fail(page, "A lesson title is required.");
  const video = text(f, "video_url");
  if (video && !embedUrl(video)) fail(page, "Video links must be YouTube or Vimeo (https://).");
  await supabase.from("lessons").insert({
    course_id: id,
    title: text(f, "title"),
    description: text(f, "description"),
    video_url: video || null,
    position: Number(text(f, "position")) || 0,
  });
  revalidatePath(page);
  redirect(page);
}

export async function deleteLesson(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("lessons").delete().eq("id", text(f, "id"));
  revalidatePath(`/admin/masterclass/${text(f, "course_id")}`);
}

export async function addResource(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "course_id");
  const page = `/admin/masterclass/${id}`;
  const url = text(f, "file_url");
  if (!text(f, "title") || !/^https:\/\//.test(url)) fail(page, "A title and an https:// link are required.");
  await supabase.from("course_resources").insert({ course_id: id, title: text(f, "title"), file_url: url });
  revalidatePath(page);
  redirect(page);
}

export async function deleteResource(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("course_resources").delete().eq("id", text(f, "id"));
  revalidatePath(`/admin/masterclass/${text(f, "course_id")}`);
}

export async function setMembershipStatus(f: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  const raw = text(f, "status");
  const status = (["pending", "active", "cancelled"] as const).find((x) => x === raw);
  if (!status) return { error: "Unknown status." };
  const { data } = await supabase.from("masterclass_memberships").update({ status }).eq("id", text(f, "id")).select("profile_id").single();
  if (status === "active" && data) {
    await notify(supabase, { kind: "profiles", ids: [data.profile_id] }, {
      kind: "manual", title: "Masterclass registration approved", body: "Welcome! Your lessons are ready.", url: "/portal/masterclass",
    }, user.id);
  }
  return {};
}

export async function updateCourse(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  const page = `/admin/masterclass/${id}`;
  if (!text(f, "title")) fail(page, "A title is required.");
  const { kind, event_at } = oneOffFields(f, page);
  const { data, error } = await supabase.from("courses").update({
    title: text(f, "title"),
    description: text(f, "description"),
    schedule_note: text(f, "schedule_note"),
    starts_on: text(f, "starts_on") || null,
    kind,
    event_at,
  }).eq("id", id).select("id");
  if (error || !data?.length) fail(page, "That change didn't go through.");
  await saveOneOff(supabase, id, kind, f);
  revalidatePath("/admin/masterclass", "layout");
  revalidatePath("/portal/masterclass", "layout");
  revalidatePath("/programmes/masterclass");
  redirect(`${page}?updated=1`);
}

/** Admin: approve or decline a parent's interest (a replay needs approval before the video link shows). */
export async function setInterestStatus(f: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  const raw = text(f, "status");
  const status = (["interested", "approved", "declined"] as const).find((x) => x === raw);
  if (!status) return { error: "Unknown status." };
  const courseId = text(f, "course_id");
  const profileId = text(f, "profile_id");
  const { data } = await supabase.from("masterclass_interest").update({ status }).eq("course_id", courseId).eq("profile_id", profileId).select("course_id").maybeSingle();
  if (status === "approved" && data) {
    const { data: c } = await supabase.from("courses").select("title, kind").eq("id", courseId).maybeSingle();
    await notify(supabase, { kind: "profiles", ids: [profileId] }, {
      kind: "manual",
      title: c?.kind === "replay" ? "Your replay access is ready" : "You're confirmed",
      body: c?.title ?? "Masterclass",
      url: "/portal/masterclass",
    }, user.id);
  }
  return {};
}

export async function deleteCourse(f: FormData): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const id = text(f, "id");
  // Lessons, downloads, progress, certificates and interest for this entry are deleted with it.
  const { data, error } = await supabase.from("courses").delete().eq("id", id).select("id");
  if (error || !data?.length) return { error: "That change didn't go through." };
  return {};
}
