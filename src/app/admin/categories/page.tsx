"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { CategoryDTO } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name, slug, icon, sortOrder: categories.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Перевірте поля (slug — лише латиниця, цифри, дефіси)");
        return;
      }
      setName("");
      setSlug("");
      setIcon("");
      load();
    } catch {
      setError("Помилка мережі");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Видалити категорію?")) return;
    const res = await adminFetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Не вдалося видалити категорію");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Категорії</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-3xl bg-tg-secondary-bg p-5">
        <h2 className="font-display text-sm font-bold text-tg-hint">Нова категорія</h2>
        <div className="grid grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва (Одяг)"
            required
            className="rounded-xl bg-tg-bg px-3 py-2 text-sm"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="slug (clothing)"
            required
            className="rounded-xl bg-tg-bg px-3 py-2 text-sm"
          />
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Емодзі 👕"
            className="rounded-xl bg-tg-bg px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-duck-coral">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-duck-gold px-4 py-2 text-sm font-bold text-duck-ink transition-transform active:scale-95 disabled:opacity-50"
        >
          <Plus size={14} /> Додати
        </button>
      </form>

      <div className="overflow-hidden rounded-3xl bg-tg-secondary-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-tg-hint">
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Товарів</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  {c.icon} {c.name}
                </td>
                <td className="px-4 py-3 text-tg-hint">{c.slug}</td>
                <td className="px-4 py-3">{c._count?.products ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-tg-bg text-duck-coral"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
