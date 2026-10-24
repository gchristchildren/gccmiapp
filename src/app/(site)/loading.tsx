import { Container } from "@/components/ui";

export default function Loading() {
  const block = "animate-pulse rounded-3xl border border-line bg-surface";
  return (
    <Container className="space-y-6 py-14" aria-busy="true">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-line" />
      <div className="h-5 w-96 max-w-full animate-pulse rounded-xl bg-line" />
      <div className="grid gap-5 pt-6 md:grid-cols-3">
        <div className={`${block} h-48`} />
        <div className={`${block} h-48`} />
        <div className={`${block} h-48`} />
      </div>
    </Container>
  );
}
