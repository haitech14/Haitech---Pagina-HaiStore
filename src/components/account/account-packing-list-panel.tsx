import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts } from '@/hooks/use-products';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import {
  groupSearchProductsByPanelSection,
  SEARCH_PANEL_SECTION_ORDER,
} from '@/lib/product-search';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

function ProductThumb({ product }: { product: Product }) {
  const src = product.image_url?.trim() || product.gallery?.[0]?.trim() || '';
  if (!src) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border/60 bg-muted/30">
        <ProductNoImagePlaceholder className="size-7 text-muted-foreground/50" size="sm" />
      </span>
    );
  }
  return (
    <span className="relative size-12 shrink-0 overflow-hidden rounded border border-border/60 bg-white">
      <ProductCardImage
        src={src}
        alt=""
        className="size-full object-contain p-0.5"
        overlayClassName={PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS}
        responsiveSizes="48px"
        loading="lazy"
      />
    </span>
  );
}

/** Packing list: equipos y productos con stock disponible para despacho. */
export function AccountPackingListPanel() {
  const { data: products = [], isLoading } = useProducts();
  const [query, setQuery] = useState('');

  const inStockProducts = useMemo(
    () => products.filter((product) => Math.max(0, Math.floor(Number(product.stock) || 0)) > 0),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inStockProducts;
    return inStockProducts.filter((product) => {
      const haystack = [product.name, product.code, product.category, product.brand]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [inStockProducts, query]);

  const sectionGroups = useMemo(() => {
    const groups = groupSearchProductsByPanelSection(filtered, query.trim() || undefined);
    const order = new Map(
      SEARCH_PANEL_SECTION_ORDER.map((label, index) => [label, index] as const),
    );
    return [...groups].sort(
      (a, b) => (order.get(a.category as never) ?? 99) - (order.get(b.category as never) ?? 99),
    );
  }, [filtered, query]);

  const totalUnits = useMemo(
    () => filtered.reduce((sum, product) => sum + Math.max(0, Math.floor(Number(product.stock) || 0)), 0),
    [filtered],
  );

  return (
    <div className="space-y-4">
      <header className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ClipboardList className="size-5 text-red-600" aria-hidden="true" />
          Packing List
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Inventario disponible para despacho: equipos, tóner y repuestos en stock
          {filtered.length > 0
            ? ` · ${filtered.length} ítems · ${totalUnits} unidades`
            : ''}
          .
        </p>
      </header>

      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <label htmlFor="account-packing-list-search" className="sr-only">
          Buscar en packing list
        </label>
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="account-packing-list-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o categoría…"
            className="min-h-11 pl-9"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Cargando packing list…
          </p>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? 'No hay productos en stock que coincidan con tu búsqueda.'
              : 'No hay productos en stock para armar el packing list.'}
          </p>
        ) : null}

        {!isLoading && sectionGroups.length > 0 ? (
          <div className="space-y-6">
            {sectionGroups.map((group) => (
              <section key={group.category} aria-labelledby={`packing-section-${group.category}`}>
                <h3
                  id={`packing-section-${group.category}`}
                  className="mb-2 border-b border-border/70 pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {group.category}
                  <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/80">
                    ({group.products.length})
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[5rem]">Código</TableHead>
                        <TableHead className="min-w-[14rem]">Producto</TableHead>
                        <TableHead className="min-w-[5rem] text-center">Cantidad</TableHead>
                        <TableHead className="min-w-[8rem]">Categoría</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.products.map((product) => {
                        const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                              {product.code ?? '—'}
                            </TableCell>
                            <TableCell className="align-middle">
                              <div className="flex min-w-0 items-center gap-3">
                                <ProductThumb product={product} />
                                <Link
                                  to={productPath(product)}
                                  className={cn(
                                    'min-w-0 font-medium text-foreground underline-offset-2',
                                    'hover:text-red-600 hover:underline',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                                  )}
                                >
                                  <span className="line-clamp-2">{product.name}</span>
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell className="align-middle text-center tabular-nums font-semibold text-foreground">
                              {stock}
                            </TableCell>
                            <TableCell className="align-middle text-sm text-muted-foreground">
                              {product.category?.trim() || '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
