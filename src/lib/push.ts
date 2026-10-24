import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { Database } from "@/lib/database.types";

type Db = SupabaseClient<Database>;

export type Audience =
  | { kind: "all" }
  | { kind: "bible_club" } // parents with at least one registered child
  | { kind: "masterclass" } // active Masterclass members
  | { kind: "profiles"; ids: string[] };

export type PushMessage = {
  title: string;
  body: string;
  url?: string;
  kind: Database["public"]["Tables"]["notifications"]["Row"]["kind"];
};

export function pushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@gccmi.co.uk",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

/** Push subscriptions for an audience. `db` must be allowed to read them (an admin client or the service role). */
export async function subscriptionsFor(db: Db, audience: Audience) {
  let ids: string[] | null = null;
  if (audience.kind === "profiles") {
    ids = audience.ids;
  } else if (audience.kind === "bible_club") {
    const { data } = await db.from("children").select("parent_id");
    ids = [...new Set((data ?? []).map((c) => c.parent_id))];
  } else if (audience.kind === "masterclass") {
    const { data } = await db.from("masterclass_memberships").select("profile_id").eq("status", "active");
    ids = [...new Set((data ?? []).map((m) => m.profile_id))];
  }
  if (ids && !ids.length) return [];
  const query = db.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  const { data } = await (ids ? query.in("profile_id", ids) : query);
  return data ?? [];
}

/**
 * Sends a notification to an audience and records it in the notifications log.
 * Expired subscriptions (404/410 from the push service) are removed.
 */
export async function notify(db: Db, audience: Audience, msg: PushMessage, createdBy?: string) {
  if (!pushConfigured()) return { sent: 0, failed: 0, skipped: true as const };
  configure();

  const subs = await subscriptionsFor(db, audience);
  const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url ?? "/portal" });
  const expired: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86_400, timeout: 8000 });
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(s.id);
        failed++;
      }
    }),
  );

  if (expired.length) await db.from("push_subscriptions").delete().in("id", expired);
  await db.from("notifications").insert({
    title: msg.title,
    body: msg.body,
    url: msg.url ?? null,
    kind: msg.kind,
    sent_count: sent,
    created_by: createdBy ?? null,
  });
  return { sent, failed, skipped: false as const };
}
