"use server";

import { requireUser } from "@/lib/auth";

type SubscriptionJson = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function savePushSubscription(sub: SubscriptionJson) {
  const { supabase, user } = await requireUser();
  const { endpoint, keys } = sub;
  if (!endpoint?.startsWith("https://") || !keys?.p256dh || !keys.auth) return { ok: false as const };
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ profile_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });
  return { ok: !error };
}

export async function removePushSubscription(endpoint: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("profile_id", user.id);
  return { ok: true as const };
}
