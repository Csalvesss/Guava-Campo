import Image from "next/image";
import Link from "next/link";

export function Brand({
  tone = "dark",
  href = "/",
  size = "md",
}: {
  tone?: "dark" | "light";
  href?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-14" : size === "sm" ? "size-9" : "size-11";
  const kicker = tone === "light" ? "text-white/70" : "text-moss";
  const name = tone === "light" ? "text-white" : "text-pine";

  const inner = (
    <span className="flex items-center gap-3">
      <span
        className={`grid ${box} shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-black/5`}
      >
        <Image
          src="/sindicato-sjc.png"
          alt=""
          width={56}
          height={56}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="leading-tight">
        <span className={`block text-[0.62rem] font-bold uppercase tracking-[0.18em] ${kicker}`}>
          Sindicato Rural
        </span>
        <span className={`block font-display text-[1.05rem] font-semibold ${name}`}>
          São José dos Campos
        </span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Sindicato Rural de São José dos Campos — início">
      {inner}
    </Link>
  );
}
