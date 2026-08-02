"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { CategoryDTO, ProductDTO } from "@/types";

export interface ProductFormValues {
  title: string;
  description: string;
  specs: { key: string; value: string }[];
  price: string;
  oldPrice: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: { url: string }[];
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  stockQty: string;
  isFeatured: boolean;
  isNew: boolean;
  isPromo: boolean;
  categoryId: string;
}

function emptyValues(): ProductFormValues {
  return {
    title: "",
    description: "",
    specs: [{ key: "", value: "" }],
    price: "",
    oldPrice: "",
    sizes: [],
    colors: [],
    images: [{ url: "" }],
    stockStatus: "IN_STOCK",
    stockQty: "0",
    isFeatured: false,
    isNew: false,
    isPromo: false,
    categoryId: "",
  };
}

export function fromProductDTO(p: ProductDTO): ProductFormValues {
  return {
    title: p.title,
    description: p.description,
    specs: p.specs && Object.keys(p.specs).length ? Object.entries(p.specs).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }],
    price: String(p.price),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
    sizes: p.sizes,
    colors: p.colors.map((c) => ({ name: c.name, hex: c.hex })),
    images: p.images.length ? p.images.map((i) => ({ url: i.url })) : [{ url: "" }],
    stockStatus: p.stockStatus,
    stockQty: String(p.stockQty),
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    isPromo: p.isPromo,
    categoryId: p.categoryId,
  };
}

