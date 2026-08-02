import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/utils";
import { validateTelegramInitData } from "@/lib/telegramAuth";
import { notifyAdminOfNewOrder } from "@/lib/telegramNotify";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Identify the Telegram user, if initData was supplied and is valid.
  let userId: string | null = null;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (data.initData && botToken) {
    const parsedInit = validateTelegramInitData(data.initData, botToken);
    if (parsedInit?.user) {
      const user = await prisma.user.upsert({
        where: { telegramId: String(parsedInit.user.id) },
        update: {
          username: parsedInit.user.username,
          firstName: parsedInit.user.first_name,
          lastName: parsedInit.user.last_name,
        },
        create: {
          telegramId: String(parsedInit.user.id),
          username: parsedInit.user.username,
          firstName: parsedInit.user.first_name,
          lastName: parsedInit.user.last_name,
        },
      });
      userId = user.id;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch every product server-side — never trust client-sent prices.
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData: {
        productId: string;
        title: string;
        price: number;
        quantity: number;
        size?: string | null;
        color?: string | null;
      }[] = [];

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error(`Товар ${item.productId} не знайдено`);
        if (product.stockStatus === "OUT_OF_STOCK" || product.stockQty < item.quantity) {
          throw new Error(`Товар "${product.title}" немає в достатній кількості`);
        }
        const price = Number(product.price);
        subtotal += price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          title: product.title,
          price,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
        });
      }

      // Promo code validation & discount calculation (server-side, authoritative)
      let discountTotal = 0;
      let promoCodeId: string | null = null;
      if (data.promoCode) {
        const promo = await tx.promoCode.findUnique({ where: { code: data.promoCode.toUpperCase() } });
        if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
          const underLimit = !promo.usageLimit || promo.usedCount < promo.usageLimit;
          if (underLimit) {
            if (promo.discountPct) discountTotal = Math.round((subtotal * promo.discountPct) / 100);
            else if (promo.discountAmt) discountTotal = Math.min(Number(promo.discountAmt), subtotal);
            promoCodeId = promo.id;
            await tx.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
          }
        }
      }

      const total = Math.max(0, subtotal - discountTotal);

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          fullName: data.fullName,
          phone: data.phone,
          telegramUsername: data.telegramUsername,
          city: data.city,
          novaPoshta: data.novaPoshta,
          comment: data.comment,
          subtotal,
          discountTotal,
          total,
          promoCodeId,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      // Decrement stock and auto-update stock status labels
      for (const item of orderItemsData) {
        const product = productMap.get(item.productId)!;
        const newQty = product.stockQty - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: newQty,
            stockStatus: newQty <= 0 ? "OUT_OF_STOCK" : newQty <= 5 ? "LOW_STOCK" : "IN_STOCK",
          },
        });
      }

      return order;
    });

    // Fire-and-forget admin notification — failure here must not fail the order.
    notifyAdminOfNewOrder({
      orderNumber: result.orderNumber,
      fullName: result.fullName,
      phone: result.phone,
      telegramUsername: result.telegramUsername,
      city: result.city,
      novaPoshta: result.novaPoshta,
      comment: result.comment,
      total: Number(result.total),
      items: result.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: Number(i.price),
        size: i.size,
        color: i.color,
      })),
    }).catch((e) => console.error("[notifyAdminOfNewOrder]", e));

    return NextResponse.json(
      {
        order: {
          ...result,
          subtotal: Number(result.subtotal),
          discountTotal: Number(result.discountTotal),
          total: Number(result.total),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    const message = err instanceof Error ? err.message : "Не вдалося оформити замовлення";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  try {
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : {},
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        discountTotal: Number(o.discountTotal),
        total: Number(o.total),
        items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
      })),
    });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Не вдалося завантажити замовлення" }, { status: 500 });
  }
}
