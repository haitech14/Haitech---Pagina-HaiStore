import { useMemo, useState } from 'react';
import { Package } from 'lucide-react';

import { buildInventoryCategoryOptions } from '@/lib/inventory-categories';
import { compareProductsBySortOrder } from '@/lib/inventory-product-order';
import { formatTpvMoney, unitPriceForTpv } from '@/lib/tpv-pricing';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';
import type { TpvCurrency } from '@/types/tpv';
import type { PriceRole } from '@/types/product';

interface TpvCatalogListProps {
  products: InventoryProduct[];
  search: string;
  priceList: PriceRole;
  currency: TpvCurrency;
  onAddProduct: (product: InventoryProduct) => void;
}

function sortCategoryKeys(keys: string[], preferredOrder: string[]): string[] {
  return [...keys].sort((a, b) => {
    const indexA = preferredOrder.findIndex(
      (name) => name.localeCompare(a, 'es', { sensitivity: 'base' }) === 0,
    );
    const indexB = preferredOrder.findIndex(
      (name) => name.localeCompare(b, 'es', { sensitivity: 'base' }) === 0,
    );
    if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'es');
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function productMatchesSearch(product: InventoryProduct, query: string): boolean {
  const haystack = [
    product.name,
    product.id,
    product.code,
    product.brand ?? '',
    product.category ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function CatalogProductRow({
  product,
  unitPrice,
  currency,
  onAdd,
}: {
  product: InventoryProduct;
  unitPrice: number;
  currency: TpvCurrency;
  onAdd: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(product.image_url) && !imageError;

  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border bg-background p-2 text-left transition-colors',
          'hover:border-[hsl(var(--admin-accent))] hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
        )}
      >
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white sm:size-[4.5rem]">
          {showImage ? (
            <img
              src={product.image_url!}
              alt=""
              className="max-h-full max-w-full object-contain p-1"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <Package className="size-7 text-muted-foreground/40" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.brand ?? 'Sin marca'} · Stock {product.stock}
            {product.code ? ` · ${product.code}` : ''}
          </p>
        </div>

        <span className="shrink-0 text-sm font-bold text-[hsl(var(--admin-accent))] sm:text-base">
          {formatTpvMoney(unitPrice, currency)}
        </span>
      </button>
    </li>
  );
}

export function TpvCatalogList({
  products,
  search,
  priceList,
  currency,
  onAddProduct,
}: TpvCatalogListProps) {
  const catalogByCategory = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query
      ? products.filter((product) => productMatchesSearch(product, query))
      : products;

    const groups = new Map<string, InventoryProduct[]>();
    for (const product of list) {
      const categoryName = product.category?.trim() || 'Sin categoría';
      const bucket = groups.get(categoryName) ?? [];
      bucket.push(product);
      groups.set(categoryName, bucket);
    }

    const preferredOrder = buildInventoryCategoryOptions(products);
    const sortedNames = sortCategoryKeys([...groups.keys()], preferredOrder);

    return sortedNames.map((name) => ({
      name,
      products: (groups.get(name) ?? []).sort(compareProductsBySortOrder),
    }));
  }, [products, search]);

  if (catalogByCategory.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        {search.trim()
          ? 'No hay productos que coincidan con la búsqueda.'
          : 'No hay productos en el inventario.'}
      </p>
    );
  }

  return (
    <div className="max-h-[min(70vh,720px)] space-y-6 overflow-y-auto pr-1">
      {catalogByCategory.map((group) => {
        const sectionId = `tpv-cat-${group.name.replace(/\s+/g, '-').toLowerCase()}`;
        return (
        <section key={group.name} aria-labelledby={sectionId}>
          <h4
            id={sectionId}
            className="sticky top-0 z-10 mb-2 border-b bg-card/95 py-2 text-xs font-bold uppercase tracking-wide text-foreground backdrop-blur-sm"
          >
            {group.name}
            <span className="ml-2 font-normal text-muted-foreground">
              ({group.products.length})
            </span>
          </h4>
          <ul className="flex flex-col gap-2" role="list">
            {group.products.map((product) => (
              <CatalogProductRow
                key={product.id}
                product={product}
                unitPrice={unitPriceForTpv(product, priceList, currency)}
                currency={currency}
                onAdd={() => onAddProduct(product)}
              />
            ))}
          </ul>
        </section>
        );
      })}
    </div>
  );
}
