import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ category });
  } catch (err) {
    console.error("[PATCH /api/categories/:id]", err);
    return NextResponse.json({ error: "Не вдалося оновити категорію" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  try {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: "Неможливо видалити категорію, поки в ній є товари" },
        { status: 409 }
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/categories/:id]", err);
    return NextResponse.json({ error: "Не вдалося видалити категорію" }, { status: 500 });
  }
}