export default function ProductForm({
  initial,
  productId,
}: {
  initial?: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? emptyValues());
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeInput, setSizeInput] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: values.title,
      description: values.description,
      specs: Object.fromEntries(values.specs.filter((s) => s.key.trim()).map((s) => [s.key, s.value])),
      price: Number(values.price),
      oldPrice: values.oldPrice ? Number(values.oldPrice) : null,
      sizes: values.sizes,
      colors: values.colors.filter((c) => c.name.trim() && c.hex.trim()),
      images: values.images.filter((i) => i.url.trim()).map((i, idx) => ({ url: i.url.trim(), sortOrder: idx })),
      stockStatus: values.stockStatus,
      stockQty: Number(values.stockQty),
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      isPromo: values.isPromo,
      categoryId: values.categoryId,
    };

    try {
      const res = await adminFetch(productId ? `/api/products/${productId}` : "/api/products", {
        method: productId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Перевірте правильність заповнення полів");
        return;
      }
      router.push("/admin/products");
    } catch {
      setError("Помилка мережі");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-duck-coral/10 px-4 py-3 text-sm text-duck-coral">{error}</p>}

      <Section title="Основне">
        <LabeledInput label="Назва товару">
          <input required value={values.title} onChange={(e) => set("title", e.target.value)} className="input" />
        </LabeledInput>
        <LabeledInput label="Опис">
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="input resize-none"
          />
        </LabeledInput>
        <LabeledInput label="Категорія">
          <select
            required
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="input"
          >
            <option value="">Оберіть категорію</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </LabeledInput>
      </Section>

      <Section title="Ціна та наявність">
        <div className="grid grid-cols-2 gap-4">
          <LabeledInput label="Ціна (грн)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              className="input"
            />
          </LabeledInput>
          <LabeledInput label="Стара ціна (необовʼязково)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.oldPrice}
              onChange={(e) => set("oldPrice", e.target.value)}
              className="input"
            />
          </LabeledInput>
          <LabeledInput label="Статус наявності">
            <select
              value={values.stockStatus}
              onChange={(e) => set("stockStatus", e.target.value as ProductFormValues["stockStatus"])}
              className="input"
            >
              <option value="IN_STOCK">✅ В наявності</option>
              <option value="LOW_STOCK">🟡 Закінчується</option>
              <option value="OUT_OF_STOCK">🔴 Немає в наявності</option>
            </select>
          </LabeledInput>
          <LabeledInput label="Кількість на складі">
            <input
              type="number"
              min="0"
              value={values.stockQty}
              onChange={(e) => set("stockQty", e.target.value)}
              className="input"
            />
          </LabeledInput>
        </div>
      </Section>

      <Section title="Фото (URL)">
        {values.images.map((img, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={img.url}
              onChange={(e) => {
                const next = [...values.images];
                next[i] = { url: e.target.value };
                set("images", next);
              }}
              placeholder="https://..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => set("images", values.images.filter((_, idx) => idx !== i))}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tg-bg text-duck-coral"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("images", [...values.images, { url: "" }])}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-tg-bg px-3 py-2 text-xs font-semibold text-duck-gold"
        >
          <Plus size={14} /> Додати фото
        </button>
      </Section>

      <Section title="Розміри">
        <div className="flex flex-wrap gap-2">
          {values.sizes.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-tg-bg px-3 py-1 text-xs font-semibold">
              {s}
              <button type="button" onClick={() => set("sizes", values.sizes.filter((x) => x !== s))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="Наприклад: M"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (sizeInput.trim()) {
                set("sizes", [...values.sizes, sizeInput.trim()]);
                setSizeInput("");
              }
            }}
            className="rounded-xl bg-tg-bg px-4 text-sm font-semibold text-duck-gold"
          >
            Додати
          </button>
        </div>
      </Section>

      <Section title="Кольори">
        {values.colors.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={c.name}
              onChange={(e) => {
                const next = [...values.colors];
                next[i] = { ...next[i], name: e.target.value };
                set("colors", next);
              }}
              placeholder="Назва (напр. Чорний)"
              className="input flex-1"
            />
            <input
              value={c.hex}
              onChange={(e) => {
                const next = [...values.colors];
                next[i] = { ...next[i], hex: e.target.value };
                set("colors", next);
              }}
              placeholder="#161a21"
              className="input w-28"
            />
            <button
              type="button"
              onClick={() => set("colors", values.colors.filter((_, idx) => idx !== i))}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tg-bg text-duck-coral"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("colors", [...values.colors, { name: "", hex: "#000000" }])}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-tg-bg px-3 py-2 text-xs font-semibold text-duck-gold"
        >
          <Plus size={14} /> Додати колір
        </button>
      </Section>

      <Section title="Характеристики">
        {values.specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={s.key}
              onChange={(e) => {
                const next = [...values.specs];
                next[i] = { ...next[i], key: e.target.value };
                set("specs", next);
              }}
              placeholder="Характеристика (напр. Матеріал)"
              className="input flex-1"
            />
            <input
              value={s.value}
              onChange={(e) => {
                const next = [...values.specs];
                next[i] = { ...next[i], value: e.target.value };
                set("specs", next);
              }}
              placeholder="Значення"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => set("specs", values.specs.filter((_, idx) => idx !== i))}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tg-bg text-duck-coral"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("specs", [...values.specs, { key: "", value: "" }])}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-tg-bg px-3 py-2 text-xs font-semibold text-duck-gold"
        >
          <Plus size={14} /> Додати характеристику
        </button>
      </Section>

      <Section title="Мітки">
        <div className="flex gap-4">
          <Checkbox label="Популярний" checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
          <Checkbox label="Новинка" checked={values.isNew} onChange={(v) => set("isNew", v)} />
          <Checkbox label="Акція" checked={values.isPromo} onChange={(v) => set("isPromo", v)} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-duck-gold py-3.5 text-sm font-bold text-duck-ink transition-transform active:scale-95 disabled:opacity-50"
      >
        {saving ? "Збереження..." : productId ? "Зберегти зміни" : "Створити товар"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.85rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          background-color: var(--tg-bg);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-tg-secondary-bg p-5">
      <h2 className="font-display text-sm font-bold text-tg-hint">{title}</h2>
      {children}
    </div>
  );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-tg-hint">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#f5b301]" />
      {label}
    </label>
  );
}
