import { Suspense } from "react";
import { Container } from "@/components/ui";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function Login() {
  return (
    <Container className="py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
