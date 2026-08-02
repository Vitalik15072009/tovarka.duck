import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData } from "@/lib/telegramAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const initData = body?.initData as string | undefined;

  if (!initData) {
    return NextResponse.json({ error: "initData відсутній" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "Сервер не налаштований: відсутній TELEGRAM_BOT_TOKEN" },
      { status: 500 }
    );
  }

  const parsed = validateTelegramInitData(initData, botToken);
  if (!parsed || !parsed.user) {
    return NextResponse.json({ error: "Недійсні дані Telegram" }, { status: 401 });
  }

  try {
    const user = await prisma.user.upsert({
      where: { telegramId: String(parsed.user.id) },
      update: {
        username: parsed.user.username,
        firstName: parsed.user.first_name,
        lastName: parsed.user.last_name,
        photoUrl: parsed.user.photo_url,
      },
      create: {
        telegramId: String(parsed.user.id),
        username: parsed.user.username,
        firstName: parsed.user.first_name,
        lastName: parsed.user.last_name,
        photoUrl: parsed.user.photo_url,
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[POST /api/auth/telegram]", err);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
