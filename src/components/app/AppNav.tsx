"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavItem = { href: string; label: string; icon: React.ReactNode; exact?: boolean };

/** Sidebar on desktop, slide-down drawer on mobile (the app is installed as a phone PWA). */
export function AppNav({ items, header, footer }: { items: NavItem[]; header: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1" aria-label="App">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-brand-soft text-brand" : "text-muted hover:bg-brand-soft/60 hover:text-fg"}`}
          >
            <span className="size-4 shrink-0 [&>svg]:size-4">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden print:!hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-line bg-surface-2 p-4 lg:flex">
        {header}
        <div className="flex-1 overflow-y-auto">{links}</div>
        {footer}
      </aside>

      <div className="print:hidden sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {header}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-full border border-line"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        {open && (
          <div className="space-y-4 border-t border-line p-4">
            {links}
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
