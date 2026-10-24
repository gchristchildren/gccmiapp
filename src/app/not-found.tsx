import { ButtonLink, Container } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { noIndex } from "@/lib/seo";

export const metadata = { title: "Page not found", ...noIndex };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-24 text-center">
          <p className="text-sm font-semibold text-brand">404</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">We couldn&apos;t find that page</h1>
          <p className="mx-auto mt-3 max-w-md text-muted">It may have moved or no longer exists. Try one of these instead.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Home</ButtonLink>
            <ButtonLink href="/programmes/bible-club" variant="secondary">Bible Club</ButtonLink>
            <ButtonLink href="/events" variant="secondary">Events</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">Contact</ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
