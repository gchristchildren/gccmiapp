"use server";

import { applyAudience, audienceQuery, loadParents, parseQuery } from "@/lib/audience";
import { requireAdmin } from "@/lib/auth";
import { notify } from "@/lib/push";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export type GroupResult = { error?: string; ok?: string };

/** Saves the current Parents-page selection under a name. Returns instead of redirecting. */
export async function saveAudience(f: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  const name = text(f, "name");
  if (!name) return { error: "Give this group a name." };
  if (name.length > 80) return { error: "That name is too long." };
  // Normalise through the parser so only known filter fields are stored.
  const query = audienceQuery(parseQuery(text(f, "query")));
  const { error } = await supabase.from("saved_audiences").insert({ name, query, created_by: user.id });
  return error ? { error: "Could not save that group." } : {};
}

export async function deleteAudience(f: FormData): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("saved_audiences").delete().eq("id", text(f, "id"));
  return error ? { error: "Could not delete that group." } : {};
}

/** Sends a push notification to the parents in a saved group, or the current selection from the Parents page. */
export async function sendGroupNotification(_: GroupResult, f: FormData): Promise<GroupResult> {
  const { supabase, user } = await requireAdmin();
  const title = text(f, "title");
  const body = text(f, "body");
  if (!title || !body) return { error: "A title and message are required." };
  const url = text(f, "url");
  const choice = text(f, "audience");

  let query: string;
  if (choice.startsWith("saved:")) {
    const { data } = await supabase.from("saved_audiences").select("query").eq("id", choice.slice(6)).maybeSingle();
    if (!data) return { error: "That group no longer exists." };
    query = data.query;
  } else if (choice.startsWith("custom:")) {
    query = choice.slice(7);
  } else return { error: "Choose who to send this to." };

  const rows = applyAudience(await loadParents(supabase), parseQuery(query));
  if (!rows.length) return { error: "No parents match this group, so nothing was sent." };
  const reachable = rows.filter((r) => r.pushOn).map((r) => r.id);
  if (!reachable.length) return { error: `None of the ${rows.length} parents in this group have notifications on, so nothing was sent.` };

  const r = await notify(supabase, { kind: "profiles", ids: reachable }, { kind: "manual", title, body: body.slice(0, 140), url: url.startsWith("/") ? url : "/portal" }, user.id);
  if (r.skipped) return { error: "Push isn't configured yet (missing VAPID keys)." };
  return { ok: `Sent to ${r.sent} device${r.sent === 1 ? "" : "s"} for ${reachable.length} of ${rows.length} parents in this group.${r.failed ? ` ${r.failed} could not be reached.` : ""}` };
}
