export interface ProductImageDTO {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductColorDTO {
  id: string;
  name: string;
  hex: string;
}

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductDTO {
  id: string;
  title: string;
  description: string;
  specs: Record<string, string> | null;
  price: number;
  oldPrice: number | null;
  discountPct: number | null;
  images: ProductImageDTO[];
  sizes: string[];
  colors: ProductColorDTO[];
  rating: number;
  ratingCount: number;
  stockStatus: StockStatus;
  stockQty: number;
  isFeatured: boolean;
  isNew: boolean;
  isPromo: boolean;
  categoryId: string;
  category?: { id: string; name: string; slug: string; icon: string | null };
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  maxQty: number;
}

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Спосіб оплати, обраний клієнтом у checkout.
export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "CARD_TRANSFER_FULL"
  | "CARD_TRANSFER_PREPAYMENT";

// Статус ОПЛАТИ (незалежний від OrderStatus — статусу виконання замовлення).
// PAID/FAILED виставляється ЛИШЕ адміном вручну після перевірки скріншота,
// через захищений ендпоінт PATCH /api/orders/:id/payment.
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItemDTO {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fullName: string;
  phone: string;
  telegramUsername?: string | null;
  city: string;
  novaPoshta: string;
  comment?: string | null;
  deliveryMethod: "NOVA_POSHTA" | "UKRPOSHTA";
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentScreenshotUrl?: string | null;
  prepaidAmount?: number | null;
  paymentConfirmedAt?: string | null;
  paymentRejectedAt?: string | null;
  paymentAdminNote?: string | null;
  items: OrderItemDTO[];
  subtotal: number;
  discountTotal: number;
  total: number;
  createdAt: string;
}
