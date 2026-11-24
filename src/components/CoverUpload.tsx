"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Cover image field for the blog form. Choosing a file uploads it straight to the public "blog-covers" bucket
 * (admins only, enforced by storage policies) and fills in the image address; you can also paste a link instead.
 */
export function CoverUpload({ defaultValue = "", inputClass }: { defaultValue?: string; inputClass: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [state, setState] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = TYPES[file.type];
    if (!ext) return setState({ kind: "error", msg: "The cover image must be a JPG, PNG or WebP file." });
    if (file.size > 5 * 1024 * 1024) return setState({ kind: "error", msg: "The cover image must be under 5 MB." });
    setState({ kind: "busy", msg: "Uploading…" });
    const supabase = createClient();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-covers").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return setState({ kind: "error", msg: "Could not upload the cover image. Please try again." });
    setUrl(supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl);
    setState({ kind: "ok", msg: "Image uploaded. Save the post to use it." });
  }

  return (
    <>
      <label className="text-sm font-medium sm:col-span-2">
        Cover image (upload a JPG, PNG or WebP, up to 5 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className={inputClass} />
        {state.msg && (
          <span role="status" className={`mt-2 block rounded-2xl px-4 py-2 text-sm ${state.kind === "error" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-brand-soft text-brand"}`}>{state.msg}</span>
        )}
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Cover image link (filled in by the upload, or paste your own https:// link)
        <input name="cover_url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
      </label>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Cover preview" className="max-h-40 rounded-2xl border border-line sm:col-span-2" />
      )}
    </>
  );
}
