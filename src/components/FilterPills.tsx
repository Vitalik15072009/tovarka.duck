"use client";

import { cn } from "@/lib/utils";
import { useTelegram } from "@/context/TelegramContext";

export interface FilterOption {
  value: string;
  label: string;
}

export default function FilterPills({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { haptic } = useTelegram();

  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => {
              haptic("light");
              onChange(o.value);
            }}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all duration-200 active:scale-95",
              active ? "pill pill-active" : "pill"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
