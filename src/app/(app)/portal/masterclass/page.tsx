import { Award, Clock } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { registerMasterclass } from "@/lib/actions/masterclass";

export const metadata = { title: "Masterclass" };
export const dynamic = "force-dynamic";

export default async function Masterclass() {
  const { supabase, user } = await requireUser();
  const year = new Date().getFullYear();
  const [{ data: memberships }, { data: courses }] = await Promise.all([
    supabase.from("masterclass_memberships").select("*").eq("profile_id", user.id).order("year", { ascending: false }),
    supabase.from("courses").select("*").eq("published", true).order("created_at"),
  ]);
  const active = (memberships ?? []).find((m) => m.status === "active");
  const current = (memberships ?? []).find((m) => m.year === year);

  const [{ data: lessons }, { data: progress }, { data: certs }] = active
    ? await Promise.all([
        supabase.from("lessons").select("id, course_id"),
        supabase.from("lesson_progress").select("lesson_id").eq("profile_id", user.id),
        supabase.from("certificates").select("id, course_id").eq("profile_id", user.id),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];
  const done = new Set((progress ?? []).map((p) => p.lesson_id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Masterclass</h1>

      {!active && (
        <Card className="bg-brand-soft">
          {current?.status === "pending" ? (
            <>
              <h2 className="flex items-center gap-2 font-bold"><Clock className="size-4" /> Registration received</h2>
              <p className="mt-1 text-sm text-muted">Thank you for registering for {year}. We&apos;ll confirm your place shortly and let you know when your lessons are ready.</p>
            </>
          ) : (
            <>
              <h2 className="font-bold">Register for the {year} Masterclass</h2>
              <p className="mt-1 text-sm text-muted">Annual registration gives you members-only access to training videos, downloads and certificates.</p>
              <form action={registerMasterclass} className="mt-4">
                <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Register for {year}</button>
              </form>
            </>
          )}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(courses ?? []).map((c) => {
          const ls = (lessons ?? []).filter((l) => l.course_id === c.id);
          const n = ls.filter((l) => done.has(l.id)).length;
          const cert = (certs ?? []).find((x) => x.course_id === c.id);
          const body = (
            <>
              <h2 className="text-lg font-bold">{c.title}</h2>
              {c.schedule_note && <p className="text-xs font-medium text-brand">{c.schedule_note}</p>}
              <p className="mt-2 text-sm text-muted">{c.description}</p>
              {active && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand" style={{ width: `${ls.length ? (n / ls.length) * 100 : 0}%` }} /></div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">{n} of {ls.length} lessons{cert && <><Award className="ml-2 size-3 text-brand" /> Certificate earned</>}</p>
                </div>
              )}
            </>
          );
          return active ? (
            <Link key={c.id} href={`/portal/masterclass/${c.slug}`} className="block rounded-3xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5">{body}</Link>
          ) : (
            <Card key={c.id}>{body}</Card>
          );
        })}
        {!courses?.length && <p className="text-sm text-muted">Courses will be listed here soon.</p>}
      </div>
    </div>
  );
}
