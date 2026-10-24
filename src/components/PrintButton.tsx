"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 print:hidden">
      <Printer className="size-4" /> Print or save as PDF
    </button>
  );
}
