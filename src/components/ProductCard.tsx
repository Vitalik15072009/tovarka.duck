"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ProductDTO } from "@/types";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";
import StatusBadge from "./StatusBadge";
import { useFavorites } from "@/context/FavoritesContext";
import { useTelegram } from "@/context/TelegramContext";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, className }: { product: ProductDTO; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { haptic } = useTelegram();
  const fav = isFavorite(product.id);
  const cover = product.images[0]?.url;

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={() => haptic("light")}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-tg-section shadow-card transition-transform active:scale-[0.97]",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-duck-charcoal">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 480px) 50vw, 220px"
            className="object-cover transition-transform duration-500 group-active:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🦆</div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            haptic("medium");
            toggleFavorite(product.id);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-90"
          aria-label="Додати в обране"
        >
          <Heart
            size={16}
            className={cn(fav ? "fill-duck-coral text-duck-coral" : "text-white")}
          />
        </button>

        {product.discountPct ? (
          <span className="discount-tag absolute left-0 top-3 bg-duck-coral px-2.5 py-1 text-[11px] font-bold text-white">
            -{product.discountPct}%
          </span>
        ) : product.isNew ? (
          <span className="absolute left-2 top-2 rounded-full bg-duck-gold px-2 py-0.5 text-[10px] font-bold text-duck-ink">
            NEW
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-tg-text">
          {product.title}
        </h3>
        <RatingStars rating={product.rating} count={product.ratingCount} size={12} />
        <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
        <StatusBadge status={product.stockStatus} />
      </div>
    </Link>
  );
}
