"use client";

import { Film, ImageIcon, Link2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { embedSrc, MEDIA_BUCKET, mediaUrl, resizeImage } from "@/lib/media";

export type AdminMedia = { id: string; kind: "image" | "video" | "embed"; path: string | null; thumb_path: string | null; embed_url: string | null; caption: string | null };

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO = 50 * 1024 * 1024;
const MAX_PHOTO = 25 * 1024 * 1024;
const ext = (f: File) => ({ "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string, string>)[f.type] ?? "bin";

/**
 * Add and remove an event's photos and videos. Files go straight from the browser to the public "event-media"
 * bucket (only admins are allowed to add or remove files); photos are shrunk first so pages stay fast.
 */
export function EventMediaManager({ eventId, items }: { eventId: string; items: AdminMedia[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    let done = 0;
    const problems: string[] = [];
    for (const [i, file] of files.entries()) {
      setMsg({ kind: "ok", text: `Uploading ${i + 1} of ${files.length}…` });
      try {
        const id = crypto.randomUUID();
        if (IMAGE_TYPES.includes(file.type)) {
          if (file.size > MAX_PHOTO) throw new Error("over 25 MB");
          const [full, thumb] = await Promise.all([resizeImage(file, 1800, 0.85), resizeImage(file, 640, 0.8)]);
          const path = `${eventId}/${id}.jpg`;
          const thumbPath = `${eventId}/${id}-t.jpg`;
          const a = await supabase.storage.from(MEDIA_BUCKET).upload(path, full, { contentType: "image/jpeg", cacheControl: "31536000" });
          if (a.error) throw new Error("upload failed");
          const b = await supabase.storage.from(MEDIA_BUCKET).upload(thumbPath, thumb, { contentType: "image/jpeg", cacheControl: "31536000" });
          if (b.error) throw new Error("upload failed");
          const row = await supabase.from("event_media").insert({ event_id: eventId, kind: "image", path, thumb_path: thumbPath });
          if (row.error) throw new Error("could not save");
        } else if (VIDEO_TYPES.includes(file.type)) {
          if (file.size > MAX_VIDEO) throw new Error("over 50 MB, add it as a YouTube link instead");
          const path = `${eventId}/${id}.${ext(file)}`;
          const a = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
          if (a.error) throw new Error("upload failed");
          const row = await supabase.from("event_media").insert({ event_id: eventId, kind: "video", path });
          if (row.error) throw new Error("could not save");
        } else {
          throw new Error("not a photo (JPG, PNG, WebP) or video (MP4, WebM, MOV)");
        }
        done++;
      } catch (err) {
        problems.push(`${file.name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }
    setBusy(false);
    setMsg(problems.length ? { kind: "error", text: `${done} added. Problems: ${problems.join("; ")}` } : { kind: "ok", text: `${done} added.` });
    router.refresh();
  }

  async function addLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const url = String(new FormData(form).get("link") ?? "").trim();
    if (!embedSrc(url)) return setMsg({ kind: "error", text: "Please paste a YouTube or Vimeo video link." });
    const { error } = await createClient().from("event_media").insert({ event_id: eventId, kind: "embed", embed_url: url });
    if (error) return setMsg({ kind: "error", text: "Could not save that link." });
    form.reset();
    setMsg({ kind: "ok", text: "Video link added." });
    router.refresh();
  }

  async function saveCaption(id: string, caption: string) {
    await createClient().from("event_media").update({ caption: caption.trim().slice(0, 300) || null }).eq("id", id);
  }

  async function remove(m: AdminMedia) {
    if (!window.confirm("Remove this from the event?")) return;
    const supabase = createClient();
    await supabase.from("event_media").delete().eq("id", m.id);
    const files = [m.path, m.thumb_path].filter((p): p is string => !!p);
    if (files.length) await supabase.storage.from(MEDIA_BUCKET).remove(files);
    router.refresh();
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm";
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Add photos or videos
          <input type="file" multiple disabled={busy} accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={upload} className={input} />
          <span className="mt-1 block text-xs font-normal text-muted">Photos: JPG, PNG or WebP (resized automatically). Videos: MP4, WebM or MOV up to 50 MB.</span>
        </label>
        <form onSubmit={addLink} className="text-sm font-medium">
          <label className="block">
            Or add a YouTube or Vimeo link
            <input name="link" type="url" placeholder="https://www.youtube.com/watch?v=..." className={input} />
          </label>
          <button className="mt-2 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-brand-soft"><Link2 className="size-4" /> Add video link</button>
          <span className="mt-1 block text-xs font-normal text-muted">Best for long videos.</span>
        </form>
      </div>
      <p className="rounded-2xl bg-gold-soft px-4 py-3 text-xs text-gold">
        Only publish photos and videos of children whose parents gave website photo permission. Never add children&apos;s full names in captions.
      </p>
      {msg && <p role="status" className={`rounded-2xl px-4 py-3 text-sm ${msg.kind === "ok" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>{msg.text}</p>}
      {!!items.length && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((m) => (
            <li key={m.id} className="flex gap-3 rounded-2xl bg-surface-2 p-3 text-sm">
              <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-bg text-muted">
                {m.kind === "image" && m.thumb_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(m.thumb_path)} alt="" className="size-full object-cover" />
                ) : m.kind === "image" ? <ImageIcon className="size-6" /> : <Film className="size-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand">{m.kind === "image" ? "Photo" : m.kind === "video" ? "Video" : "Video link"}</p>
                <input defaultValue={m.caption ?? ""} maxLength={300} placeholder="Caption (optional)" aria-label="Caption" onBlur={(e) => saveCaption(m.id, e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-1.5 text-sm" />
                <button type="button" onClick={() => remove(m)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"><Trash2 className="size-3.5" /> Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!items.length && <p className="text-sm text-muted">No photos or videos yet.</p>}
    </div>
  );
}
