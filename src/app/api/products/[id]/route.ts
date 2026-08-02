import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productUpdateSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";
import { calcDiscountPct } from "@/lib/utils";
import { serializeProduct } from "../route";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        colors: true,
        category: true,
      },
    });
    if (!product) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });

    const similar = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, colors: true, category: true },
    });

    return NextResponse.json({
      product: serializeProduct(product),
      similar: similar.map(serializeProduct),
    });
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });

    const nextPrice = data.price ?? Number(existing.price);
    const nextOldPrice =
      data.oldPrice !== undefined ? data.oldPrice : existing.oldPrice ? Number(existing.oldPrice) : null;
    const discountPct = calcDiscountPct(nextPrice, nextOldPrice);

    // Images/colors: if provided, replace entirely (simpler & avoids orphaned rows)
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.specs !== undefined && { specs: data.specs }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.oldPrice !== undefined && { oldPrice: data.oldPrice }),
        discountPct,
        ...(data.sizes !== undefined && { sizes: data.sizes }),
        ...(data.stockStatus !== undefined && { stockStatus: data.stockStatus }),
        ...(data.stockQty !== undefined && { stockQty: data.stockQty }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isNew !== undefined && { isNew: data.isNew }),
        ...(data.isPromo !== undefined && { isPromo: data.isPromo }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.images !== undefined && {
          images: {
            deleteMany: {},
            create: data.images.map((img, i) => ({ url: img.url, sortOrder: img.sortOrder ?? i })),
          },
        }),
        ...(data.colors !== undefined && {
          colors: { deleteMany: {}, create: data.colors },
        }),
      },
      include: { images: true, colors: true, category: true },
    });

    return NextResponse.json({ product: serializeProduct(product) });
  } catch (err) {
    console.error("[PATCH /api/products/:id]", err);
    return NextResponse.json({ error: "Не вдалося оновити товар" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Неможливо видалити товар: він фігурує в існуючих замовленнях. Змініть його статус наявності замість видалення." },
        { status: 409 }
      );
    }
    console.error("[DELETE /api/products/:id]", err);
    return NextResponse.json({ error: "Не вдалося видалити товар" }, { status: 500 });
  }
}
