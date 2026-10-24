import Image from "next/image";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Certificate" };
export const dynamic = "force-dynamic";

export default async function Certificate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: cert } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (!cert) notFound();
  const { data: course } = await supabase.from("courses").select("title").eq("id", cert.course_id).maybeSingle();
  const issued = new Date(cert.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="print:hidden"><PrintButton /></div>
      <div className="rounded-3xl border-[6px] border-double border-brand bg-white p-8 text-center text-[#10261a] sm:p-14 print:rounded-none print:border-[6px]">
        <Image src="/brand/gccmi-logo.png" alt="GCC Ministry International" width={120} height={128} priority className="mx-auto" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#067f05]">Certificate of Completion</p>
        <p className="mt-8 text-sm text-neutral-600">This certifies that</p>
        <p className="mt-2 text-3xl font-bold sm:text-4xl">{cert.holder_name}</p>
        <p className="mt-6 text-sm text-neutral-600">has successfully completed the GCCMI Masterclass course</p>
        <p className="mt-2 text-2xl font-bold">{course?.title}</p>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4 text-left text-xs text-neutral-600">
          <div><p className="font-semibold text-[#10261a]">{issued}</p><p>Date issued</p></div>
          <div className="text-right"><p className="font-semibold text-[#10261a]">{cert.certificate_no}</p><p>Certificate number</p></div>
        </div>
      </div>
    </div>
  );
}
