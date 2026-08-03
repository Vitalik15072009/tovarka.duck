export function serializeProduct(
  p: {
    price: number | { toString(): string };
    oldPrice: number | { toString(): string } | null;
    [key: string]: unknown;
  }
) {
  return {
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
  };
}