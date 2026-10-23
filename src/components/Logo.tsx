import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 44, label = true }: { size?: number; label?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="GCCMI home">
      <Image
        src="/brand/gccmi-logo.png"
        alt=""
        width={Math.round(size * 0.94)}
        height={size}
        priority
        // The logo is single-colour green; lift it slightly in dark mode.
        className="dark:brightness-125"
      />
      {label && <span className="text-lg font-bold tracking-tight">GCCMI</span>}
    </Link>
  );
}
