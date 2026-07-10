import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart } from 'lucide-react';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { formatTonerYieldCardLabel } from '@/lib/product-cost-per-copy';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import {
  formatConsumableListDisplayName,
  type ConsumableGroup,
} from '@/lib/product-equipment-consumables';
import { productPath } from '@/lib/product-path';
import { useProductsByIds } from '@/hooks/use-products-by-ids';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

const STRIP_LIMIT = 4;

function extractYieldLabel(name: string): string | null {
  const parenMatch = name.match(/\(([\d,.\s]+(?:5%[- ]?A4|p[aá]ginas?)[^)]*)\)/i);
  if (parenMatch?.[1]) return parenMatch[1].replace(/\s+/g, ' ').trim();

  const rendMatch = name.match(/rend(?:imiento)?:?\s*([\d,.\s]+(?:p[aá]ginas?)?)/i);
  if (rendMatch?.[1]) return rendMatch[1].replace(/\s+/g, ' ').trim();

  return null;
}

function flattenConsumableItems(groups: ConsumableGroup[]) {
  const items = [];
  for (const group of groups) {
    items.push(...group.items);
    for (const subgroup of group.subgroups) {
      items.push(...subgroup.items);
    }
  }
  return items;
}

function ConsumableStripCard({
  item,
  product,
}: {
  item: ReturnType<typeof flattenConsumableItems>[number];
  product?: Product;
}) {
  const yieldLabel = extractYieldLabel(item.name);
  const yieldDisplay = formatTonerYieldCardLabel(
    item.yieldLabel ?? yieldLabel,
    item.yieldPages ?? null,
  );
  const displayName = formatConsumableListDisplayName(item.name);
  const displaySku =
    formatProductDisplayCode(item.sku, {
      name: item.name,
      category: product?.category ?? null,
      isToner: /toner|tóner/i.test(item.name),
    }) ?? item.sku?.trim() ?? null;

  return (
    <article className="flex min-h-[7.5rem] gap-3 rounded-lg border border-border/70 bg-white p-3 shadow-sm">
      <Link
        to={productPath(item.productId)}
        className="flex size-16 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/20 p-1.5 sm:size-[4.5rem]"
        aria-label={`Ver ${displayName}`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">Sin Imagen</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          to={productPath(item.productId)}
          className="line-clamp-2 text-sm font-semibold leading-snug text-[#0f1f3d] no-underline hover:text-red-600"
        >
          {displayName}
        </Link>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">{yieldDisplay}</p>
        {displaySku ? (
          <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">{displaySku}</p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-sm font-bold text-[#0f1f3d]">
            <DualPrice usd={item.priceUsd} />
          </p>
          {product ? (
            <AddToCartButton
              product={product}
              size="icon"
              className="size-9 shrink-0 rounded-md bg-red-600 hover:bg-red-500"
              aria-label={`Agregar ${item.name} al carrito`}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
            </AddToCartButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}

interface ProductDetailConsumablesStripProps {
  groups: ConsumableGroup[];
  className?: string;
  onViewAll?: () => void;
}

export function ProductDetailConsumablesStrip({
  groups,
  className,
  onViewAll,
}: ProductDetailConsumablesStripProps) {
  const items = flattenConsumableItems(groups).slice(0, STRIP_LIMIT);
  const productIds = useMemo(() => items.map((item) => item.productId), [items]);
  const { data: catalogProducts = [] } = useProductsByIds(productIds, items.length > 0);

  if (items.length === 0) return null;

  return (
    <section
      className={cn('border-t border-border/60 pt-8', className)}
      aria-labelledby="consumibles-relacionados-titulo"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id="consumibles-relacionados-titulo" className="text-base font-bold text-[#0f1f3d] sm:text-lg">
          Tóner y repuestos relacionados
        </h3>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-0.5 text-sm font-bold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Ver todos
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const catalogProduct = catalogProducts.find((row) => row.id === item.productId);
          return (
            <li key={item.productId}>
              <ConsumableStripCard
                item={item}
                {...(catalogProduct ? { product: catalogProduct } : {})}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
