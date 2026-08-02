import { formatUAH } from "@/lib/utils";

export default function PriceTag({
  price,
  oldPrice,
  discountPct,
  size = "md",
}: {
  price: number;
  oldPrice?: number | null;
  discountPct?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const priceSize = size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-display font-bold text-tg-text ${priceSize}`}>{formatUAH(price)}</span>
      {oldPrice ? (
        <span className="text-xs text-tg-hint line-through">{formatUAH(oldPrice)}</span>
      ) : null}
      {discountPct ? (
        <span className="discount-tag rounded bg-duck-coral px-1.5 py-0.5 text-[10px] font-bold text-white">
          -{discountPct}%
        </span>
      ) : null}
    </div>
  );
}
