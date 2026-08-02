"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTelegram } from "@/context/TelegramContext";

export default function Header({
  title,
  showBack = false,
  right,
}: {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const { haptic } = useTelegram();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-tg-bg/90 px-4 py-3.5 backdrop-blur-lg">
      {showBack && (
        <button
          onClick={() => {
            haptic("light");
            router.back();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-tg-section transition-transform active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <h1 className="flex-1 truncate font-display text-lg font-bold text-tg-text">{title}</h1>
      {right}
    </header>
  );
}
