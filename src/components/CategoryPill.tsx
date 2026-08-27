"use client";

import Link from "next/link";
import { CategoryDTO } from "@/types";
import { useTelegram } from "@/context/TelegramContext";
import DuckLogo from "./DuckLogo";

export default function CategoryPill({ category }: { category: CategoryDTO }) {
  const { haptic } = useTelegram();

  return (
    <Link
      href={`/catalog?category=${category.slug}`}
      onClick={() => haptic("light")}
      className="flex w-[68px] flex-shrink-0 flex-col items-center gap-2 transition-transform active:scale-90"
    >
      <span className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl border border-white/[0.07] bg-tg-secondary-bg text-2xl">
        {category.icon ? category.icon : <DuckLogo size={30} variant="head" />}
      </span>
      <span className="line-clamp-1 text-center text-[10.5px] font-medium text-tg-hint">
        {category.name}
      </span>
    </Link>
  );
}
