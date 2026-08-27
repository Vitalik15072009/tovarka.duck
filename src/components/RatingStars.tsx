import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  count,
  size = 12,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-duck-gold text-duck-gold" />
      <span className="text-[11.5px] font-semibold text-tg-text">
        {rating.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-[11px] text-tg-hint">({count})</span>
      )}
    </div>
  );
}
