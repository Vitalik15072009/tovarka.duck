"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/context/FavoritesContext";
import { ProductDTO } from "@/types";

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(favoriteIds.map((id) => fetch(`/api/products/${id}`).then((r) => r.json())))
      .then((results) => setProducts(results.map((r) => r.product).filter(Boolean)))
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  return (
    <>
      <Header title="Обране" />
      <div className="px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-3xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-4xl">🤍</span>
            <p className="text-sm text-tg-hint">Ви ще не додали товари в обране</p>
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
