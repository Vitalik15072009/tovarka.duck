import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promoValidateSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = promoValidateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Некоректні дані" }, { status: 400 });

  const { code, subtotal } = parsed.data;

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo) return NextResponse.json({ error: "Промокод не знайдено" }, { status: 404 });
  if (!promo.isActive) return NextResponse.json({ error: "Промокод більше не активний" }, { status: 400 });
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Термін дії промокоду закінчився" }, { status: 400 });
  }
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return NextResponse.json({ error: "Ліміт використання промокоду вичерпано" }, { status: 400 });
  }

  const discountAmt = promo.discountAmt ? Number(promo.discountAmt) : undefined;
  const discount = promo.discountPct
    ? Math.round((subtotal * promo.discountPct) / 100)
    : Math.min(discountAmt ?? 0, subtotal);

  return NextResponse.json({
    code: promo.code,
    discountPct: promo.discountPct,
    discountAmt,
    discount,
  });
}
