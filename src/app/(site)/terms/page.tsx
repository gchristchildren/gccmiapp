import { LegalPage } from "@/components/LegalPage";
import { termsOfUse as policy } from "@/lib/policies";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: policy.title, description: policy.description, path: policy.path });

export default function Page() {
  return <LegalPage title={policy.title} intro={policy.short} path={policy.path} sections={policy.sections} />;
}
