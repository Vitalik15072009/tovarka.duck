"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingBag, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTelegram } from "@/context/TelegramContext";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Головна", icon: Home },
  { href: "/catalog", label: "Каталог", icon: Grid3x3 },
  { href: "/cart", label: "Кошик", icon: ShoppingBag },
  { href: "/favorites", label: "Обране", icon: Heart },
  { href: "/profile", label: "Профіль", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { haptic } = useTelegram();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-white/5 bg-tg-secondary-bg/90 backdrop-blur-lg">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptic("light")}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 transition-transform active:scale-90"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={cn(
                    "transition-colors",
                    active ? "text-duck-gold" : "text-tg-hint"
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
                {href === "/cart" && count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-duck-gold px-1 text-[10px] font-bold text-duck-ink">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-duck-gold" : "text-tg-hint"
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute -top-2 h-0.5 w-6 rounded-full bg-duck-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
