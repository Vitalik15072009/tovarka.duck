"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ClipboardList, LogOut } from "lucide-react";
import { clearAdminToken } from "@/lib/adminClient";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/products", label: "Товари", icon: Package },
  { href: "/admin/categories", label: "Категорії", icon: FolderTree },
  { href: "/admin/orders", label: "Замовлення", icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col justify-between border-r border-white/5 bg-tg-secondary-bg p-4">
      <div>
        <div className="mb-6 px-2">
          <h1 className="font-display text-lg font-extrabold text-tg-text">
            Tovarka<span className="text-duck-gold">Duck</span>
          </h1>
          <p className="text-xs text-tg-hint">Адмін-панель</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-duck-gold text-duck-ink" : "text-tg-hint hover:bg-tg-section"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={() => {
          clearAdminToken();
          router.push("/admin/login");
        }}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-duck-coral transition-colors hover:bg-tg-section"
      >
        <LogOut size={16} />
        Вийти
      </button>
    </aside>
  );
}
