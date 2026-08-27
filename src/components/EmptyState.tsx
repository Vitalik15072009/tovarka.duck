"use client";

import Link from "next/link";
import DuckLogo from "./DuckLogo";

export default function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <DuckLogo size={92} animate className="opacity-90" />
      <h3 className="mt-2 font-display text-base font-bold text-tg-text">{title}</h3>
      {subtitle && <p className="text-[13px] leading-relaxed text-tg-hint">{subtitle}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-3 rounded-2xl bg-white px-5 py-2.5 text-[13px] font-bold text-black transition-transform active:scale-95"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
