import { useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';

import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildInventoryCategoryOptions } from '@/lib/inventory-categories';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { compareProductsBySortOrder } from '@/lib/inventory-product-order';
import {
  TPV_ACCENT_TEXT_CLASS,
  TPV_FOCUS_RING_CLASS,
  TPV_HOVER_BORDER_CLASS,
  TPV_SELECTED_CLASS,
} from '@/lib/tpv-highlight';
import { formatTpvMoney, unitPriceForTpv } from '@/lib/tpv-pricing';
import { cn } from '@/lib/utils';
import type { InventoryProduct, PriceRole } from '@/types/product';
import type { TpvCurrency } from '@/types/tpv';

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
  const displayCode = formatProductDisplayCode(product.code, { brand: product.brand });
  const showImage = Boolean(product.image_url) && !imageError;

  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'flex w-full min-h-11 items-center gap-3 rounded-lg border bg-background p-2 text-left transition-colors',
          TPV_HOVER_BORDER_CLASS,
          'hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2',
          TPV_FOCUS_RING_CLASS,
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
            {displayCode ? ` · ${displayCode}` : ''}
          </p>
        </div>

        <span className={cn('shrink-0 text-sm font-bold sm:text-base', TPV_ACCENT_TEXT_CLASS)}>
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
  const { data: categoryTree = [] } = useStoreCategoriesTree();
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

    const preferredOrder = buildInventoryCategoryOptions(products, categoryTree);
    const sortedNames = sortCategoryKeys([...groups.keys()], preferredOrder);

    return sortedNames.map((name) => ({
      name,
      products: (groups.get(name) ?? []).sort(compareProductsBySortOrder),
    }));
  }, [products, search, categoryTree]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (catalogByCategory.length === 0) {
      setSelectedCategory(null);
      return;
    }
    const stillValid = catalogByCategory.some((group) => group.name === selectedCategory);
    if (!stillValid) {
      setSelectedCategory(catalogByCategory[0]?.name ?? null);
    }
  }, [catalogByCategory, selectedCategory]);

  const activeGroup = useMemo(
    () => catalogByCategory.find((group) => group.name === selectedCategory),
    [catalogByCategory, selectedCategory],
  );

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
    <div className="flex max-h-[min(70vh,720px)] min-h-[280px] flex-col gap-3">
      <header className="shrink-0 border-b pb-3">
        <nav
          className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Categorías del catálogo"
        >
          {catalogByCategory.map((group) => {
            const isActive = group.name === selectedCategory;
            return (
              <button
                key={group.name}
                type="button"
                onClick={() => setSelectedCategory(group.name)}
                aria-current={isActive ? 'true' : undefined}
                title={group.name}
                className={cn(
                  'flex min-h-11 min-w-[8.5rem] max-w-[14rem] shrink-0 flex-col justify-center rounded-lg px-3 py-2 text-left',
                  'text-xs font-semibold uppercase tracking-wide transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2',
                  TPV_FOCUS_RING_CLASS,
                  isActive
                    ? TPV_SELECTED_CLASS
                    : 'bg-muted/30 text-foreground hover:bg-muted/60',
                )}
              >
                <span className="line-clamp-2 leading-snug">{group.name}</span>
                <span
                  className={cn(
                    'mt-0.5 text-[0.65rem] font-normal normal-case tabular-nums',
                    isActive ? 'text-white/85' : 'text-muted-foreground',
                  )}
                >
                  {group.products.length} producto{group.products.length === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="min-h-0 min-w-0 flex-1">
        {activeGroup ? (
          <ul
            className="flex max-h-[min(62vh,640px)] flex-col gap-2 overflow-y-auto pr-1"
            role="list"
            aria-label={`Productos en ${activeGroup.name}`}
          >
            {activeGroup.products.map((product) => (
              <CatalogProductRow
                key={product.id}
                product={product}
                unitPrice={unitPriceForTpv(product, priceList, currency)}
                currency={currency}
                onAdd={() => onAddProduct(product)}
              />
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Elige una categoría para ver los productos.
          </p>
        )}
      </div>
    </div>
  );
}
