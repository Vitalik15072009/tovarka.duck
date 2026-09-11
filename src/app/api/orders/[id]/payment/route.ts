import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderPaymentReviewSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";
import { serializeOrder } from "@/lib/serializeOrder";
import { PaymentStatus } from "@prisma/client";

/**
 * ЄДИНИЙ ендпоінт, який може перевести замовлення в PAID або FAILED.
 *
 * Захист:
 *  - вимагає валідний admin JWT (requireAdmin) — недоступно з клієнтського
 *    коду покупця;
 *  - CASH_ON_DELIVERY замовлення відхиляються — для них немає що підтверджувати;
 *  - дію можна виконати лише над замовленням у статусі PENDING (запобігає
 *    повторному підтвердженню вже оплаченого/відхиленого замовлення —
 *    захист від подвійного зарахування при повторному натисканні кнопки).
 *
 * Це РУЧНА перевірка людиною (адміном дивиться скріншот), не автоматичний
 * webhook — тому саме тут, а не на клієнті, приймається фінальне рішення.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = orderPaymentReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      if (existing.paymentMethod === "CASH_ON_DELIVERY") {
        throw new Error("NO_ONLINE_PAYMENT");
      }

      // Ідемпотентність: якщо статус уже фінальний, нічого повторно не робимо.
      if (existing.paymentStatus === PaymentStatus.PAID || existing.paymentStatus === PaymentStatus.FAILED) {
        return existing;
      }

      const { action, note } = parsed.data;
      const updated = await tx.order.update({
        where: { id },
        data:
          action === "CONFIRM"
            ? {
                paymentStatus: PaymentStatus.PAID,
                paymentConfirmedAt: new Date(),
                paymentAdminNote: note ?? null,
              }
            : {
                paymentStatus: PaymentStatus.FAILED,
                paymentRejectedAt: new Date(),
                paymentAdminNote: note ?? null,
              },
      });
      return updated;
    });

    const full = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!full) return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });

    return NextResponse.json({ order: serializeOrder(full) });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }
    if (err instanceof Error && err.message === "NO_ONLINE_PAYMENT") {
      return NextResponse.json(
        { error: "У цього замовлення немає онлайн-оплати для перевірки" },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/orders/:id/payment]", err);
    return NextResponse.json({ error: "Не вдалося оновити статус оплати" }, { status: 500 });
  }
}
