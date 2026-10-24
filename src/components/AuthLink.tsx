"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = { status: "loading" } | { status: "out" } | { status: "in"; href: string };

/**
 * "Sign in" for visitors, "Dashboard" for anyone who is signed in (admins go to /admin, everyone
 * else to /portal). Runs in the browser so the public pages can stay statically cached.
 * People stay signed in until they sign out themselves.
 */
export function AuthLink({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function resolve(userId: string | null) {
      if (!userId) return active && setState({ status: "out" });
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (active) setState({ status: "in", href: data?.role === "admin" ? "/admin" : "/portal" });
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (variant === "mobile") {
    const cls = "block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-brand-soft";
    if (state.status === "loading") return <span className={`${cls} invisible`} aria-hidden="true">Sign in</span>;
    if (state.status === "in") {
      return (
        <Link href={state.href} onClick={onNavigate} className={`${cls} flex items-center gap-2 text-brand`}>
          <LayoutDashboard className="size-4" /> Dashboard
        </Link>
      );
    }
    return (
      <Link href="/portal" onClick={onNavigate} className={cls}>
        Sign in
      </Link>
    );
  }

  if (state.status === "in") {
    return (
      <Link
        href={state.href}
        className="hidden items-center gap-2 rounded-full border border-line bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition hover:opacity-90 lg:inline-flex"
      >
        <LayoutDashboard className="size-4" /> Dashboard
      </Link>
    );
  }
  return (
    <Link
      href="/portal"
      aria-hidden={state.status === "loading"}
      className={`hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-fg lg:block ${state.status === "loading" ? "invisible" : ""}`}
    >
      Sign in
    </Link>
  );
}
