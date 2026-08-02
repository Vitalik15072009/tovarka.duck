"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { formatUAH } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  productCount: number;
  ordersByStatus: { status: string; count: number }[];
  topProducts: { productId: string; title: string; quantitySold: number }[];
  dailyRevenue: Record<string, number>;
}

const statusLabels: Record<string, string> = {
  NEW: "Нові",
  CONFIRMED: "Підтверджено",
  PROCESSING: "Комплектується",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminFetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="skeleton h-64 rounded-3xl" />;
  }

  const maxDaily = Math.max(1, ...Object.values(stats.dailyRevenue));
  const days = Object.entries(stats.dailyRevenue).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Дашборд</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Загальний дохід" value={formatUAH(stats.totalRevenue)} accent />
        <StatCard label="Всього замовлень" value={String(stats.totalOrders)} />
        <StatCard label="Товарів у каталозі" value={String(stats.productCount)} />
      </div>

      <div className="rounded-3xl bg-tg-secondary-bg p-5">
        <h2 className="mb-4 font-display text-base font-bold">Дохід за останні 30 днів</h2>
        <div className="flex h-32 items-end gap-1">
          {days.map(([day, val]) => (
            <div
              key={day}
              title={`${day}: ${formatUAH(val)}`}
              className="flex-1 rounded-t bg-gradient-to-t from-duck-gold-dark to-duck-gold transition-all"
              style={{ height: `${Math.max(4, (val / maxDaily) * 100)}%` }}
            />
          ))}
          {days.length === 0 && <p className="text-sm text-tg-hint">Даних поки немає</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-tg-secondary-bg p-5">
          <h2 className="mb-3 font-display text-base font-bold">Замовлення за статусом</h2>
          <div className="flex flex-col gap-2">
            {stats.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-tg-hint">{statusLabels[s.status] ?? s.status}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-tg-secondary-bg p-5">
          <h2 className="mb-3 font-display text-base font-bold">Топ товари</h2>
          <div className="flex flex-col gap-2">
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-tg-hint">Даних поки немає</p>
            ) : (
              stats.topProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1 text-tg-hint">{p.title}</span>
                  <span className="font-bold">{p.quantitySold} шт</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-3xl bg-tg-secondary-bg p-5">
      <p className="text-xs text-tg-hint">{label}</p>
      <p className={`mt-1 font-display text-xl font-extrabold ${accent ? "text-duck-gold" : "text-tg-text"}`}>
        {value}
      </p>
    </div>
  );
}
