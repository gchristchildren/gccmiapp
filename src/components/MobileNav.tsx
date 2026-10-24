"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { nav } from "@/lib/site";
import { AuthLink } from "./AuthLink";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-full border border-line bg-surface"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full mt-2 rounded-3xl border border-line bg-surface p-3 shadow-card">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-brand-soft"
            >
              {n.label}
            </Link>
          ))}
          <AuthLink variant="mobile" onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
