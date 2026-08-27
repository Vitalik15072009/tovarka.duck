"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Package, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTelegram } from "@/context/TelegramContext";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Головна", icon: Home },
  { href: "/catalog", label: "Каталог", icon: LayoutGrid },
  { href: "/cart", label: "Кошик", icon: ShoppingBag },
  { href: "/orders", label: "Замовлення", icon: Package },
  { href: "/profile", label: "Профіль", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { haptic } = useTelegram();

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-white/[0.07] bg-black/85 shadow-sheet backdrop-blur-2xl">
      <div className="flex items-stretch justify-around px-1 pt-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptic("light")}
              className="relative flex flex-1 flex-col items-center gap-1 py-1 transition-transform active:scale-90"
            >
              <span className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.8}
                  className={cn(
                    "transition-colors duration-200",
                    active ? "text-white" : "text-tg-hint"
                  )}
                />
                {href === "/cart" && count > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-duck-gold px-1 text-[10px] font-extrabold text-black">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  active ? "text-white" : "text-tg-hint"
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "mt-0.5 h-[3px] w-4 rounded-full transition-all duration-200",
                  active ? "bg-duck-gold" : "bg-transparent"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
