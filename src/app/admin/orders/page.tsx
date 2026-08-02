"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { formatUAH } from "@/lib/utils";
import { OrderDTO, OrderStatus } from "@/types";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "Нове" },
  { value: "CONFIRMED", label: "Підтверджено" },
  { value: "PROCESSING", label: "Комплектується" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "CANCELLED", label: "Скасовано" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    adminFetch(`/api/orders${qs}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await adminFetch(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Замовлення</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-tg-secondary-bg px-3 py-2 text-sm"
        >
          <option value="">Всі статуси</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="skeleton h-24 rounded-3xl" />
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-tg-hint">Замовлень немає</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-3xl bg-tg-secondary-bg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-bold">#{o.orderNumber}</p>
                  <p className="text-xs text-tg-hint">
                    {new Date(o.createdAt).toLocaleString("uk-UA")}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  className="rounded-xl bg-tg-bg px-3 py-1.5 text-xs font-semibold"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-tg-hint">
                <span>👤 {o.fullName}</span>
                <span>📞 {o.phone}</span>
                <span>🏙 {o.city}, {o.novaPoshta}</span>
                {o.telegramUsername && <span>💬 @{o.telegramUsername}</span>}
              </div>

              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="mt-3 text-xs font-semibold text-duck-gold"
              >
                {expanded === o.id ? "Сховати товари" : `Показати товари (${o.items.length})`}
              </button>

              {expanded === o.id && (
                <div className="mt-2 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span>
                        {i.title} × {i.quantity}
                        {i.size ? ` (${i.size})` : ""}
                        {i.color ? ` · ${i.color}` : ""}
                      </span>
                      <span className="font-semibold">{formatUAH(i.price * i.quantity)}</span>
                    </div>
                  ))}
                  {o.comment && <p className="mt-1 text-xs italic text-tg-hint">💬 {o.comment}</p>}
                </div>
              )}

              <div className="mt-3 flex justify-between border-t border-white/5 pt-3 font-display font-bold">
                <span>Разом</span>
                <span>{formatUAH(o.total)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
