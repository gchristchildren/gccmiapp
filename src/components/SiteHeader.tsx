import Link from "next/link";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { AuthLink } from "./AuthLink";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between rounded-full border border-line bg-surface/85 px-4 py-2.5 shadow-card backdrop-blur">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-brand-soft hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthLink />
          <Link href="/donate" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition hover:opacity-90">
            Donate
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
