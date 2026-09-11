import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData } from "@/lib/telegramAuth";
import { serializeOrder } from "@/lib/serializeOrder";

export async function GET(req: NextRequest) {
  const initData = req.nextUrl.searchParams.get("initData");
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!initData || !botToken) {
    return NextResponse.json({ orders: [] });
  }

  const parsed = validateTelegramInitData(initData, botToken);
  if (!parsed?.user) {
    return NextResponse.json({ orders: [] });
  }

  const user = await prisma.user.findUnique({ where: { telegramId: String(parsed.user.id) } });
  if (!user) return NextResponse.json({ orders: [] });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}
