"use client";

import { Play, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  courseId: string;
  profileId: string;
  kind: "live" | "replay";
  /** The parent's current standing for this class, if any. */
  status?: "interested" | "approved" | "declined";
  /** The private link. The database only returns it when this parent is allowed to see it right now. */
  url?: string;
};

/** "I'm interested" for a one-off live class, or "Request access" for a replay. */
export function InterestButton({ courseId, profileId, kind, status, url }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(add: boolean) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = add
      ? await supabase.from("masterclass_interest").insert({ course_id: courseId, profile_id: profileId })
      : await supabase.from("masterclass_interest").delete().eq("course_id", courseId).eq("profile_id", profileId);
    setBusy(false);
    if (err) return setError("That didn't go through. Please try again.");
    router.refresh();
  }

  const primary = "inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50";
  const quiet = "text-xs font-medium text-muted underline hover:text-fg disabled:opacity-50";

  let body: React.ReactNode;
  if (!status) {
    body = (
      <button disabled={busy} onClick={() => act(true)} className={primary}>
        {kind === "live" ? "I'd like to attend" : "Request access to the video"}
      </button>
    );
  } else if (status === "declined") {
    body = <p className="text-sm text-muted">We couldn&apos;t add you to this one. Please contact us if you think this is a mistake.</p>;
  } else if (kind === "replay" && status === "approved") {
    body = url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className={primary}><Play className="size-4" /> Watch the replay</a>
    ) : (
      <p className="text-sm text-brand">Access approved. The video link will appear here.</p>
    );
  } else {
    body = (
      <div className="flex flex-col items-start gap-2">
        {kind === "live" && url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className={primary}><Video className="size-4" /> Join the live class</a>
        ) : (
          <p className="text-sm font-medium text-brand">
            {kind === "live" ? "You're on the list. The join button appears here 30 minutes before the class." : "Request received. We'll let you know when your access is approved."}
          </p>
        )}
        <button disabled={busy} onClick={() => act(false)} className={quiet}>{kind === "live" ? "I can't make it any more" : "Cancel my request"}</button>
      </div>
    );
  }
  return (
    <div className="mt-4">
      {body}
      {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
