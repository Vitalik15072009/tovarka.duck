import { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

/**
 * Перетворює Prisma Order (з Decimal-полями) у JSON-безпечний обʼєкт.
 * Використовується в усіх API routes, що повертають замовлення, аби не
 * дублювати логіку конвертації Decimal -> number в кожному місці.
 */
export function serializeOrder(order: OrderWithItems) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    total: Number(order.total),
    prepaidAmount: order.prepaidAmount != null ? Number(order.prepaidAmount) : null,
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}
