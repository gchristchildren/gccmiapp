import { Award, Check, Circle, Download } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { claimCertificate, toggleLesson } from "@/lib/actions/masterclass";
import { embedUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lesson?: string; error?: string }> }) {
  const { slug } = await params;
  const { lesson: lessonParam, error } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!course) notFound();

  const [{ data: lessons }, { data: resources }, { data: progress }, { data: cert }] = await Promise.all([
    supabase.from("lessons").select("*").eq("course_id", course.id).order("position").order("created_at"),
    supabase.from("course_resources").select("*").eq("course_id", course.id).order("created_at"),
    supabase.from("lesson_progress").select("lesson_id").eq("profile_id", user.id),
    supabase.from("certificates").select("id").eq("course_id", course.id).eq("profile_id", user.id).maybeSingle(),
  ]);
  // Lessons are members-only: no rows means not an approved member (RLS), so send them to register.
  if (!lessons?.length) {
    const { data: m } = await supabase.from("masterclass_memberships").select("id").eq("profile_id", user.id).eq("status", "active").limit(1);
    if (!m?.length) redirect("/portal/masterclass");
  }

  const done = new Set((progress ?? []).map((p) => p.lesson_id));
  const all = lessons ?? [];
  const current = all.find((l) => l.id === lessonParam) ?? all.find((l) => !done.has(l.id)) ?? all[0];
  const complete = all.length > 0 && all.every((l) => done.has(l.id));
  const embed = embedUrl(current?.video_url);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/portal/masterclass" className="text-sm font-medium text-brand">← Masterclass</Link>
        <h1 className="mt-1 text-2xl font-bold">{course.title}</h1>
        {course.schedule_note && <p className="text-sm text-muted">{course.schedule_note}</p>}
      </div>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {current ? (
            <Card className="p-5">
              <h2 className="text-lg font-bold">{current.title}</h2>
              {embed ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
                  <iframe src={embed} title={current.title} className="size-full" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                </div>
              ) : current.video_url ? (
                <a href={current.video_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-brand">Open video →</a>
              ) : null}
              {current.description && <p className="mt-4 whitespace-pre-line text-sm">{current.description}</p>}
              <form action={toggleLesson} className="mt-5">
                <input type="hidden" name="lesson_id" value={current.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <input type="hidden" name="done" value={done.has(current.id) ? "1" : "0"} />
                <button className={`rounded-full px-5 py-2.5 text-sm font-semibold ${done.has(current.id) ? "border border-line hover:bg-brand-soft" : "bg-brand text-brand-fg hover:opacity-90"}`}>
                  {done.has(current.id) ? "Completed: mark as not done" : "Mark as complete"}
                </button>
              </form>
            </Card>
          ) : (
            <p className="text-sm text-muted">Lessons for this course will appear here.</p>
          )}

          {complete && (
            <Card className="flex flex-wrap items-center justify-between gap-3 bg-brand-soft">
              <div><h2 className="flex items-center gap-2 font-bold"><Award className="size-5 text-brand" /> You&apos;ve completed this course</h2><p className="text-sm text-muted">Claim your certificate of completion.</p></div>
              {cert ? (
                <Link href={`/portal/masterclass/certificate/${cert.id}`} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg">View certificate</Link>
              ) : (
                <form action={claimCertificate}>
                  <input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="slug" value={course.slug} />
                  <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90">Get my certificate</button>
                </form>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="mb-2 px-1 text-sm font-bold">Lessons</h2>
            <ol className="space-y-1">
              {all.map((l, i) => (
                <li key={l.id}>
                  <Link href={`/portal/masterclass/${course.slug}?lesson=${l.id}`} className={`flex items-center gap-2 rounded-xl px-2 py-2 text-sm ${l.id === current?.id ? "bg-brand-soft font-semibold" : "hover:bg-brand-soft/60"}`}>
                    {done.has(l.id) ? <Check className="size-4 shrink-0 text-brand" /> : <Circle className="size-4 shrink-0 text-muted" />}
                    <span className="min-w-0 truncate">{i + 1}. {l.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
          {!!resources?.length && (
            <Card className="p-4">
              <h2 className="mb-2 px-1 text-sm font-bold">Downloads</h2>
              <ul className="space-y-1">
                {resources.map((r) => (
                  <li key={r.id}><a href={r.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-brand-soft/60"><Download className="size-4 shrink-0 text-brand" /> {r.title}</a></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
