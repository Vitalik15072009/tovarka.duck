"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Tag } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useTelegram } from "@/context/TelegramContext";
import { formatUAH } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, discountTotal, total, promo, applyPromo, removePromo } =
    useCart();
  const { haptic, notify, showMainButton, hideMainButton } = useTelegram();

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      hideMainButton();
      return;
    }
    showMainButton(`Оформити замовлення · ${formatUAH(total)}`, () => router.push("/checkout"));
    return () => hideMainButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, total]);

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setApplying(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || "Не вдалося застосувати промокод");
        notify("error");
        return;
      }
      applyPromo({ code: data.code, discountPct: data.discountPct, discountAmt: data.discountAmt });
      notify("success");
      haptic("medium");
    } catch {
      setPromoError("Помилка мережі");
    } finally {
      setApplying(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header title="Кошик" />
        <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
          <span className="text-5xl">🦆</span>
          <p className="text-sm text-tg-hint">Кошик порожній. Час знайти щось круте!</p>
          <button
            onClick={() => router.push("/catalog")}
            className="mt-2 rounded-2xl bg-duck-gold px-6 py-2.5 text-sm font-bold text-duck-ink transition-transform active:scale-95"
          >
            До каталогу
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Кошик" />
      <div className="flex flex-col gap-4 px-4 pb-32">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-3 rounded-2xl bg-tg-section p-3 animate-fade-up"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-duck-charcoal">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🦆</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-tg-text">{item.title}</h3>
                  <p className="text-xs text-tg-hint">
                    {[item.size, item.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-tg-bg px-2 py-1">
                    <button
                      onClick={() => {
                        haptic("light");
                        updateQuantity(item.productId, item.size, item.color, item.quantity - 1);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-90"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => {
                        haptic("light");
                        updateQuantity(item.productId, item.size, item.color, item.quantity + 1);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-90"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-display text-sm font-bold text-tg-text">
                    {formatUAH(item.price * item.quantity)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  haptic("medium");
                  removeItem(item.productId, item.size, item.color);
                }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center self-start rounded-full text-duck-coral transition-transform active:scale-90"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div className="rounded-2xl bg-tg-section p-3">
          {promo ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-duck-teal">
                <Tag size={15} /> Промокод {promo.code} застосовано
              </div>
              <button
                onClick={() => {
                  removePromo();
                  setPromoInput("");
                }}
                className="text-xs text-tg-hint underline"
              >
                Скасувати
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Промокод"
                  className="flex-1 rounded-xl bg-tg-bg px-3 py-2 text-sm placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-duck-gold/60"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={applying}
                  className="rounded-xl bg-duck-gold px-4 py-2 text-sm font-bold text-duck-ink transition-transform active:scale-95 disabled:opacity-50"
                >
                  Застосувати
                </button>
              </div>
              {promoError && <p className="text-xs text-duck-coral">{promoError}</p>}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex flex-col gap-1.5 rounded-2xl bg-tg-section p-4">
          <div className="flex justify-between text-sm text-tg-hint">
            <span>Сума товарів</span>
            <span>{formatUAH(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-duck-teal">
              <span>Знижка</span>
              <span>-{formatUAH(discountTotal)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-white/5 pt-2 font-display text-base font-bold text-tg-text">
            <span>Разом</span>
            <span>{formatUAH(total)}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/checkout")}
          className="rounded-2xl bg-duck-gold py-3.5 text-sm font-bold text-duck-ink transition-transform active:scale-95"
        >
          Оформити замовлення · {formatUAH(total)}
        </button>
      </div>
    </>
  );
}
