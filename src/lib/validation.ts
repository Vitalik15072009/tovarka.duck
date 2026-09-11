import { z } from "zod";

// --- Products ---------------------------------------------------------------

export const productImageSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().min(0).default(0),
});

export const productColorSchema = z.object({
  name: z.string().min(1).max(40),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Некоректний HEX колір"),
});

export const productCreateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1).max(5000),
  specs: z.record(z.string()).optional(),
  price: z.number().positive(),
  oldPrice: z.number().positive().nullable().optional(),
  sizes: z.array(z.string().max(10)).default([]),
  colors: z.array(productColorSchema).default([]),
  images: z.array(productImageSchema).min(1, "Потрібне хоча б одне фото"),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("IN_STOCK"),
  stockQty: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPromo: z.boolean().default(false),
  categoryId: z.string().min(1, "Оберіть категорію"),
});

export const productUpdateSchema = productCreateSchema.partial();

// --- Categories ---------------------------------------------------------------

export const categorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug має містити лише латинські літери, цифри та дефіси"),
  icon: z.string().max(10).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// --- Orders ---------------------------------------------------------------------

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  size: z.string().max(10).nullable().optional(),
  color: z.string().max(40).nullable().optional(),
});

// Способи оплати, доступні в checkout.
//   CASH_ON_DELIVERY        — накладений платіж, оплата при отриманні.
//   CARD_TRANSFER_FULL      — ручний переказ повної суми на картку, зі скріншотом.
//   CARD_TRANSFER_PREPAYMENT— ручний переказ фіксованої передоплати на картку,
//                             решта — при отриманні. Сума передоплати задається
//                             сервером через CARD_TRANSFER_PREPAYMENT_AMOUNT,
//                             клієнт її не передає і не може змінити.
export const paymentMethodEnum = z.enum([
  "CASH_ON_DELIVERY",
  "CARD_TRANSFER_FULL",
  "CARD_TRANSFER_PREPAYMENT",
]);

// Максимальний розмір скріншота як base64 data URL (символів рядка).
// ~2.6 МБ base64 ≈ ~2 МБ оригінального файлу. Обмежуємо, бо зображення
// зберігається безпосередньо в PostgreSQL (див. PAYMENT_INTEGRATION.md).
const MAX_SCREENSHOT_BASE64_LENGTH = 2_700_000;

export const orderCreateSchema = z
  .object({
    fullName: z.string().min(2, "Вкажіть імʼя").max(120),
    phone: z
      .string()
      .regex(/^\+?[0-9\s()-]{7,20}$/, "Некоректний номер телефону"),
    telegramUsername: z.string().max(60).optional().nullable(),
    city: z.string().min(2, "Вкажіть місто").max(120),
    novaPoshta: z.string().min(1, "Вкажіть відділення Нової Пошти").max(200),
    comment: z.string().max(1000).optional().nullable(),
    deliveryMethod: z.enum(["NOVA_POSHTA", "UKRPOSHTA"]).default("NOVA_POSHTA"),
    paymentMethod: paymentMethodEnum.default("CASH_ON_DELIVERY"),
    // Скріншот оплати як data URL, напр. "data:image/png;base64,....".
    // Обовʼязковий лише для CARD_TRANSFER_FULL / CARD_TRANSFER_PREPAYMENT
    // (перевіряється нижче через superRefine).
    paymentScreenshotBase64: z
      .string()
      .max(MAX_SCREENSHOT_BASE64_LENGTH, "Скріншот занадто великий (максимум ~2 МБ)")
      .regex(/^data:image\/(png|jpe?g|webp|heic|heif);base64,/, "Файл має бути зображенням")
      .optional()
      .nullable(),
    items: z.array(orderItemInputSchema).min(1, "Кошик порожній"),
    promoCode: z.string().max(40).optional().nullable(),
    initData: z.string().optional(), // Telegram WebApp initData for user identification
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "CASH_ON_DELIVERY" && !data.paymentScreenshotBase64) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentScreenshotBase64"],
        message: "Прикріпіть скріншот оплати",
      });
    }
  });

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// Ручна перевірка оплати адміном. Це ЄДИНИЙ спосіб перевести замовлення
// у PAID або FAILED — недоступний зі звичайного клієнтського коду,
// захищений requireAdmin() на сервері (див. api/orders/[id]/payment/route.ts).
export const orderPaymentReviewSchema = z.object({
  action: z.enum(["CONFIRM", "REJECT"]),
  note: z.string().max(500).optional().nullable(),
});

// --- Promo codes ---------------------------------------------------------------

export const promoValidateSchema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().positive(),
});

// --- Admin auth ---------------------------------------------------------------

export const adminLoginSchema = z.object({
  login: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});
