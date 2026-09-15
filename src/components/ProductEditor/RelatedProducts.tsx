import { Link2, Plus, X } from 'lucide-react';

import { ProductEditorCard } from '@/components/ProductEditor/product-editor-ui';

export interface RelatedProductItem {
  id: string;
  name: string;
  sku: string;
  image?: string;
}

interface RelatedProductsProps {
  products: RelatedProductItem[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
}

export function RelatedProducts({ products, onAdd, onRemove }: RelatedProductsProps) {
  return (
    <ProductEditorCard
      title="Productos relacionados"
      description="Complementos sugeridos en la ficha."
      icon={<Link2 className="size-4" aria-hidden="true" />}
      action={
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#F8FAFC]"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Agregar producto
        </button>
      }
    >
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((item) => (
          <li
            key={item.id}
            className="relative flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white p-2.5"
          >
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FAFC]">
              {item.image ? (
                <img src={item.image} alt="" className="size-full object-contain p-1" />
              ) : (
                <span className="text-xs font-bold text-[#D1D5DB]">
                  {item.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pr-4">
              <p className="truncate text-xs font-semibold text-[#111827]">{item.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-[#6B7280]">SKU: {item.sku}</p>
            </div>
            <button
              type="button"
              className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
              aria-label={`Quitar ${item.name}`}
              onClick={() => onRemove?.(item.id)}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </ProductEditorCard>
  );
}
