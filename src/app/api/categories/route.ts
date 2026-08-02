import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "Не вдалося завантажити категорії" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Категорія з таким slug вже існує" }, { status: 409 });
    }
    console.error("[POST /api/categories]", err);
    return NextResponse.json({ error: "Не вдалося створити категорію" }, { status: 500 });
  }
}
