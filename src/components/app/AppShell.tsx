import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/lib/actions/auth";
import { AppNav, type NavItem } from "./AppNav";

export function AppShell({
  items,
  name,
  roleLabel,
  children,
}: {
  items: NavItem[];
  name: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const footer = (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-fg">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name || "Your account"}</p>
          <p className="text-xs text-muted">{roleLabel}</p>
        </div>
        <ThemeToggle />
      </div>
      <form action={signOut}>
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-brand-soft hover:text-fg">
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppNav items={items} header={<Logo size={40} />} footer={footer} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
