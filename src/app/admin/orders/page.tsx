"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { formatUAH } from "@/lib/utils";
import { OrderDTO, OrderStatus, PaymentStatus } from "@/types";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "Нове" },
  { value: "CONFIRMED", label: "Підтверджено" },
  { value: "PROCESSING", label: "Комплектується" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "CANCELLED", label: "Скасовано" },
];

const paymentMethodLabel: Record<string, string> = {
  CASH_ON_DELIVERY: "Накладений платіж",
  CARD_TRANSFER_FULL: "Переказ · повна сума",
  CARD_TRANSFER_PREPAYMENT: "Переказ · передоплата",
};

const paymentStatusBadge: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Без оплати", className: "bg-white/5 text-tg-hint" },
  PENDING: { label: "Очікує перевірки", className: "bg-duck-gold/15 text-duck-gold" },
  PAID: { label: "Оплачено", className: "bg-duck-teal/15 text-duck-teal" },
  FAILED: { label: "Відхилено", className: "bg-duck-coral/15 text-duck-coral" },
  REFUNDED: { label: "Повернено", className: "bg-white/10 text-tg-text" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (paymentFilter) params.set("paymentStatus", paymentFilter);
    const qs = params.toString() ? `?${params.toString()}` : "";
    adminFetch(`/api/orders${qs}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter, paymentFilter]);

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await adminFetch(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  }

  async function reviewPayment(id: string, action: "CONFIRM" | "REJECT") {
    if (reviewingId) return;
    setReviewingId(id);
    try {
      const res = await adminFetch(`/api/orders/${id}/payment`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      } else {
        alert(data.error || "Не вдалося оновити статус оплати");
      }
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">Замовлення</h1>
        <div className="flex gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl bg-tg-secondary-bg px-3 py-2 text-sm"
          >
            <option value="">Всі статуси оплати</option>
            {(Object.keys(paymentStatusBadge) as PaymentStatus[]).map((s) => (
              <option key={s} value={s}>
                {paymentStatusBadge[s].label}
              </option>
            ))}
          </select>
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
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="skeleton h-24 rounded-3xl" />
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-tg-hint">Замовлень немає</p>
        ) : (
          orders.map((o) => {
            const badge = paymentStatusBadge[o.paymentStatus];
            const isOnlinePayment = o.paymentMethod !== "CASH_ON_DELIVERY";
            return (
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

                {/* --- Блок оплати --- */}
                <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-tg-bg p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-tg-text">
                      💳 {paymentMethodLabel[o.paymentMethod] || o.paymentMethod}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {isOnlinePayment && (
                    <>
                      <div className="flex justify-between text-xs text-tg-hint">
                        <span>ID платежу (замовлення)</span>
                        <span className="font-mono text-tg-text">{o.id}</span>
                      </div>
                      {o.prepaidAmount != null && (
                        <div className="flex justify-between text-xs text-tg-hint">
                          <span>Сума до переказу</span>
                          <span className="font-semibold text-tg-text">{formatUAH(o.prepaidAmount)}</span>
                        </div>
                      )}
                      {o.paymentScreenshotUrl && (
                        <a
                          href={o.paymentScreenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block overflow-hidden rounded-xl border border-white/10"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={o.paymentScreenshotUrl}
                            alt={`Скріншот оплати замовлення ${o.orderNumber}`}
                            className="max-h-56 w-full object-contain bg-black/40"
                          />
                        </a>
                      )}
                      {o.paymentAdminNote && (
                        <p className="text-xs italic text-tg-hint">Примітка: {o.paymentAdminNote}</p>
                      )}
                      {o.paymentStatus === "PENDING" && (
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => reviewPayment(o.id, "CONFIRM")}
                            disabled={reviewingId === o.id}
                            className="flex-1 rounded-xl bg-duck-teal py-2 text-xs font-bold text-duck-ink disabled:opacity-50"
                          >
                            Підтвердити оплату
                          </button>
                          <button
                            onClick={() => reviewPayment(o.id, "REJECT")}
                            disabled={reviewingId === o.id}
                            className="flex-1 rounded-xl bg-duck-coral/20 py-2 text-xs font-bold text-duck-coral disabled:opacity-50"
                          >
                            Відхилити
                          </button>
                        </div>
                      )}
                    </>
                  )}
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
            );
          })
        )}
      </div>
    </div>
  );
}
