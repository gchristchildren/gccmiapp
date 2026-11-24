import Image from "next/image";
import Link from "next/link";
import { SHOW_SAMPLE_BADGES } from "@/lib/content";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  primary: "bg-brand text-brand-fg hover:opacity-90 shadow-sm",
  secondary: "border border-line bg-surface text-fg hover:bg-brand-soft",
  ghost: "text-brand hover:bg-brand-soft",
};

export function ButtonLink({ href, children, variant = "primary", className = "", external }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`;
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  sample,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  sample?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {(eyebrow || (sample && SHOW_SAMPLE_BADGES)) && (
        <div className={`mb-3 flex gap-2 ${align === "center" ? "justify-center" : ""}`}>
          {eyebrow && (
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
              {eyebrow}
            </span>
          )}
          {sample && SHOW_SAMPLE_BADGES && (
            <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold">Sample content</span>
          )}
        </div>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-muted">{body}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-line bg-surface p-6 shadow-card ${className}`}>{children}</div>
  );
}

/** Photo behind a section, with a dark green layer over it so white text stays readable. Parent must be `relative overflow-hidden`. */
export function PhotoBackdrop({ src, priority, position = "center" }: { src: string; priority?: boolean; position?: string }) {
  return (
    <>
      <Image src={src} alt="" fill priority={priority} sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      <div className="absolute inset-0 bg-[#0b2415]/70" aria-hidden="true" />
    </>
  );
}

export function PageHero({ title, body, children, image, position }: { title: string; body?: string; children?: React.ReactNode; image?: string; position?: string }) {
  return (
    <section className={`relative overflow-hidden border-b border-line ${image ? "isolate bg-[#0b2415]" : "hero-bg"}`}>
      {image && <PhotoBackdrop src={image} priority position={position} />}
      <Container className="relative py-14 sm:py-20">
        <h1 className={`max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl ${image ? "text-white" : ""}`}>{title}</h1>
        {body && <p className={`mt-4 max-w-2xl text-lg ${image ? "text-white/85" : "text-muted"}`}>{body}</p>}
        {children}
      </Container>
    </section>
  );
}
