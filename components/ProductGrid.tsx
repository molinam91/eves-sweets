"use client";

import { useCart } from "@/context/CartContext";
import { money } from "@/lib/delivery";
import type { Product } from "@/lib/types";
import ProductThumb from "./ProductThumb";

export default function ProductGrid({ products }: { products: Product[] }) {
  const { openItem } = useCart();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => openItem(product)}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <ProductThumb product={product} className="h-32" />
          <div className="flex flex-1 flex-col gap-1 p-4">
            <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
            <p className="flex-1 text-xs leading-relaxed text-foreground-soft">
              {product.description}
            </p>
            <p className="mt-1 font-script text-xl text-brand-pink-deep">{money(product.price)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
