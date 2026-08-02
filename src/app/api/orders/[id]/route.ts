import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, user: true } });
  if (!order) return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json({ order: { ...order, total: Number(order.total) } });
  } catch (err) {
    console.error("[PATCH /api/orders/:id]", err);
    return NextResponse.json({ error: "Не вдалося оновити статус" }, { status: 500 });
  }
}
