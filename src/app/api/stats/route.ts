import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Немає доступу" }, { status: 401 });

  try {
    const [totalOrders, ordersByStatus, revenueAgg, productCount, topProductsRaw] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.product.count(),
      prisma.orderItem.groupBy({
        by: ["productId", "title"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const ordersLast30 = await prisma.order.findMany({
      where: { createdAt: { gte: last30 }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    // Group revenue by day for a simple sparkline on the dashboard
    const dailyRevenue: Record<string, number> = {};
    for (const o of ordersLast30) {
      const day = o.createdAt.toISOString().slice(0, 10);
      dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(o.total);
    }

    return NextResponse.json({
      totalOrders,
      totalRevenue: Number(revenueAgg._sum.total ?? 0),
      productCount,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count._all })),
      topProducts: topProductsRaw.map((p) => ({
        productId: p.productId,
        title: p.title,
        quantitySold: p._sum.quantity ?? 0,
      })),
      dailyRevenue,
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ error: "Не вдалося завантажити статистику" }, { status: 500 });
  }
}
