import { Container } from "@/components/ui";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold">You&apos;re offline</h1>
      <p className="mt-3 text-muted">Check your connection and try again. Pages you have already visited may still load.</p>
    </Container>
  );
}
