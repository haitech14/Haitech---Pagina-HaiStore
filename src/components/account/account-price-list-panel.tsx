import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ListOrdered, Loader2, Search } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Badge } from '@/components/ui/badge';
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
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProducts } from '@/hooks/use-products';
import { exportListaPreciosToExcel } from '@/lib/export-lista-precios-excel';
import { formatAttributeLabel } from '@/lib/inventory-attributes';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import {
  groupSearchProductsByPanelSection,
  SEARCH_PANEL_SECTION_ORDER,
  type SearchPanelSectionLabel,
} from '@/lib/product-search';
import { ensureFullPrices } from '@/lib/pricing';
import { PRICE_ROLE_LABELS } from '@/lib/roles';
import { SITE_LOGO_ASSET_PATH } from '@/lib/site-logo-asset';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product, ProductAttribute } from '@/types/product';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import { toast } from 'sonner';

const PRICE_COLUMNS = [
  { key: 'public', label: PRICE_ROLE_LABELS.public },
  { key: 'distribuidor', label: PRICE_ROLE_LABELS.distribuidor },
  { key: 'tecnico', label: PRICE_ROLE_LABELS.tecnico },
  { key: 'mayorista', label: PRICE_ROLE_LABELS.mayorista },
  { key: 'compra', label: 'Compra' },
] as const;

const ATTR_PREVIEW_COUNT = 4;

const tableHeadClass =
  'h-10 bg-red-600 px-3 text-xs font-semibold uppercase tracking-wide text-white first:rounded-tl-lg last:rounded-tr-lg [&:has([role=checkbox])]:pr-0';

function ProductThumb({ product }: { product: Product }) {
  const src = product.image_url?.trim() || product.gallery?.[0]?.trim() || '';
  if (!src) {
    return (
      <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/30">
        <ProductNoImagePlaceholder className="size-10 text-muted-foreground/50" />
      </span>
    );
  }
  return (
    <span className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border/60 bg-white">
      <ProductCardImage
        src={src}
        alt=""
        className="size-full object-contain p-1"
        overlayClassName={PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS}
        responsiveSizes="80px"
        loading="lazy"
      />
    </span>
  );
}

function resolvePurchaseUsd(product: Product): number {
  const raw = (product as Product & { purchase_price_usd?: number }).purchase_price_usd;
  return Number(raw) || 0;
}

/** USD arriba, S/ debajo (orden fijo para la lista de precios). */
function PriceCell({ usd }: { usd: number }) {
  if (usd <= 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex flex-col items-end gap-0.5 text-right tabular-nums leading-tight">
      <span className="text-[0.8125rem] font-semibold text-foreground">{formatUsd(usd)}</span>
      <span className="text-[0.6875rem] font-medium text-muted-foreground">
        {formatPenFromUsd(usd)}
      </span>
    </span>
  );
}

function ProductAttributes({ attributes }: { attributes: ProductAttribute[] | undefined }) {
  const list = Array.isArray(attributes)
    ? attributes.filter((a) => a.name?.trim() || a.value?.trim())
    : [];
  if (list.length === 0) {
    return <p className="mt-1 text-[0.65rem] text-muted-foreground">Sin atributos</p>;
  }

  const visible = list.slice(0, ATTR_PREVIEW_COUNT);
  const rest = list.length - visible.length;

  return (
    <div className="mt-1.5 flex min-w-0 flex-wrap gap-1">
      {visible.map((attribute, index) => {
        const label = formatAttributeLabel(attribute);
        return (
          <Badge
            key={attribute.id ?? `${attribute.name}-${index}`}
            variant="outline"
            className="h-5 max-w-full justify-start truncate border-border/80 bg-muted/40 px-1.5 text-[0.625rem] font-normal text-muted-foreground"
            title={label}
          >
            <span className="truncate">{label}</span>
          </Badge>
        );
      })}
      {rest > 0 ? (
        <span className="self-center text-[0.65rem] text-muted-foreground">+{rest} más</span>
      ) : null}
    </div>
  );
}

