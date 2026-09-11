"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Paperclip } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useTelegram } from "@/context/TelegramContext";
import { formatUAH } from "@/lib/utils";
import { PaymentMethod } from "@/types";

// Публічні дані для ручного переказу — це НЕ секрет (реквізити мають бути
// видимі кожному покупцю), тому їх можна безпечно тримати в NEXT_PUBLIC_*.
// Значення підставляються з .env.local / Vercel Environment Variables.
const CARD_NUMBER = process.env.NEXT_PUBLIC_CARD_TRANSFER_NUMBER || "";
const CARD_HOLDER = process.env.NEXT_PUBLIC_CARD_TRANSFER_HOLDER || "";
const PREPAYMENT_AMOUNT = Number(process.env.NEXT_PUBLIC_CARD_TRANSFER_PREPAYMENT_AMOUNT) || 150;

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 МБ у файлі до стиснення

interface FormState {
  fullName: string;
  phone: string;
  telegramUsername: string;
  city: string;
  novaPoshta: string;
  comment: string;
  deliveryMethod: "NOVA_POSHTA" | "UKRPOSHTA";
  paymentMethod: PaymentMethod;
}

const emptyForm: FormState = {
  fullName: "",
  phone: "",
  telegramUsername: "",
  city: "",
  novaPoshta: "",
  comment: "",
  deliveryMethod: "NOVA_POSHTA",
  // Нові замовлення оформлюються лише з оплатою на картку.
  // Накладений платіж більше не показується в checkout.
  paymentMethod: "CARD_TRANSFER_PREPAYMENT",
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountTotal, total, promo, clear } = useCart();
  const { user, initData, haptic, notify, showMainButton, hideMainButton } = useTelegram();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<PaymentMethod | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  const requiresScreenshot = form.paymentMethod !== "CASH_ON_DELIVERY";
  const isPrepayment = form.paymentMethod === "CARD_TRANSFER_PREPAYMENT";
  const amountToPayNow = isPrepayment ? Math.min(PREPAYMENT_AMOUNT, total) : total;
  const remainingAmount = isPrepayment ? Math.max(0, total - amountToPayNow) : 0;

  // Prefill Telegram username if available
  useEffect(() => {
    if (user?.username) {
      setForm((f) => ({ ...f, telegramUsername: user.username || "" }));
    }
  }, [user]);

  const canSubmit = !requiresScreenshot || Boolean(screenshotDataUrl);

  useEffect(() => {
    if (items.length === 0 || orderNumber) {
      hideMainButton();
      return;
    }
    if (!canSubmit) {
      hideMainButton();
      return;
    }
    showMainButton(`Підтвердити замовлення · ${formatUAH(total)}`, () => handleSubmit());
    return () => hideMainButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, items.length, total, orderNumber, canSubmit]);

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Вкажіть ваше імʼя";
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim())) next.phone = "Некоректний номер телефону";
    if (form.city.trim().length < 2) next.city = "Вкажіть місто";
    if (form.novaPoshta.trim().length < 1) next.novaPoshta = "Вкажіть відділення Нової Пошти";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setScreenshotError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScreenshotError("Потрібне зображення (скріншот)");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError("Файл занадто великий (максимум 5 МБ)");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setScreenshotFile(file);
      setScreenshotDataUrl(dataUrl);
    } catch {
      setScreenshotError("Не вдалося прочитати файл. Спробуйте ще раз.");
    }
  }

  async function handleSubmit() {
    if (submitting || orderNumber) return;
    if (!validate()) {
      notify("error");
      return;
    }
    if (requiresScreenshot && !screenshotDataUrl) {
      setScreenshotError("Прикріпіть скріншот оплати");
      notify("error");
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          telegramUsername: form.telegramUsername || undefined,
          comment: form.comment || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          promoCode: promo?.code,
          paymentScreenshotBase64: screenshotDataUrl ?? undefined,
          initData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Не вдалося оформити замовлення");
        notify("error");
        return;
      }
      notify("success");
      haptic("heavy");
      setOrderNumber(data.order.orderNumber);
      setOrderPaymentMethod(form.paymentMethod);
      clear();
    } catch {
      setServerError("Помилка мережі. Спробуйте ще раз.");
      notify("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    const isOnlinePayment = orderPaymentMethod && orderPaymentMethod !== "CASH_ON_DELIVERY";
    return (
      <>
        <Header title={isOnlinePayment ? "Оплату надіслано" : "Замовлення оформлено"} />
        <div className="flex flex-col items-center gap-4 px-6 py-20 text-center animate-scale-in">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              isOnlinePayment ? "bg-duck-gold/15" : "bg-duck-teal/15"
            }`}
          >
            {isOnlinePayment ? (
              <Clock3 size={44} className="text-duck-gold" />
            ) : (
              <CheckCircle2 size={44} className="text-duck-teal" />
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-tg-text">
            {isOnlinePayment ? "Дякуємо! Перевіряємо вашу оплату" : "Дякуємо за замовлення!"}
          </h1>
          <p className="text-sm text-tg-hint">
            Номер вашого замовлення <span className="font-bold text-duck-gold">#{orderNumber}</span>.
            {isOnlinePayment
              ? " Ми перевіримо скріншот оплати та підтвердимо замовлення найближчим часом. Статус можна відстежити в розділі «Мої замовлення»."
              : " Наш менеджер звʼяжеться з вами найближчим часом для підтвердження."}
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-2 rounded-2xl bg-duck-gold px-6 py-2.5 text-sm font-bold text-duck-ink transition-transform active:scale-95"
          >
            Мої замовлення
          </button>
          <button onClick={() => router.push("/")} className="text-sm text-tg-hint underline">
            На головну
          </button>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header title="Оформлення" showBack />
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="text-4xl">🦆</span>
          <p className="text-sm text-tg-hint">Кошик порожній</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Оформлення замовлення" showBack />
      <div className="flex flex-col gap-6 px-4 pb-32">
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-sm font-bold text-tg-text">Контактні дані</h2>
          <Field label="Ім'я та прізвище" error={errors.fullName}>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Ваше повне імʼя"
              className="input"
            />
          </Field>

          <Field label="Телефон" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+380 XX XXX XX XX"
              inputMode="tel"
              className="input"
            />
          </Field>

          <Field label="Telegram username">
            <input
              value={form.telegramUsername}
              onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
              placeholder="username"
              className="input"
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-bold text-tg-text">Доставка</h2>
          <RadioCard
            label="Нова Пошта"
            hint="1–2 дні · Безкоштовно"
            checked={form.deliveryMethod === "NOVA_POSHTA"}
            onSelect={() => setForm({ ...form, deliveryMethod: "NOVA_POSHTA" })}
          />
          <RadioCard
            label="Укрпошта"
            hint="3–5 днів · Безкоштовно"
            checked={form.deliveryMethod === "UKRPOSHTA"}
            onSelect={() => setForm({ ...form, deliveryMethod: "UKRPOSHTA" })}
          />

          <Field label="Місто" error={errors.city}>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ваше місто"
              className="input"
            />
          </Field>

          <Field
            label={form.deliveryMethod === "NOVA_POSHTA" ? "Відділення Нової Пошти" : "Відділення або адреса"}
            error={errors.novaPoshta}
          >
            <input
              value={form.novaPoshta}
              onChange={(e) => setForm({ ...form, novaPoshta: e.target.value })}
              placeholder="Наприклад: Відділення №5"
              className="input"
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-bold text-tg-text">Оплата</h2>
          <RadioCard
            label="Переказ на картку"
            hint="Повна сума · потрібен скріншот оплати"
            checked={form.paymentMethod === "CARD_TRANSFER_FULL"}
            onSelect={() => setForm({ ...form, paymentMethod: "CARD_TRANSFER_FULL" })}
          />
          <RadioCard
            label={`Передоплата ${formatUAH(PREPAYMENT_AMOUNT)}`}
            hint="решта при отриманні · потрібен скріншот"
            checked={form.paymentMethod === "CARD_TRANSFER_PREPAYMENT"}
            onSelect={() => setForm({ ...form, paymentMethod: "CARD_TRANSFER_PREPAYMENT" })}
          />

          {requiresScreenshot && (
            <div className="flex flex-col gap-3 rounded-2xl bg-tg-section p-4">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-xs text-tg-hint">Реквізити для оплати</span>
                <span className="font-display text-lg font-bold tracking-wide text-tg-text">
                  {CARD_NUMBER || "Реквізити не налаштовані"}
                </span>
                {CARD_HOLDER && <span className="text-xs text-tg-hint">{CARD_HOLDER}</span>}
              </div>

              <div className="border-t border-white/5 pt-3 text-center">
                <p className="text-xs text-tg-hint">
                  {isPrepayment ? "Внесіть передоплату" : "Внесіть повну суму"}
                </p>
                <p className="font-display text-2xl font-bold text-tg-text">{formatUAH(amountToPayNow)}</p>
                {isPrepayment && (
                  <p className="text-xs text-tg-hint">
                    Решта {formatUAH(remainingAmount)} — при отриманні
                  </p>
                )}
              </div>
            </div>
          )}

          {requiresScreenshot && (
            <Field label="Скріншот оплати *" error={screenshotError || undefined}>
              <label className="input flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/10 py-3.5 text-sm font-semibold text-tg-text">
                <Paperclip size={16} />
                {screenshotFile ? screenshotFile.name : "Прикріпити скріншот"}
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
              </label>
              {!screenshotDataUrl && (
                <span className="text-xs text-tg-hint">
                  Замовлення буде створено після прикріплення скріншота.
                </span>
              )}
            </Field>
          )}
        </section>

        <Field label="Коментар">
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Побажання до замовлення (необовʼязково)"
            rows={3}
            className="input resize-none"
          />
        </Field>

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
            <span>Сума замовлення</span>
            <span>{formatUAH(total)}</span>
          </div>
          {isPrepayment && (
            <p className="text-xs text-tg-hint">
              Зараз передоплата {formatUAH(amountToPayNow)} · решта {formatUAH(remainingAmount)} при отриманні
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-xl bg-duck-coral/10 px-3 py-2 text-sm text-duck-coral">{serverError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
          className="rounded-2xl bg-duck-gold py-3.5 text-sm font-bold text-duck-ink transition-transform active:scale-95 disabled:opacity-50"
        >
          {submitting
            ? "Оформлюємо..."
            : !canSubmit
            ? "Прикріпіть скріншот оплати"
            : `Підтвердити замовлення · ${formatUAH(total)}`}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          background-color: var(--tg-secondary-bg);
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-tg-text">{label}</span>
      {children}
      {error && <span className="text-xs text-duck-coral">{error}</span>}
    </label>
  );
}

function RadioCard({
  label,
  hint,
  checked,
  onSelect,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-colors ${
        checked ? "border-duck-gold bg-duck-gold/10" : "border-transparent bg-tg-section"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-tg-text">{label}</p>
        <p className="text-xs text-tg-hint">{hint}</p>
      </div>
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-duck-gold" : "border-tg-hint"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-duck-gold" />}
      </span>
    </button>
  );
}
