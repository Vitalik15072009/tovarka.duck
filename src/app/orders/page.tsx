"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Header from "@/components/Header";
import DuckIcon from "@/components/DuckIcon";
import { useTelegram } from "@/context/TelegramContext";
import { formatUAH, cn } from "@/lib/utils";
import { OrderDTO, OrderStatus } from "@/types";

const statusLabels: Record<OrderStatus, string> = {
  NEW: "Нове",
  CONFIRMED: "Підтверджено",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

// Reference design groups orders into 4 tabs: Всі / Нові / В обробці / Відправлені.
// CONFIRMED is folded into "В обробці" so every backend status has a home.
const tabs: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "all", label: "Всі" },
  { key: "new", label: "Нові", statuses: ["NEW"] },
  { key: "processing", label: "В обробці", statuses: ["CONFIRMED", "PROCESSING"] },
  { key: "shipped", label: "Відправлені", statuses: ["SHIPPED", "DELIVERED"] },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export default function OrdersPage() {
  const { initData } = useTelegram();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initData) {
      setLoading(false);
      return;
    }
    fetch(`/api/user/orders?initData=${encodeURIComponent(initData)}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [initData]);

  const activeTab = tabs.find((t) => t.key === tab)!;
  const filtered = activeTab.statuses
    ? orders.filter((o) => activeTab.statuses!.includes(o.status))
    : orders;

  return (
    <>
      <Header title="Мої замовлення" />
      <div className="flex flex-col gap-4 px-4 pb-8">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                tab === t.key ? "bg-duck-gold text-duck-ink" : "bg-tg-section text-tg-hint"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <DuckIcon size={56} className="opacity-40" />
            <p className="font-display text-base font-bold text-tg-text">Замовлень немає</p>
            <p className="text-sm text-tg-hint">Оформіть перше замовлення в каталозі.</p>
            <Link
              href="/catalog"
              className="mt-2 rounded-full bg-tg-text px-6 py-2.5 text-sm font-bold text-duck-ink transition-transform active:scale-95"
            >
              До каталогу
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-2xl bg-tg-section p-3"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-duck-charcoal">
                  <DuckIcon size={28} className="opacity-50" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-tg-text">
                      Замовлення #{o.orderNumber}
                    </span>
                    {o.status === "NEW" && (
                      <span className="rounded-full bg-duck-gold px-2 py-0.5 text-[10px] font-bold text-duck-ink">
                        Нове
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-tg-hint">{formatDate(o.createdAt)}</p>
                  <p className="text-xs text-tg-hint">
                    {o.items.length} {o.items.length === 1 ? "товар" : "товари"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-tg-text">{formatUAH(o.total)}</p>
                  <p className="text-[11px] text-tg-hint">{statusLabels[o.status]}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !initData && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <PackageSearch size={40} className="text-tg-hint" />
            <p className="text-sm text-tg-hint">
              Відкрийте застосунок через Telegram, щоб побачити свої замовлення.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
