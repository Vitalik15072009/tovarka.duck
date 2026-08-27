"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTelegram } from "@/context/TelegramContext";
import DuckLogo from "./DuckLogo";
import { cn } from "@/lib/utils";

export default function Header({
  title,
  showBack = false,
  showDuck = false,
  right,
}: {
  title: string;
  showBack?: boolean;
  showDuck?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const { haptic } = useTelegram();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-black/80 px-4 py-3 backdrop-blur-xl">
      {showBack && (
        <button
          onClick={() => {
            haptic("light");
            router.back();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-tg-secondary-bg transition-transform active:scale-90"
          aria-label="Назад"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {showDuck && (
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-tg-secondary-bg">
          <DuckLogo size={22} variant="head" />
        </span>
      )}

      <h1
        className={cn(
          "flex-1 truncate font-display text-[17px] font-bold tracking-tight text-tg-text"
        )}
      >
        {title}
      </h1>

      {right}
    </header>
  );
}
