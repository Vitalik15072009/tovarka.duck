import { cn } from "@/lib/utils";

const meta: Record<string, { label: string; dot: string; text: string }> = {
  IN_STOCK: { label: "В наявності", dot: "bg-duck-teal", text: "text-duck-teal" },
  LOW_STOCK: { label: "Закінчується", dot: "bg-duck-gold", text: "text-duck-gold" },
  OUT_OF_STOCK: { label: "Немає в наявності", dot: "bg-duck-coral", text: "text-duck-coral" },
};

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const m = meta[status] ?? meta.IN_STOCK;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        m.text,
        size === "sm" ? "text-[11px]" : "text-[13px]"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
