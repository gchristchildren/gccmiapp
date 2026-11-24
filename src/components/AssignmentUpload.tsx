"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AssignmentRow = { id: string; file_path: string; file_name: string; file_size: number; note: string | null; created_at: string };

const MAX = 10 * 1024 * 1024;
const TYPES = [
  "application/pdf", "application/msword", "text/plain", "image/jpeg", "image/png", "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

/**
 * Class assignment upload for one child. Files go straight from the browser to the private "assignments"
 * storage bucket (so they are not limited by the server's request size); row-level security means a parent
 * can only add to and read their own children's folder.
 */
export function AssignmentUpload({ childId, childName, profileId, items }: { childId: string; childName: string; profileId: string; items: AssignmentRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get("file");
    if (!(file instanceof File) || !file.size) return setMsg({ kind: "error", text: "Please choose a file." });
    if (!TYPES.includes(file.type)) return setMsg({ kind: "error", text: "Please upload a PDF, Word document, text file or a JPG, PNG or WebP image." });
    if (file.size > MAX) return setMsg({ kind: "error", text: "That file is over 10 MB. Please choose a smaller one." });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
    const path = `${profileId}/${childId}/${crypto.randomUUID()}-${safe}`;
    const up = await supabase.storage.from("assignments").upload(path, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      return setMsg({ kind: "error", text: "We couldn't upload that file. Please try again." });
    }
    const note = String(f.get("note") ?? "").trim().slice(0, 1000) || null;
    const row = await supabase.from("assignments").insert({ child_id: childId, profile_id: profileId, file_path: path, file_name: file.name.slice(0, 255), file_size: file.size, note });
    if (row.error) {
      await supabase.storage.from("assignments").remove([path]);
      setBusy(false);
      return setMsg({ kind: "error", text: "We couldn't save that upload. Please try again." });
    }
    form.reset();
    setBusy(false);
    setMsg({ kind: "ok", text: "Assignment uploaded." });
    router.refresh();
  }

  async function open(path: string) {
    const { data } = await createClient().storage.from("assignments").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(a: AssignmentRow) {
    if (!window.confirm(`Delete "${a.file_name}"?`)) return;
    const supabase = createClient();
    await supabase.from("assignments").delete().eq("id", a.id);
    await supabase.storage.from("assignments").remove([a.file_path]);
    router.refresh();
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm";
  return (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="text-sm font-bold">Class assignments</h3>
      <form onSubmit={upload} className="mt-3 space-y-3">
        <label className="block text-sm font-medium">
          Upload {childName}&apos;s work (PDF, Word, text or image, up to 10 MB)
          <input name="file" type="file" required accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,application/pdf,image/*" className={input} />
        </label>
        <label className="block text-sm font-medium">
          Note for the teacher (optional)
          <input name="note" maxLength={1000} className={input} />
        </label>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">
          <Upload className="size-4" /> {busy ? "Uploading…" : "Upload assignment"}
        </button>
        <p className="text-xs text-muted">Only upload your child&apos;s own work. We store it and show it to the relevant teacher and your family. See our <a href="/policies#acceptable-use" target="_blank" className="font-medium text-brand">acceptable use policy</a>.</p>
        {msg && (
          <p role="status" className={`rounded-2xl px-4 py-2.5 text-sm ${msg.kind === "ok" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>{msg.text}</p>
        )}
      </form>
      {!!items.length && (
        <ul className="mt-4 space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-2.5 text-sm">
              <button type="button" onClick={() => open(a.file_path)} className="flex min-w-0 items-center gap-2 text-left font-medium text-brand">
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{a.file_name}</span>
              </button>
              <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                {date(a.created_at)} · {kb(a.file_size)}
                <button type="button" aria-label={`Delete ${a.file_name}`} onClick={() => remove(a)} className="text-muted hover:text-red-600"><Trash2 className="size-4" /></button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
