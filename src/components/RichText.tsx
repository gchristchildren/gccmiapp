import Link from "next/link";

/**
 * Renders post text safely (no HTML injection). Supported: blank-line paragraphs, "## " and "### "
 * headings, "- " bullet lists, **bold**, [links](https://…), and images as ![alt](https://…).
 */
const inlineRe = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(inlineRe).map((part, i) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i}>{bold[1]}</strong>;
        const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)$/);
        if (link) {
          return link[2].startsWith("/") ? (
            <Link key={i} href={link[2]} className="font-medium text-brand underline">{link[1]}</Link>
          ) : (
            <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">{link[1]}</a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5 leading-relaxed">
      {blocks.map((block, i) => {
        const img = block.match(/^!\[([^\]]*)\]\((https:\/\/[^)\s]+|\/[^)\s]+)\)$/);
        if (img) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={i} src={img[2]} alt={img[1]} loading="lazy" className="w-full rounded-2xl border border-line" />;
        }
        if (block.startsWith("### ")) return <h3 key={i} className="pt-2 text-lg font-bold"><Inline text={block.slice(4)} /></h3>;
        if (block.startsWith("## ")) return <h2 key={i} className="pt-3 text-2xl font-bold"><Inline text={block.slice(3)} /></h2>;
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6">
              {lines.map((l, j) => <li key={j}><Inline text={l.slice(2)} /></li>)}
            </ul>
          );
        }
        return <p key={i}><Inline text={lines.join(" ")} /></p>;
      })}
    </div>
  );
}
