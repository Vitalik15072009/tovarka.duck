export function formatUAH(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(n) + " грн";
}

export function calcDiscountPct(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function generateOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TD-${rand}`;
}

export const stockStatusLabel: Record<string, { label: string; emoji: string }> = {
  IN_STOCK: { label: "В наявності", emoji: "✅" },
  LOW_STOCK: { label: "Закінчується", emoji: "🟡" },
  OUT_OF_STOCK: { label: "Немає в наявності", emoji: "🔴" },
};

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
