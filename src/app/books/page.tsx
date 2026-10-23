import { Container, PageHero, SectionHeading } from "@/components/ui";
import { books } from "@/lib/content";

export const metadata = { title: "Books & resources" };

export default function Books() {
  return (
    <>
      <PageHero title="Books & resources" body="Our books are available on Amazon. Tap a book to buy securely there." />
      <Container className="py-16">
        <SectionHeading title="Our books" sample />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b) => (
            <article key={b.title} className="flex flex-col rounded-3xl border border-line bg-surface p-4 shadow-card">
              <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-br from-brand to-emerald-900 p-4 text-center font-bold text-white">
                {b.title}
              </div>
              <h3 className="mt-4 font-bold">{b.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{b.blurb}</p>
              <p className="mt-3 font-semibold">{b.price}</p>
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-fg hover:opacity-90"
              >
                Buy on Amazon
              </a>
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
