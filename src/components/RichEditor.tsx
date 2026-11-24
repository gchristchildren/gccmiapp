"use client";

import {
  Bold, Eraser, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough, Underline, Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { htmlToMd, mdToHtml } from "@/lib/richtext";
import { resizeImage } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type Cmd = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Word-processor style editor for blog posts: headings, bold, italic, underline, strikethrough, lists, quotes,
 * links and pictures, all from buttons. The text is saved in the form field as the website's simple post format.
 */
export function RichEditor({ name = "body", defaultValue = "" }: { name?: string; defaultValue?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [initialHtml] = useState(() => mdToHtml(defaultValue));
  // Until the writer changes something, the original text is saved exactly as it was.
  const [md, setMd] = useState(defaultValue);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [block, setBlock] = useState("p");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const sync = () => {
    if (ref.current) setMd(htmlToMd(ref.current));
  };

  const refreshState = () => {
    const inside = ref.current && document.getSelection()?.anchorNode && ref.current.contains(document.getSelection()!.anchorNode);
    if (!inside) return;
    const q = (c: string) => document.queryCommandState(c);
    setOn({ bold: q("bold"), italic: q("italic"), underline: q("underline"), strikeThrough: q("strikeThrough"), ul: q("insertUnorderedList"), ol: q("insertOrderedList") });
    const v = String(document.queryCommandValue("formatBlock")).toLowerCase().replace(/[<>]/g, "");
    setBlock(v === "h2" ? "h2" : v === "h3" ? "h3" : v === "blockquote" ? "quote" : "p");
  };

  useEffect(() => {
    document.addEventListener("selectionchange", refreshState);
    return () => document.removeEventListener("selectionchange", refreshState);
  }, []);

  useEffect(() => {
    // Fill the writing area once. React must not manage its contents, or it would reset them while typing.
    if (ref.current && !ref.current.dataset.ready) {
      ref.current.innerHTML = initialHtml;
      ref.current.dataset.ready = "1";
    }
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      /* older browsers ignore this */
    }
  }, [initialHtml]);

  const run = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    sync();
    refreshState();
  };

  const setBlockType = (t: string) => {
    const tag = t === "h2" ? "H2" : t === "h3" ? "H3" : t === "quote" ? "BLOCKQUOTE" : "P";
    run("formatBlock", tag);
  };

  const addLink = () => {
    const sel = document.getSelection();
    const hasText = !!sel && !sel.isCollapsed && ref.current?.contains(sel.anchorNode);
    const saved = hasText && sel!.rangeCount ? sel!.getRangeAt(0).cloneRange() : null;
    const raw = window.prompt("Paste the link address (for example https://www.example.com). Leave it empty to remove a link.", "https://");
    if (raw === null) return;
    ref.current?.focus();
    if (saved) {
      sel!.removeAllRanges();
      sel!.addRange(saved);
    }
    let url = raw.trim();
    if (!url || url === "https://") return run("unlink");
    if (!/^(https?:\/\/|\/|mailto:)/i.test(url)) url = `https://${url}`;
    if (hasText) run("createLink", url);
    else run("insertHTML", `<a href="${esc(url)}">${esc(url.replace(/^https?:\/\//, ""))}</a>&nbsp;`);
  };

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setMsg({ kind: "error", text: "Please choose a JPG, PNG or WebP picture." });
    const alt = window.prompt("Describe the picture in a few words (helps people who can't see it, and Google). You can leave this empty.", "") ?? "";
    setBusy(true);
    setMsg({ kind: "ok", text: "Uploading picture…" });
    try {
      const blob = await resizeImage(file, 1600, 0.85);
      const supabase = createClient();
      const path = `posts/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("blog-covers").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      const url = supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
      ref.current?.focus();
      document.execCommand("insertHTML", false, `<p><img src="${esc(url)}" alt="${esc(alt.trim())}"></p><p><br></p>`);
      sync();
      setMsg({ kind: "ok", text: "Picture added." });
    } catch {
      setMsg({ kind: "error", text: "Could not upload that picture. Please try again." });
    }
    setBusy(false);
  };

  // Pasting keeps only the text, so copied web pages and Word files don't bring messy formatting.
  const paste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    lines.forEach((line, i) => {
      if (i > 0) document.execCommand("insertParagraph");
      if (line) document.execCommand("insertText", false, line);
    });
    sync();
  };

  // Shift+Enter would insert a line break the website can't show, so it starts a new paragraph instead.
  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertParagraph");
      sync();
    }
  };

  const btn = (active?: boolean) =>
    `grid size-9 place-items-center rounded-lg border text-sm transition ${active ? "border-brand bg-brand-soft text-brand" : "border-transparent text-fg hover:bg-brand-soft"}`;
  const tool = (label: string, Icon: typeof Bold, onClick: () => void, active?: boolean) => (
    <button type="button" title={label} aria-label={label} aria-pressed={active} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={btn(active)}>
      <Icon className="size-4" />
    </button>
  );
  const cmd = (label: string, Icon: typeof Bold, c: Cmd, key: string) => tool(label, Icon, () => run(c), on[key]);
  const sep = <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />;

  return (
    <div className="rounded-2xl border border-line bg-bg">
      <div role="toolbar" aria-label="Text formatting" className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-line bg-surface p-1.5">
        <select
          aria-label="Text style"
          value={block}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setBlockType(e.target.value)}
          className="mr-1 h-9 rounded-lg border border-line bg-bg px-2 text-sm"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="quote">Quote</option>
        </select>
        {cmd("Bold", Bold, "bold", "bold")}
        {cmd("Italic", Italic, "italic", "italic")}
        {cmd("Underline", Underline, "underline", "underline")}
        {cmd("Strikethrough", Strikethrough, "strikeThrough", "strikeThrough")}
        {sep}
        {cmd("Bullet list", List, "insertUnorderedList", "ul")}
        {cmd("Numbered list", ListOrdered, "insertOrderedList", "ol")}
        {tool("Quote", Quote, () => setBlockType(block === "quote" ? "p" : "quote"), block === "quote")}
        {sep}
        {tool("Add or remove a link", Link2, addLink)}
        {tool("Add a picture", ImageIcon, () => fileRef.current?.click())}
        {sep}
        {tool("Clear formatting", Eraser, () => { run("removeFormat"); run("formatBlock", "P"); })}
        {tool("Undo", Undo2, () => run("undo"))}
        {tool("Redo", Redo2, () => run("redo"))}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={addImage} disabled={busy} className="hidden" tabIndex={-1} aria-hidden="true" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Post text"
        spellCheck
        onInput={sync}
        onPaste={paste}
        onKeyDown={keyDown}
        onBlur={sync}
        onKeyUp={refreshState}
        onMouseUp={refreshState}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          ref.current?.querySelectorAll("img.rich-selected").forEach((i) => i.classList.remove("rich-selected"));
          if (t.tagName === "IMG") t.classList.add("rich-selected");
        }}
        className="rich-editor p-4 text-sm sm:text-base"
      />
      {msg && <p role="status" className={`mx-3 mb-3 rounded-xl px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>{msg.text}</p>}
      <input type="hidden" name={name} value={md} />
    </div>
  );
}
