"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { CategoryDTO, ProductDTO } from "@/types";
import { cn } from "@/lib/utils";

const filterTabs = [
  { key: null, label: "Всі" },
  { key: "featured", label: "Популярні" },
  { key: "new", label: "Новинки" },
  { key: "promo", label: "Акції" },
];

function CatalogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category");
  const filter = searchParams.get("filter");

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorySlug) params.set("category", categorySlug);
    if (filter) params.set("filter", filter);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, [q, categorySlug, filter]);

  const setFilter = useCallback(
    (key: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key) params.set("filter", key);
      else params.delete("filter");
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setCategory = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set("category", slug);
      else params.delete("category");
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <>
      <Header title="Каталог" />
      <div className="flex flex-col gap-4 px-4 pb-4">
        <SearchBar initialValue={q} />

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {filterTabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setFilter(t.key)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                filter === t.key
                  ? "bg-duck-gold text-duck-ink"
                  : "bg-tg-section text-tg-hint"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !categorySlug
                ? "border-duck-gold text-duck-gold"
                : "border-white/10 text-tg-hint"
            )}
          >
            Всі категорії
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                categorySlug === c.slug
                  ? "border-duck-gold text-duck-gold"
                  : "border-white/10 text-tg-hint"
              )}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-3xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-4xl">🦆</span>
            <p className="text-sm text-tg-hint">Нічого не знайдено. Спробуйте інший запит.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogInner />
    </Suspense>
  );
}
