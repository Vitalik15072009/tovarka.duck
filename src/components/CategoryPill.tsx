"use client";

import Link from "next/link";
import { CategoryDTO } from "@/types";
import { useTelegram } from "@/context/TelegramContext";

export default function CategoryPill({ category }: { category: CategoryDTO }) {
  const { haptic } = useTelegram();
  return (
    <Link
      href={`/catalog?category=${category.slug}`}
      onClick={() => haptic("light")}
      className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 transition-transform active:scale-90"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tg-section text-2xl shadow-card">
        {category.icon || "🦆"}
      </div>
      <span className="line-clamp-1 text-center text-[11px] font-medium text-tg-hint">
        {category.name}
      </span>
    </Link>
  );
}
