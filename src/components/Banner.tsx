"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DuckLogo from "./DuckLogo";

/** Головний банер магазину. Персонаж — воксельна качка TovarkaDuck. */
export default function Banner() {
  return (
    <section className="duck-halo relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[radial-gradient(130%_120%_at_85%_0%,#1b1c1f_0%,#0a0a0b_58%,#000000_100%)] px-5 pb-5 pt-6">
      {/* Персонаж бренду */}
      <DuckLogo
        size={215}
        animate
        className="pointer-events-none absolute -right-6 top-3 drop-shadow-[0_18px_36px_rgba(255,184,0,0.28)]"
      />

      <div className="relative z-10 max-w-[62%]">
        <h2 className="font-display text-[29px] font-extrabold leading-none tracking-tight">
          Tovarka<span className="brand-gradient">Duck</span>
        </h2>
        <p className="mt-2 text-[13px] leading-snug text-tg-hint">
          Оригінальний одяг, взуття та аксесуари
        </p>
        <p className="mt-1 text-[12px] font-semibold text-duck-gold/85">@tovarka_duck</p>
      </div>

      <div className="relative z-10 mt-5 flex items-center gap-2">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold text-black transition-transform active:scale-95"
        >
          Переглянути каталог
          <ArrowRight size={15} strokeWidth={2.6} />
        </Link>
        <Link
          href="/catalog?filter=promo"
          className="inline-flex items-center rounded-2xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-[13px] font-semibold text-white transition-transform active:scale-95"
        >
          Знижки
        </Link>
      </div>
    </section>
  );
}
