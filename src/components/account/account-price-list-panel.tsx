import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ListOrdered, Loader2, Search } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ProductCardImage } from '@/components/product/product-card-image';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProducts } from '@/hooks/use-products';
import { exportListaPreciosToExcel } from '@/lib/export-lista-precios-excel';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import {
  groupSearchProductsByPanelSection,
  SEARCH_PANEL_SECTION_ORDER,
} from '@/lib/product-search';
import { ensureFullPrices } from '@/lib/pricing';
import { PRICE_ROLE_LABELS, resolvePriceRole, USER_ROLE_LABELS } from '@/lib/roles';
import { SITE_LOGO_ASSET_PATH } from '@/lib/site-logo-asset';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function ProductThumb({ product }: { product: Product }) {
  const src = product.image_url?.trim() || product.gallery?.[0]?.trim() || '';
  if (!src) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border/60 bg-muted/30">
        <ProductNoImagePlaceholder className="size-7 text-muted-foreground/50" />
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

export function AccountPriceListPanel() {
  const { role } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const [query, setQuery] = useState('');
  const [exportBusy, setExportBusy] = useState(false);

  const priceRole = resolvePriceRole(role);
  const roleLabel = USER_ROLE_LABELS[role] ?? PRICE_ROLE_LABELS[priceRole];

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

  const handleExport = async () => {
    if (filtered.length === 0 || exportBusy) return;
    setExportBusy(true);
    try {
      const ok = await exportListaPreciosToExcel(filtered, {
        filenamePrefix: 'lista-de-precios',
        logoUrl: company.logoUrl || SITE_LOGO_ASSET_PATH,
        companyName: company.companyName || 'HAITECH',
        ricohLabel: 'RICOH Distribuidor autorizado',
      });
      if (ok) {
        toast.success(`Lista de precios descargada (${filtered.length} productos)`);
      } else {
        toast.error('No hay productos para exportar');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo generar la lista de precios',
      );
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ListOrdered className="size-5 text-red-600" aria-hidden="true" />
              Lista de Precios
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Productos en stock agrupados por Equipos, Tóner, Repuestos y más. Precios según tu
              perfil ({roleLabel}), en soles y dólares, con precio por mayor.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 shrink-0 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            disabled={exportBusy || filtered.length === 0}
            onClick={() => void handleExport()}
          >
            {exportBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileSpreadsheet className="size-4" aria-hidden="true" />
            )}
            Exportar Excel
          </Button>
        </div>
      </header>

      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <label htmlFor="account-price-list-search" className="sr-only">
          Buscar en la lista de precios
        </label>
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="account-price-list-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o categoría…"
            className="min-h-11 pl-9"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Cargando lista de precios…
          </p>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? 'No hay productos en stock que coincidan con tu búsqueda.'
              : 'No hay productos en stock disponibles en tu lista.'}
          </p>
        ) : null}

        {!isLoading && sectionGroups.length > 0 ? (
          <div className="space-y-6">
            {sectionGroups.map((group) => (
              <section key={group.category} aria-labelledby={`price-section-${group.category}`}>
                <h3
                  id={`price-section-${group.category}`}
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
                        <TableHead className="min-w-[4.5rem] text-center">Stock</TableHead>
                        <TableHead className="min-w-[8rem] text-right">Precio</TableHead>
                        <TableHead className="min-w-[8rem] text-right">Precio x mayor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.products.map((product) => {
                        const prices = ensureFullPrices(product.prices);
                        const listUsd = Number(product.price) || Number(prices[priceRole]) || 0;
                        const mayorUsd = Number(prices.mayorista) || 0;
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
                            <TableCell className="align-middle text-right text-sm font-semibold tabular-nums">
                              {listUsd > 0 ? (
                                <DualPrice usd={listUsd} alwaysBoth className="justify-end" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="align-middle text-right text-sm font-semibold tabular-nums">
                              {mayorUsd > 0 ? (
                                <DualPrice usd={mayorUsd} alwaysBoth className="justify-end" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
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

        <Link
          to="/tienda"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ir a la tienda
        </Link>
      </div>
    </div>
  );
}
