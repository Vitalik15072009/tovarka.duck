import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold">Новий товар</h1>
      <ProductForm />
    </div>
  );
}
