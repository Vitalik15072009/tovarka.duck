"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ProductDTO } from "@/types";
import { formatUAH, cn } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { useTelegram } from "@/context/TelegramContext";
import DuckLogo from "./DuckLogo";

export default function ProductCard({
  product,
  className,
}: {
  product: ProductDTO;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { haptic } = useTelegram();
  const fav = isFavorite(product.id);
  const cover = product.images[0]?.url;
  const soldOut = product.stockStatus === "OUT_OF_STOCK";

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={() => haptic("light")}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-tg-secondary-bg transition-transform duration-200 active:scale-[0.97]",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0a0a0b]">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 480px) 50vw, 220px"
            className={cn(
              "object-cover transition-transform duration-500 group-active:scale-[1.04]",
              soldOut && "opacity-45 grayscale"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DuckLogo size={60} className="opacity-25" />
          </div>
        )}

        {/* Плавне затемнення знизу для читабельності */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            haptic("medium");
            toggleFavorite(product.id);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/45 backdrop-blur-md transition-transform active:scale-90"
          aria-label="Додати в обране"
        >
          <Heart
            size={15}
            strokeWidth={2.2}
            className={cn(fav ? "fill-duck-coral text-duck-coral" : "text-white")}
          />
        </button>

        {product.discountPct ? (
          <span className="discount-tag absolute left-0 top-2.5 bg-duck-beak px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
            -{product.discountPct}%
          </span>
        ) : product.isNew ? (
          <span className="absolute left-2 top-2 rounded-full bg-duck-gold px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-black">
            new
          </span>
        ) : null}

        {soldOut && (
          <span className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-tg-hint backdrop-blur">
            Немає в наявності
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        <h3 className="line-clamp-2 text-[12.5px] font-medium leading-snug text-tg-hint">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-1.5 pt-1">
          <span className="font-display text-[15px] font-extrabold tracking-tight text-white">
            {formatUAH(product.price)}
          </span>
          {product.oldPrice ? (
            <span className="text-[11px] text-tg-hint line-through">
              {formatUAH(product.oldPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
