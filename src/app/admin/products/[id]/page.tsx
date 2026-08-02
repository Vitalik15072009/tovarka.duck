"use client";

import { useEffect, useState, use } from "react";
import ProductForm, { fromProductDTO, ProductFormValues } from "@/components/admin/ProductForm";
import { ProductDTO } from "@/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.product) {
          setNotFound(true);
          return;
        }
        setInitial(fromProductDTO(d.product as ProductDTO));
      });
  }, [id]);

  if (notFound) {
    return <p className="text-tg-hint">Товар не знайдено</p>;
  }

  if (!initial) {
    return <div className="skeleton h-96 rounded-3xl" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold">Редагувати товар</h1>
      <ProductForm initial={initial} productId={id} />
    </div>
  );
}
