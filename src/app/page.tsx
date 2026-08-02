"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Banner from "@/components/Banner";
import SearchBar from "@/components/SearchBar";
import CategoryPill from "@/components/CategoryPill";
import ProductCard from "@/components/ProductCard";
import { CategoryDTO, ProductDTO } from "@/types";
import { useTelegram } from "@/context/TelegramContext";

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="title-accent font-display text-lg font-bold text-tg-text">{title}</h2>
      <Link href={href} className="text-xs font-semibold text-duck-gold">
        Всі →
      </Link>
    </div>
  );
}

function ProductRow({ products }: { products: ProductDTO[] }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} className="w-36 flex-shrink-0" />
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-52 w-36 flex-shrink-0 rounded-3xl" />
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
    <main className="flex flex-col gap-6 pb-4 pt-3">
      <div className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-tg-hint">
              {user ? `Привіт, ${user.first_name}! 👋` : "Ласкаво просимо 👋"}
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-tg-text">
              Tovarka<span className="text-duck-gold">Duck</span> 🦆
            </h1>
          </div>
        </div>
        <SearchBar />
      </div>

      <div className="px-4">
        <Banner />
      </div>

      <section>
        <div className="mb-3 px-4">
          <h2 className="title-accent font-display text-lg font-bold text-tg-text">Категорії</h2>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
          {categories.map((c) => (
            <CategoryPill key={c.id} category={c} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="🔥 Популярні товари" href="/catalog?filter=featured" />
        {loading ? <SkeletonRow /> : <ProductRow products={featured} />}
      </section>

      <section>
        <SectionHeader title="✨ Новинки" href="/catalog?filter=new" />
        {loading ? <SkeletonRow /> : <ProductRow products={newArrivals} />}
      </section>

      <section>
        <SectionHeader title="💸 Акції" href="/catalog?filter=promo" />
        {loading ? <SkeletonRow /> : <ProductRow products={promo} />}
      </section>

      <section>
        <SectionHeader title="Рекомендуємо" href="/catalog" />
        {loading ? <SkeletonRow /> : <ProductRow products={recommended} />}
      </section>
    </main>
  );
}
