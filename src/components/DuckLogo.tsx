"use client";

import { cn } from "@/lib/utils";

/**
 * TovarkaDuck — фірмовий персонаж (@tovarka_duck).
 *
 * Побудований як точна ізометрична воксельна геометрія оригінального
 * логотипа: куб-голова, куб-тулуб, крило, дзьоб і око. Це чистий вектор,
 * тому качка залишається різкою на будь-якому екрані та розмірі й важить
 * кілька кілобайт замість растрового файлу.
 *
 * variant="full" — качка цілком (герой, порожні стани, футер)
 * variant="head" — тільки голова з дзьобом (аватар, іконки, категорії)
 */
export default function DuckLogo({
  size = 40,
  variant = "full",
  animate = false,
  className,
}: {
  size?: number;
  variant?: "full" | "head";
  animate?: boolean;
  className?: string;
}) {
  const head = variant === "head";
  const viewBox = head
    ? "-236.4 -183.0 239.4 186.4"
    : "-236.4 -183.0 377.4 315.0";
  const ratio = head ? 0.7786 : 0.8347;

  return (
    <svg
      width={size}
      height={Math.round(size * ratio)}
      viewBox={viewBox}
      fill="none"
      role="img"
      aria-label="TovarkaDuck"
      className={cn(animate && "animate-duck-bob", className)}
    >
      <g stroke="#0A0A0B" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        {head ? (
          <>
            <polygon points="-96.0,-171.0 -9.0,-127.5 -96.0,-84.0 -183.0,-127.5" fill="#FFD34A" />
            <polygon points="-183.0,-52.1 -96.0,-8.6 -96.0,-84.0 -183.0,-127.5" fill="#FFB800" />
            <polygon points="-9.0,-52.1 -96.0,-8.6 -96.0,-84.0 -9.0,-127.5" fill="#E8930A" />
            <polygon points="-169.2,-80.0 -133.2,-62.0 -188.4,-34.4 -224.4,-52.4" fill="#FF7A3D" strokeWidth={2.6} />
            <polygon points="-224.4,-33.7 -188.4,-15.7 -188.4,-34.4 -224.4,-52.4" fill="#F4511E" strokeWidth={2.6} />
            <polygon points="-133.2,-43.3 -188.4,-15.7 -188.4,-34.4 -133.2,-62.0" fill="#D63A0F" strokeWidth={2.6} />
            <polygon points="-57.0,-69.7 -81.0,-57.7 -81.0,-76.9 -57.0,-88.9" fill="#0A0A0B" strokeWidth={2.0} />
          </>
        ) : (
          <>
            <polygon points="36.0,-122.2 129.0,-75.7 105.0,-63.7 12.0,-110.2" fill="#FFD34A" strokeWidth={2.6} />
            <polygon points="12.0,-93.0 105.0,-46.5 105.0,-63.7 12.0,-110.2" fill="#FFB800" strokeWidth={2.6} />
            <polygon points="129.0,-58.5 105.0,-46.5 105.0,-63.7 129.0,-75.7" fill="#E8930A" strokeWidth={2.6} />
            <polygon points="0.0,-104.0 120.0,-44.0 0.0,16.0 -120.0,-44.0" fill="#FFD34A" />
            <polygon points="-120.0,60.0 0.0,120.0 0.0,16.0 -120.0,-44.0" fill="#FFB800" />
            <polygon points="120.0,60.0 0.0,120.0 0.0,16.0 120.0,-44.0" fill="#E8930A" />
            <polygon points="-96.0,-171.0 -9.0,-127.5 -96.0,-84.0 -183.0,-127.5" fill="#FFD34A" />
            <polygon points="-183.0,-52.1 -96.0,-8.6 -96.0,-84.0 -183.0,-127.5" fill="#FFB800" />
            <polygon points="-9.0,-52.1 -96.0,-8.6 -96.0,-84.0 -9.0,-127.5" fill="#E8930A" />
            <polygon points="-169.2,-80.0 -133.2,-62.0 -188.4,-34.4 -224.4,-52.4" fill="#FF7A3D" strokeWidth={2.6} />
            <polygon points="-224.4,-33.7 -188.4,-15.7 -188.4,-34.4 -224.4,-52.4" fill="#F4511E" strokeWidth={2.6} />
            <polygon points="-133.2,-43.3 -188.4,-15.7 -188.4,-34.4 -133.2,-62.0" fill="#D63A0F" strokeWidth={2.6} />
            <polygon points="-57.0,-69.7 -81.0,-57.7 -81.0,-76.9 -57.0,-88.9" fill="#0A0A0B" strokeWidth={2.0} />
          </>
        )}
      </g>
    </svg>
  );
}
