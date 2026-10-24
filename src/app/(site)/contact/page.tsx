import { Mail, MapPin, Phone } from "lucide-react";
import { ButtonLink, Card, Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata = { title: "Contact us" };

export default function Contact() {
  const { address, phone, phoneHref, email } = site.contact;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(", "))}`;
  return (
    <>
      <PageHero title="Let's talk" body="Questions about Bible Club, the Academy, Masterclass or supporting GCCMI? Get in touch." />
      <Container className="grid gap-6 py-16 md:grid-cols-3">
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand"><MapPin className="size-5" /></span>
          <h2 className="mt-4 font-bold">Address</h2>
          <address className="mt-2 text-sm not-italic text-muted">
            {address.map((l) => (<span key={l} className="block">{l}</span>))}
          </address>
          <div className="mt-4"><ButtonLink href={map} variant="secondary" external>Open in Maps</ButtonLink></div>
        </Card>
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Phone className="size-5" /></span>
          <h2 className="mt-4 font-bold">Phone</h2>
          <p className="mt-2 text-sm"><a href={phoneHref} className="font-medium text-brand">{phone}</a></p>
        </Card>
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Mail className="size-5" /></span>
          <h2 className="mt-4 font-bold">Email</h2>
          <p className="mt-2 break-all text-sm"><a href={`mailto:${email}`} className="font-medium text-brand">{email}</a></p>
        </Card>
      </Container>
    </>
  );
}
