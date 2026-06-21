import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { productPath } from '@/lib/product-path';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import { cn } from '@/lib/utils';

interface ProductDetailConsumablesProps {
  groups: ConsumableGroup[];
  className?: string;
}

function ConsumableCard({ item }: { item: ConsumableGroup['items'][number] }) {
  return (
    <article className="flex gap-3 rounded-lg border border-border/60 bg-white p-3">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted/25 p-1.5 sm:size-20">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">Sin Imagen</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[#0f1f3d]">{item.name}</h4>
        {item.sku ? (
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">SKU: {item.sku}</p>
        ) : null}
        <p className="mt-1.5 text-sm font-bold text-[#0f1f3d]">
          <DualPrice usd={item.priceUsd} />
        </p>
        <Link
          to={productPath(item.productId)}
          className="mt-auto inline-flex items-center gap-0.5 pt-2 text-xs font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ver producto
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function ConsumableItemGrid({ items }: { items: ConsumableGroup['items'] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.productId}>
          <ConsumableCard item={item} />
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailConsumables({ groups, className }: ProductDetailConsumablesProps) {
  const visibleGroups = groups.filter(
    (group) => group.items.length > 0 || group.subgroups.length > 0,
  );

  if (visibleGroups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay consumibles compatibles catalogados para este equipo por el momento.
      </p>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {visibleGroups.map((group) => (
        <section key={group.id} aria-labelledby={`consumible-${group.id}`}>
          <h3
            id={`consumible-${group.id}`}
            className="border-b border-border/60 pb-2 text-base font-bold text-[#0f1f3d] sm:text-lg"
          >
            {group.label}
          </h3>

          <div className="mt-4 space-y-5">
            <ConsumableItemGrid items={group.items} />

            {group.subgroups.map((subgroup) => (
              <div key={subgroup.label}>
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground">{subgroup.label}</h4>
                <ConsumableItemGrid items={subgroup.items} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
