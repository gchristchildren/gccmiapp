/**
 * Post text format. Posts are stored as simple text that the website turns into formatted pages:
 *   blank-line separated paragraphs, "## " heading, "### " subheading, "- " bullets, "1. " numbered lines,
 *   "> " quotes, ![alt](image address), [link text](address), **bold**, _italic_, ++underline++, ~~strikethrough~~.
 * The editor in the admin area shows this as normal formatted text with buttons, so nobody has to type these marks.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "b" | "i" | "u" | "s"; c: Inline[] }
  | { t: "a"; href: string; c: Inline[] };

export type BlockNode =
  | { t: "p" | "h2" | "h3" | "quote"; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; items: Inline[][]; start?: number }
  | { t: "img"; alt: string; src: string };

const HREF = "(?:https?:\\/\\/|\\/|#)[^)\\s]+";
const LINK = new RegExp(`^\\[([^\\]]+)\\]\\((${HREF})\\)`);
const NOT_WORD_BEFORE = /[\s([{"'“‘—–-]/;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    if (s[i] === "[") {
      const m = rest.match(LINK);
      if (m) {
        flush();
        out.push({ t: "a", href: m[2], c: parseInline(m[1]) });
        i += m[0].length;
        continue;
      }
    }
    let matched = false;
    for (const [mark, t] of [["**", "b"], ["~~", "s"], ["++", "u"]] as const) {
      if (!rest.startsWith(mark)) continue;
      const end = rest.indexOf(mark, mark.length);
      if (end > mark.length) {
        flush();
        out.push({ t, c: parseInline(rest.slice(mark.length, end)) });
        i += end + mark.length;
        matched = true;
      }
      break;
    }
    if (matched) continue;
    if (s[i] === "_" && (i === 0 || NOT_WORD_BEFORE.test(s[i - 1])) && s[i + 1] && !/[\s_]/.test(s[i + 1])) {
      let j = i + 2;
      let end = -1;
      while (j < s.length) {
        if (s[j] === "_" && !/\s/.test(s[j - 1]) && !/\w/.test(s[j + 1] ?? "")) {
          end = j;
          break;
        }
        j++;
      }
      if (end > i + 1 && !s.slice(i + 1, end).includes("\n")) {
        flush();
        out.push({ t: "i", c: parseInline(s.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += s[i];
    i++;
  }
  flush();
  return out;
}

export function parseBlocks(md: string): BlockNode[] {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b): BlockNode => {
    const img = b.match(/^!\[([^\]]*)\]\((https:\/\/[^)\s]+|\/[^)\s]+)\)$/);
    if (img) return { t: "img", alt: img[1], src: img[2] };
    if (b.startsWith("### ")) return { t: "h3", c: parseInline(b.slice(4).replace(/\n+/g, " ")) };
    if (b.startsWith("## ")) return { t: "h2", c: parseInline(b.slice(3).replace(/\n+/g, " ")) };
    const lines = b.split("\n");
    if (lines.every((l) => l.startsWith("- "))) return { t: "ul", items: lines.map((l) => parseInline(l.slice(2))) };
    if (lines.length > 1 && lines.every((l) => /^\d+\. /.test(l))) {
      return { t: "ol", start: Number(lines[0].match(/^\d+/)![0]), items: lines.map((l) => parseInline(l.replace(/^\d+\. /, ""))) };
    }
    if (lines.every((l) => l.startsWith("> "))) return { t: "quote", c: parseInline(lines.map((l) => l.slice(2)).join(" ")) };
    return { t: "p", c: parseInline(lines.join(" ")) };
  });
}

// ---------------------------------------------------------------- to editor HTML (pure string building, safe to run on the server)
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inlineHtml(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      if (n.t === "text") return esc(n.v);
      const inner = inlineHtml(n.c);
      if (n.t === "a") return `<a href="${esc(n.href)}">${inner}</a>`;
      const tag = { b: "strong", i: "em", u: "u", s: "s" }[n.t];
      return `<${tag}>${inner}</${tag}>`;
    })
    .join("");
}

export function mdToHtml(md: string): string {
  const html = parseBlocks(md)
    .map((b) => {
      if (b.t === "img") return `<p><img src="${esc(b.src)}" alt="${esc(b.alt)}"></p>`;
      if (b.t === "ul") return `<ul>${b.items.map((it) => `<li>${inlineHtml(it)}</li>`).join("")}</ul>`;
      if (b.t === "ol") {
        const start = b.start && b.start !== 1 ? ` start="${b.start}"` : "";
        return `<ol${start}>${b.items.map((it) => `<li>${inlineHtml(it)}</li>`).join("")}</ol>`;
      }
      const tag = { p: "p", h2: "h2", h3: "h3", quote: "blockquote" }[b.t];
      return `<${tag}>${inlineHtml(b.c)}</${tag}>`;
    })
    .join("");
  return html || "<p><br></p>";
}

// ---------------------------------------------------------------- from editor DOM back to post text (browser only)
const BLOCK_TAGS = new Set(["P", "DIV", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI"]);
const safeHref = (h: string) => /^(https?:\/\/|\/|#)/.test(h);
const safeHrefText = (h: string) => h.replace(/\s/g, "%20").replace(/\)/g, "%29");

function inlineMd(node: Node): string {
  if (node.nodeType === 3) return (node.textContent ?? "").replace(/ /g, " ").replace(/\s+/g, " ");
  if (node.nodeType !== 1) return "";
  const el = node as Element;
  const tag = el.tagName;
  if (tag === "BR") return " ";
  if (tag === "IMG") return "";
  const inner = Array.from(el.childNodes).map(inlineMd).join("");
  // Marks must hug the text, so any spaces move outside them.
  const wrap = (mark: string) => {
    const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
    return m[2] ? `${m[1]}${mark}${m[2]}${mark}${m[3]}` : inner;
  };
  switch (tag) {
    case "STRONG":
    case "B":
      return wrap("**");
    case "EM":
    case "I":
      return wrap("_");
    case "U":
    case "INS":
      return wrap("++");
    case "S":
    case "STRIKE":
    case "DEL":
      return wrap("~~");
    case "A": {
      const href = el.getAttribute("href") ?? "";
      const label = inner.trim().replace(/[[\]]/g, "");
      return href && safeHref(href) && label ? `[${label}](${safeHrefText(href)})` : inner;
    }
    default:
      return inner;
  }
}

function imageMd(img: Element): string | null {
  const src = img.getAttribute("src") ?? "";
  if (!/^(https:\/\/|\/)/.test(src)) return null;
  return `![${(img.getAttribute("alt") ?? "").replace(/[[\]]/g, "")}](${safeHrefText(src)})`;
}

export function htmlToMd(root: Element): string {
  const out: string[] = [];
  let loose = "";
  const flushLoose = () => {
    if (loose.trim()) out.push(loose.trim());
    loose = "";
  };

  const walk = (parent: Element) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 3) {
        loose += inlineMd(node);
        continue;
      }
      if (node.nodeType !== 1) continue;
      const el = node as Element;
      const tag = el.tagName;
      if (!BLOCK_TAGS.has(tag)) {
        if (tag === "IMG") {
          flushLoose();
          const m = imageMd(el);
          if (m) out.push(m);
        } else loose += inlineMd(el);
        continue;
      }
      flushLoose();
      if (tag === "UL" || tag === "OL") {
        const items = Array.from(el.querySelectorAll("li")).map((li) => inlineMd(li).trim()).filter(Boolean);
        const start = tag === "OL" ? Number(el.getAttribute("start")) || 1 : 0;
        if (items.length) out.push(items.map((t, i) => (tag === "UL" ? `- ${t}` : `${start + i}. ${t}`)).join("\n"));
      } else if (tag === "BLOCKQUOTE") {
        const text = inlineMd(el).trim();
        if (text) out.push(`> ${text}`);
      } else if (/^H[1-6]$/.test(tag)) {
        const text = inlineMd(el).trim();
        if (text) out.push(`${tag === "H1" || tag === "H2" ? "##" : "###"} ${text}`);
      } else if (Array.from(el.children).some((c) => BLOCK_TAGS.has(c.tagName))) {
        walk(el);
        flushLoose();
      } else {
        const imgs = Array.from(el.querySelectorAll("img"));
        const text = inlineMd(el).trim();
        if (text) out.push(text);
        for (const img of imgs) {
          const m = imageMd(img);
          if (m) out.push(m);
        }
      }
    }
  };
  walk(root);
  flushLoose();
  return out.join("\n\n");
}
