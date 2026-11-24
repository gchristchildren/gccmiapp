import Link from "next/link";
import { parseBlocks, parseInline, type Inline as InlineNode } from "@/lib/richtext";

/**
 * Renders post text safely (no HTML injection): paragraphs, headings, bullet and numbered lists, quotes, images,
 * links, bold, italic, underline and strikethrough. See src/lib/richtext.ts for the format.
 */
function nodes(list: InlineNode[]): React.ReactNode {
  return list.map((n, i) => {
    if (n.t === "text") return <span key={i}>{n.v}</span>;
    const inner = nodes(n.c);
    if (n.t === "b") return <strong key={i}>{inner}</strong>;
    if (n.t === "i") return <em key={i}>{inner}</em>;
    if (n.t === "u") return <u key={i}>{inner}</u>;
    if (n.t === "s") return <s key={i}>{inner}</s>;
    if (n.t !== "a") return null;
    return n.href.startsWith("/") || n.href.startsWith("#") ? (
      <Link key={i} href={n.href} className="font-medium text-brand underline">{inner}</Link>
    ) : (
      <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">{inner}</a>
    );
  });
}

export function Inline({ text }: { text: string }) {
  return <>{nodes(parseInline(text))}</>;
}

export function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-5 leading-relaxed">
      {parseBlocks(text).map((b, i) => {
        switch (b.t) {
          case "img":
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={b.src} alt={b.alt} loading="lazy" className="w-full rounded-2xl border border-line" />;
          case "h3":
            return <h3 key={i} className="pt-2 text-lg font-bold">{nodes(b.c)}</h3>;
          case "h2":
            return <h2 key={i} className="pt-3 text-2xl font-bold">{nodes(b.c)}</h2>;
          case "ul":
            return <ul key={i} className="list-disc space-y-1.5 pl-6">{b.items.map((it, j) => <li key={j}>{nodes(it)}</li>)}</ul>;
          case "ol":
            return <ol key={i} start={b.start} className="list-decimal space-y-1.5 pl-6">{b.items.map((it, j) => <li key={j}>{nodes(it)}</li>)}</ol>;
          case "quote":
            return <blockquote key={i} className="border-l-4 border-brand pl-4 text-muted italic">{nodes(b.c)}</blockquote>;
          default:
            return <p key={i}>{nodes(b.c)}</p>;
        }
      })}
    </div>
  );
}