export function AccountPriceListPanel() {
  const { data: products = [], isLoading } = useProducts();
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const [query, setQuery] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchPanelSectionLabel | null>(null);

  const inStockProducts = useMemo(
    () => products.filter((product) => Math.max(0, Math.floor(Number(product.stock) || 0)) > 0),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inStockProducts;
    return inStockProducts.filter((product) => {
      const attrText = (product.attributes ?? [])
        .map((attr) => `${attr.name ?? ''} ${attr.value ?? ''}`)
        .join(' ');
      const haystack = [product.name, product.code, product.category, product.brand, attrText]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [inStockProducts, query]);

  const sectionGroups = useMemo(() => {
    const groups = groupSearchProductsByPanelSection(filtered, query.trim() || undefined);
    const byLabel = new Map(groups.map((group) => [group.category, group] as const));
    return SEARCH_PANEL_SECTION_ORDER.map((label) => ({
      category: label,
      products: byLabel.get(label)?.products ?? [],
    })).filter((group) => group.products.length > 0);
  }, [filtered, query]);

  useEffect(() => {
    if (sectionGroups.length === 0) {
      setActiveCategory(null);
      return;
    }
    if (!activeCategory || !sectionGroups.some((group) => group.category === activeCategory)) {
      setActiveCategory(sectionGroups[0]!.category as SearchPanelSectionLabel);
    }
  }, [activeCategory, sectionGroups]);

  const activeGroup = useMemo(
    () => sectionGroups.find((group) => group.category === activeCategory) ?? null,
    [activeCategory, sectionGroups],
  );

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
              Productos en stock por categoría, con precios Corporativo, Distribuidor, Técnico,
              Mayorista y Compra (USD arriba · S/ abajo).
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
            placeholder="Buscar por nombre, código, categoría o atributo…"
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
          <div className="space-y-4">
            <div
              role="tablist"
              aria-label="Categorías de la lista de precios"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {sectionGroups.map((group) => {
                const selected = group.category === activeCategory;
                return (
                  <button
                    key={group.category}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() =>
                      setActiveCategory(group.category as SearchPanelSectionLabel)
                    }
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                      selected
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-border bg-background text-muted-foreground hover:border-red-300 hover:text-foreground',
                    )}
                  >
                    {group.category}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium',
                        selected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {group.products.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeGroup ? (
              <section aria-labelledby={`price-section-${activeGroup.category}`}>
                <h3
                  id={`price-section-${activeGroup.category}`}
                  className="mb-2 border-b border-border/70 pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {activeGroup.category}
                  <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/80">
                    ({activeGroup.products.length})
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className={cn(tableHeadClass, 'min-w-[5rem]')}>Código</TableHead>
                        <TableHead className={cn(tableHeadClass, 'min-w-[16rem]')}>
                          Producto
                        </TableHead>
                        <TableHead className={cn(tableHeadClass, 'min-w-[4.5rem] text-center')}>
                          Stock
                        </TableHead>
                        {PRICE_COLUMNS.map((column) => (
                          <TableHead
                            key={column.key}
                            className={cn(tableHeadClass, 'min-w-[6.5rem] text-right')}
                          >
                            {column.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeGroup.products.map((product) => {
                        const prices = ensureFullPrices(product.prices);
                        const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
                        const purchaseUsd = resolvePurchaseUsd(product);
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                              {product.code ?? '—'}
                            </TableCell>
                            <TableCell className="align-middle">
                              <div className="flex min-w-0 items-start gap-3">
                                <ProductThumb product={product} />
                                <div className="min-w-0 flex-1">
                                  <Link
                                    to={productPath(product)}
                                    className={cn(
                                      'font-medium text-foreground underline-offset-2',
                                      'hover:text-red-600 hover:underline',
                                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                                    )}
                                  >
                                    <span className="line-clamp-2">{product.name}</span>
                                  </Link>
                                  <ProductAttributes attributes={product.attributes} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="align-middle text-center font-semibold tabular-nums text-foreground">
                              {stock}
                            </TableCell>
                            <TableCell className="align-middle text-right">
                              <PriceCell usd={Number(prices.public) || 0} />
                            </TableCell>
                            <TableCell className="align-middle text-right">
                              <PriceCell usd={Number(prices.distribuidor) || 0} />
                            </TableCell>
                            <TableCell className="align-middle text-right">
                              <PriceCell usd={Number(prices.tecnico) || 0} />
                            </TableCell>
                            <TableCell className="align-middle text-right">
                              <PriceCell usd={Number(prices.mayorista) || 0} />
                            </TableCell>
                            <TableCell className="align-middle text-right">
                              <PriceCell usd={purchaseUsd} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ) : null}
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
