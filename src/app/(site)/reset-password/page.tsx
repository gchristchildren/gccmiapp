import { Suspense } from "react";
import { Container } from "@/components/ui";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { noIndex } from "@/lib/seo";

export const metadata = { title: "Reset password", ...noIndex };

export default function Page() {
  return (
    <Container className="py-16">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </Container>
  );
}
