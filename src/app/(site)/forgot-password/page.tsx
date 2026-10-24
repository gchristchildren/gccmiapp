import { Suspense } from "react";
import { Container } from "@/components/ui";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { noIndex } from "@/lib/seo";

export const metadata = { title: "Forgot password", ...noIndex };

export default function Page() {
  return (
    <Container className="py-16">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </Container>
  );
}
