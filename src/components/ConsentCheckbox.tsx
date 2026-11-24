import Link from "next/link";

/** The parent consent statement shown wherever a child is registered. */
export function ConsentCheckbox({ name = "consent" }: { name?: string }) {
  const link = "font-medium text-brand";
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-sm leading-relaxed sm:col-span-2">
      <input type="checkbox" name={name} required className="mt-1 size-4 shrink-0 accent-[var(--brand)]" />
      <span>
        I consent. I am the parent or legal carer of the child I am registering. I have read the{" "}
        <Link href="/privacy" target="_blank" className={link}>Privacy Notice</Link>,{" "}
        <Link href="/safeguarding" target="_blank" className={link}>Safeguarding Policy</Link> and{" "}
        <Link href="/online-classes-rules" target="_blank" className={link}>Online Classes and Parent Portal Rules</Link>, and I agree to them.
        I consent to GCCMI holding my child&apos;s name, age group, attendance and class work, and to my child joining live online
        classes on Zoom with at least two approved adults present.
      </span>
    </label>
  );
}
