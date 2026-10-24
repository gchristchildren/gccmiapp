import Link from "next/link";
import { site, nav } from "@/lib/site";
import { InstallPrompt } from "./InstallPrompt";
import { Container } from "./ui";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo size={72} />
          <p className="max-w-sm text-sm text-muted">{site.tagline}</p>
          <InstallPrompt />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-fg">{n.label}</Link>
              </li>
            ))}
            <li><a href={site.donateUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fg">Donate</a></li>
            <li><Link href="/contact" className="hover:text-fg">Contact</Link></li>
            <li><a href={site.store} target="_blank" rel="noopener noreferrer" className="hover:text-fg">Store</a></li>
            <li><Link href="/gallery" className="hover:text-fg">Gallery</Link></li>
            <li><Link href="/instructors" className="hover:text-fg">Our instructors</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">GCC Ministry International</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href={site.mainSite} className="hover:text-fg" target="_blank" rel="noopener noreferrer">Main website: gccmi.co.uk</a></li>
            <li>{site.contact.address.join(", ")}</li>
            <li><a href={site.contact.phoneHref} className="hover:text-fg">{site.contact.phone}</a></li>
            <li><a href={`mailto:${site.contact.email}`} className="break-all hover:text-fg">{site.contact.email}</a></li>
            <li className="flex gap-4 pt-1">
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-fg">Facebook</a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-fg">Instagram</a>
              <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-fg">YouTube</a>
            </li>
            <li>{site.charityNumber ? `Registered charity no. ${site.charityNumber}` : "Registered charity number: to be added"}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.fullName}. All rights reserved.
      </div>
    </footer>
  );
}
