import { stockStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const meta = stockStatusLabel[status] ?? stockStatusLabel.IN_STOCK;
  const colorClass =
    status === "IN_STOCK"
      ? "text-duck-teal"
      : status === "LOW_STOCK"
      ? "text-duck-gold"
      : "text-duck-coral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colorClass,
        size === "sm" ? "text-[11px]" : "text-sm"
      )}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
