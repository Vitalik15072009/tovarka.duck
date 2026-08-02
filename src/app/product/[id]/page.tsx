"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import PriceTag from "@/components/PriceTag";
import RatingStars from "@/components/RatingStars";
import StatusBadge from "@/components/StatusBadge";
import ProductCard from "@/components/ProductCard";
import { ProductDTO } from "@/types";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useTelegram } from "@/context/TelegramContext";
import { cn } from "@/lib/utils";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { haptic, notify, showMainButton, hideMainButton, showBackButton, hideBackButton } = useTelegram();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [similar, setSimilar] = useState<ProductDTO[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product ?? null);
        setSimilar(d.similar ?? []);
        if (d.product?.sizes?.length) setSize(d.product.sizes[0]);
        if (d.product?.colors?.length) setColor(d.product.colors[0].name);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    showBackButton(() => router.back());
    return () => hideBackButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddToCart(navigateToCart = false) {
    if (!product) return;
    haptic("medium");
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0]?.url ?? "",
      quantity: qty,
      size,
      color,
      maxQty: product.stockQty || 99,
    });
    notify("success");
    if (navigateToCart) router.push("/cart");
  }

  useEffect(() => {
    if (!product || product.stockStatus === "OUT_OF_STOCK") {
      hideMainButton();
      return;
    }
    showMainButton(`Купити за ${(product.price * qty).toLocaleString("uk-UA")} грн`, () =>
      handleAddToCart(true)
    );
    return () => hideMainButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, qty, size, color]);

  if (loading) {
    return (
      <>
        <Header title="Товар" showBack />
        <div className="flex flex-col gap-4 px-4">
          <div className="skeleton aspect-square w-full rounded-3xl" />
          <div className="skeleton h-6 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header title="Товар" showBack />
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="text-4xl">🦆</span>
          <p className="text-sm text-tg-hint">Товар не знайдено</p>
        </div>
      </>
    );
  }

  const fav = isFavorite(product.id);
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <>
      <Header
        title=""
        showBack
        right={
          <button
            onClick={() => {
              haptic("medium");
              toggleFavorite(product.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-tg-section transition-transform active:scale-90"
          >
            <Heart size={16} className={cn(fav ? "fill-duck-coral text-duck-coral" : "text-tg-text")} />
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-4 pb-24">
        {/* Gallery */}
        <div className="animate-scale-in">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-duck-charcoal">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage].url}
                alt={product.title}
                fill
                sizes="480px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🦆</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    i === activeImage ? "border-duck-gold" : "border-transparent"
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title / rating / price */}
        <div className="flex flex-col gap-2 animate-fade-up">
          <h1 className="font-display text-xl font-bold leading-snug text-tg-text">{product.title}</h1>
          <div className="flex items-center justify-between">
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <StatusBadge status={product.stockStatus} size="md" />
          </div>
          <PriceTag price={product.price} oldPrice={product.oldPrice} discountPct={product.discountPct} size="lg" />
        </div>

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-tg-text">Розмір</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    haptic("light");
                    setSize(s);
                  }}
                  className={cn(
                    "min-w-[44px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                    size === s
                      ? "border-duck-gold bg-duck-gold text-duck-ink"
                      : "border-white/10 bg-tg-section text-tg-text"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-tg-text">
              Колір{color ? `: ${color}` : ""}
            </span>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    haptic("light");
                    setColor(c.name);
                  }}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-transform active:scale-90",
                    color === c.name ? "border-duck-gold" : "border-white/20"
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-tg-text">Кількість</span>
          <div className="flex items-center gap-3 rounded-full bg-tg-section px-3 py-1.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-tg-bg transition-transform active:scale-90"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-bold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stockQty || 99, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-tg-bg transition-transform active:scale-90"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-tg-text">Опис</h2>
          <p className="text-sm leading-relaxed text-tg-hint">{product.description}</p>
        </div>

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-tg-text">Характеристики</h2>
            <div className="overflow-hidden rounded-2xl bg-tg-section">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 text-sm",
                    i % 2 === 1 && "bg-white/[0.02]"
                  )}
                >
                  <span className="text-tg-hint">{key}</span>
                  <span className="font-medium text-tg-text">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart (Telegram MainButton handles "Купити") */}
        <button
          onClick={() => handleAddToCart(false)}
          disabled={outOfStock}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-duck-gold py-3.5 text-sm font-bold text-duck-gold transition-transform active:scale-95 disabled:opacity-40"
        >
          <ShoppingBag size={16} />
          Додати в кошик
        </button>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-2">
            <h2 className="title-accent mb-3 font-display text-lg font-bold text-tg-text">
              Схожі товари
            </h2>
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} className="w-36 flex-shrink-0" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
