import { serializeProduct } from "@/lib/serializeProduct";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";
import { calcDiscountPct } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categorySlug = searchParams.get("category");
  const filter = searchParams.get("filter"); // featured | new | promo
  const limit = Math.min(Number(searchParams.get("limit")) || 40, 100);
  const cursor = searchParams.get("cursor") || undefined;

  const where: Prisma.ProductWhereInput = {};

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (filter === "featured") where.isFeatured = true;
  if (filter === "new") where.isNew = true;
  if (filter === "promo") where.isPromo = true;

  try {
    const products = await prisma.product.findMany({
      where,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        colors: true,
        category: true,
      },
    });

    const nextCursor = products.length === limit ? products[products.length - 1].id : null;

    return NextResponse.json({
      products: products.map(serializeProduct),
      nextCursor,
    });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Не вдалося завантажити товари" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const discountPct = calcDiscountPct(data.price, data.oldPrice ?? undefined);
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        specs: data.specs ?? {},
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        discountPct,
        sizes: data.sizes,
        stockStatus: data.stockStatus,
        stockQty: data.stockQty,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        isPromo: data.isPromo,
        categoryId: data.categoryId,
        images: { create: data.images.map((img, i) => ({ url: img.url, sortOrder: img.sortOrder ?? i })) },
        colors: { create: data.colors },
      },
      include: { images: true, colors: true, category: true },
    });
    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json({ error: "Не вдалося створити товар" }, { status: 500 });
  }
}

