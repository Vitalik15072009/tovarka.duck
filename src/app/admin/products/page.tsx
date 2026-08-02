"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { formatUAH } from "@/lib/utils";
import { ProductDTO } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Видалити цей товар безповоротно?")) return;
    const res = await adminFetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    else alert("Не вдалося видалити товар");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Товари</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-duck-gold px-4 py-2 text-sm font-bold text-duck-ink transition-transform active:scale-95"
        >
          <Plus size={16} />
          Додати товар
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-tg-secondary-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-tg-hint">
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Категорія</th>
              <th className="px-4 py-3">Ціна</th>
              <th className="px-4 py-3">Наявність</th>
              <th className="px-4 py-3">Кількість</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-tg-hint">
                  Завантаження...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-tg-hint">
                  Товарів ще немає
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-duck-charcoal">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="line-clamp-1 font-medium">{p.title}</span>
                  </td>
                  <td className="px-4 py-3 text-tg-hint">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{formatUAH(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.stockStatus === "IN_STOCK" ? "✅" : p.stockStatus === "LOW_STOCK" ? "🟡" : "🔴"}
                  </td>
                  <td className="px-4 py-3">{p.stockQty}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-tg-bg transition-transform active:scale-90"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-tg-bg text-duck-coral transition-transform active:scale-90"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
