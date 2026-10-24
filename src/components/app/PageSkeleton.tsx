/** Shown instantly while a signed-in page loads, so every click responds at once. */
export function PageSkeleton() {
  const block = "animate-pulse rounded-3xl border border-line bg-surface";
  return (
    <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-xl bg-line" />
      <div className={`${block} h-28`} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className={`${block} h-48`} />
        <div className={`${block} h-48`} />
      </div>
      <div className={`${block} h-40`} />
    </div>
  );
}
