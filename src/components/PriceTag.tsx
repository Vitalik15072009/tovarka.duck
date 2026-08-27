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
  const priceSize =
    size === "lg" ? "text-[26px]" : size === "md" ? "text-[16px]" : "text-[14px]";

  return (
    <div className="flex items-baseline gap-2">
      <span
        className={`font-display font-extrabold tracking-tight text-tg-text ${priceSize}`}
      >
        {formatUAH(price)}
      </span>
      {oldPrice ? (
        <span className="text-[12px] text-tg-hint line-through">
          {formatUAH(oldPrice)}
        </span>
      ) : null}
      {discountPct ? (
        <span className="discount-tag rounded bg-duck-beak px-1.5 py-0.5 text-[10px] font-extrabold text-white">
          -{discountPct}%
        </span>
      ) : null}
    </div>
  );
}
