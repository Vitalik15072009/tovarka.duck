"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Banner from "@/components/Banner";
import SearchBar from "@/components/SearchBar";
import CategoryPill from "@/components/CategoryPill";
import ProductCard from "@/components/ProductCard";
import DuckLogo from "@/components/DuckLogo";
import { CategoryDTO, ProductDTO } from "@/types";
import { useTelegram } from "@/context/TelegramContext";

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-end justify-between px-4">
      <h2 className="font-display text-[17px] font-bold tracking-tight text-tg-text">
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[12px] font-semibold text-tg-hint transition-colors active:text-white"
      >
        Всі <ArrowRight size={13} strokeWidth={2.4} />
      </Link>
    </div>
  );
}

function ProductRow({ products }: { products: ProductDTO[] }) {
  if (!products.length) return null;
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} className="w-[43vw] max-w-[168px] flex-shrink-0" />
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton h-[248px] w-[43vw] max-w-[168px] flex-shrink-0 rounded-2xl"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user } = useTelegram();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [featured, setFeatured] = useState<ProductDTO[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductDTO[]>([]);
  const [promo, setPromo] = useState<ProductDTO[]>([]);
  const [recommended, setRecommended] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catsRes, featRes, newRes, promoRes, recRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?filter=featured&limit=10"),
          fetch("/api/products?filter=new&limit=10"),
          fetch("/api/products?filter=promo&limit=10"),
          fetch("/api/products?limit=10"),
        ]);
        const [cats, feat, news, promos, rec] = await Promise.all([
          catsRes.json(),
          featRes.json(),
          newRes.json(),
          promoRes.json(),
          recRes.json(),
        ]);
        setCategories(cats.categories ?? []);
        setFeatured(feat.products ?? []);
        setNewArrivals(news.products ?? []);
        setPromo(promos.products ?? []);
        setRecommended(rec.products ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="flex flex-col gap-7 pb-6">
      {/* --- Шапка бренду --- */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/80 px-4 pb-3 pt-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-tg-secondary-bg">
            <DuckLogo size={24} variant="head" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[16px] font-extrabold leading-tight tracking-tight">
              Tovarka<span className="brand-gradient">Duck</span>
            </h1>
            <p className="truncate text-[11px] text-tg-hint">
              {user ? `Привіт, ${user.first_name}` : "@tovarka_duck"}
            </p>
          </div>
        </div>
      </div>

      {/* --- Герой з персонажем --- */}
      <div className="animate-fade-up px-4">
        <Banner />
      </div>

      {/* --- Пошук --- */}
      <div className="px-4">
        <SearchBar />
      </div>

      {/* --- Категорії --- */}
      {categories.length > 0 && (
        <section>
          <div className="mb-3 px-4">
            <h2 className="font-display text-[17px] font-bold tracking-tight text-tg-text">
              Категорії
            </h2>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
            {categories.map((c) => (
              <CategoryPill key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Популярне" href="/catalog?filter=featured" />
        {loading ? <SkeletonRow /> : <ProductRow products={featured} />}
      </section>

      <section>
        <SectionHeader title="Новинки" href="/catalog?filter=new" />
        {loading ? <SkeletonRow /> : <ProductRow products={newArrivals} />}
      </section>

      <section>
        <SectionHeader title="Знижки" href="/catalog?filter=promo" />
        {loading ? <SkeletonRow /> : <ProductRow products={promo} />}
      </section>

      <section>
        <SectionHeader title="Рекомендуємо" href="/catalog" />
        {loading ? <SkeletonRow /> : <ProductRow products={recommended} />}
      </section>

      {/* --- Підпис бренду --- */}
      <footer className="flex flex-col items-center gap-2 px-4 pt-2 text-center">
        <DuckLogo size={40} className="opacity-40" />
        <p className="text-[11px] text-tg-hint">
          TovarkaDuck © {new Date().getFullYear()} · @tovarka_duck
        </p>
      </footer>
    </main>
  );
}
