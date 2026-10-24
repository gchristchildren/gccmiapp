import { Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { ConfirmButton } from "@/components/ConfirmButton";
import { addLesson, addResource, deleteCourse, deleteLesson, deleteResource, setCoursePublished, updateCourse } from "@/lib/actions/masterclass";

export const dynamic = "force-dynamic";

export default async function AdminCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; updated?: string }> }) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();
  const [{ data: lessons }, { data: resources }] = await Promise.all([
    supabase.from("lessons").select("*").eq("course_id", id).order("position").order("created_at"),
    supabase.from("course_resources").select("*").eq("course_id", id).order("created_at"),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/masterclass" className="text-sm font-medium text-brand">← Masterclass</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{course.title}</h1><p className="text-sm text-muted">{course.schedule_note || "No schedule set"}</p></div>
        <form action={setCoursePublished}>
          <input type="hidden" name="id" value={course.id} />
          <input type="hidden" name="published" value={course.published ? "0" : "1"} />
          <button className={`rounded-full px-5 py-2.5 text-sm font-semibold ${course.published ? "border border-line hover:bg-brand-soft" : "bg-brand text-brand-fg hover:opacity-90"}`}>
            {course.published ? "Unpublish" : "Publish to members"}
          </button>
        </form>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {updated && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Course updated.</p>}

      <Card>
        <details>
          <summary className="cursor-pointer font-bold">Edit course details</summary>
          <form action={updateCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={course.id} />
            <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required defaultValue={course.title} className={input} /></label>
            <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={3} defaultValue={course.description} className={input} /></label>
            <label className="text-sm font-medium">Schedule<input name="schedule_note" defaultValue={course.schedule_note} className={input} /></label>
            <label className="text-sm font-medium">Starts<input name="starts_on" type="date" defaultValue={course.starts_on ?? ""} className={input} /></label>
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save changes</button>
          </form>
        </details>
        <form action={deleteCourse} className="mt-5 border-t border-line pt-4">
          <input type="hidden" name="id" value={course.id} />
          <ConfirmButton message={`Delete "${course.title}"? Its lessons, downloads, members' progress and certificates will be deleted too. This cannot be undone.`} className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
            Delete course
          </ConfirmButton>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold">Lessons</h2>
        <ol className="mt-3 divide-y divide-line text-sm">
          {(lessons ?? []).map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 py-3">
              <div><p className="font-semibold">{l.position}. {l.title}</p>{l.video_url && <p className="break-all text-xs text-muted">{l.video_url}</p>}</div>
              <form action={deleteLesson}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="course_id" value={id} />
                <button aria-label="Delete lesson" className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-red-600"><Trash2 className="size-4" /></button></form>
            </li>
          ))}
          {!lessons?.length && <li className="py-3 text-muted">No lessons yet.</li>}
        </ol>
        <form action={addLesson} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_90px]">
          <input type="hidden" name="course_id" value={id} />
          <label className="text-sm font-medium">Lesson title<input name="title" required className={input} /></label>
          <label className="text-sm font-medium">Order<input name="position" type="number" defaultValue={(lessons?.length ?? 0) + 1} className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Video link (YouTube or Vimeo)<input name="video_url" type="url" className={input} placeholder="https://youtu.be/…" /></label>
          <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={2} className={input} /></label>
          <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Add lesson</button>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold">Downloads</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {(resources ?? []).map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-3 py-3">
              <div><p className="font-semibold">{r.title}</p><p className="break-all text-xs text-muted">{r.file_url}</p></div>
              <form action={deleteResource}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="course_id" value={id} />
                <button aria-label="Delete download" className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-red-600"><Trash2 className="size-4" /></button></form>
            </li>
          ))}
          {!resources?.length && <li className="py-3 text-muted">No downloads yet.</li>}
        </ul>
        <form action={addResource} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <input type="hidden" name="course_id" value={id} />
          <label className="text-sm font-medium">Title<input name="title" required className={input} /></label>
          <label className="text-sm font-medium">File link (https://)<input name="file_url" type="url" required className={input} /></label>
          <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Add download</button>
        </form>
      </Card>
    </div>
  );
}
