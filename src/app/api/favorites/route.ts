import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData } from "@/lib/telegramAuth";

async function getUserFromInitData(initData: string | null) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!initData || !botToken) return null;
  const parsed = validateTelegramInitData(initData, botToken);
  if (!parsed?.user) return null;
  return prisma.user.findUnique({ where: { telegramId: String(parsed.user.id) } });
}

export async function GET(req: NextRequest) {
  const initData = req.nextUrl.searchParams.get("initData");
  const user = await getUserFromInitData(initData);
  if (!user) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1 }, colors: true, category: true } } },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => ({
      ...f.product,
      price: Number(f.product.price),
      oldPrice: f.product.oldPrice ? Number(f.product.oldPrice) : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const initData = body?.initData as string | undefined;
  const productId = body?.productId as string | undefined;
  if (!productId) return NextResponse.json({ error: "productId обовʼязковий" }, { status: 400 });

  const user = await getUserFromInitData(initData ?? null);
  if (!user) return NextResponse.json({ error: "Не вдалося ідентифікувати користувача" }, { status: 401 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ favorited: true });
  }
}
