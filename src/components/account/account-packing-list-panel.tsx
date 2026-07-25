import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Badge } from '@/components/ui/badge';
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
import { useAdminInventory, useProducts } from '@/hooks/use-products';
import { useWarehouses } from '@/hooks/use-warehouses';
import { formatAttributeLabel } from '@/lib/inventory-attributes';
import {
  DEFAULT_WAREHOUSES,
  getProductPrimaryWarehouseId,
  normalizeWarehouses,
} from '@/lib/inventory-stock';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import {
  groupSearchProductsByPanelSection,
  SEARCH_PANEL_SECTION_ORDER,
} from '@/lib/product-search';
import type { InventoryProduct, InventoryWarehouse, Product, ProductAttribute } from '@/types/product';
import { cn } from '@/lib/utils';

type PackingListViewMode = 'detalle' | 'resumen';
type PackingListProduct = Product | InventoryProduct;

type PackingListUnitRow = {
  product: PackingListProduct;
  unitIndex: number;
  serie: string;
  rowKey: string;
};

const SERIE_ATTR_PATTERN = /^(n[uú]mero\s+de\s+)?serie(s)?$/i;
const ATTR_PREVIEW_COUNT = 3;

function ProductThumb({ product }: { product: PackingListProduct }) {
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

function parseStoredSeries(product: PackingListProduct): string[] {
  const attr = product.attributes?.find((item) =>
    SERIE_ATTR_PATTERN.test(String(item.name ?? '').trim()),
  );
  const raw = attr?.value?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\n|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveUnitSerie(product: PackingListProduct, unitIndex: number): string {
  const series = parseStoredSeries(product);
  if (series[unitIndex]) return series[unitIndex];
  if (series.length === 1) return series[0];
  return '—';
}

function productStock(product: PackingListProduct): number {
  return Math.max(0, Math.floor(Number(product.stock) || 0));
}

function isProductAvailableForSale(product: PackingListProduct): boolean {
  const status = product.status ?? 'activa';
  return status === 'activa' && productStock(product) > 0;
}

function resolveWarehouseLabel(
  product: PackingListProduct,
  warehouses: InventoryWarehouse[],
): string {
  if (!('stock_by_warehouse' in product)) return '—';
  const list = normalizeWarehouses(warehouses);
  if (list.length === 0) return '—';
  const warehouseId = getProductPrimaryWarehouseId(product, list);
  return list.find((entry) => entry.id === warehouseId)?.name ?? '—';
}

function packingAttributes(product: PackingListProduct): ProductAttribute[] {
  return (product.attributes ?? []).filter(
    (attr) => !SERIE_ATTR_PATTERN.test(String(attr.name ?? '').trim()),
  );
}

/** Expande cada producto en una fila por unidad de stock. */
function expandProductsToUnitRows(products: readonly PackingListProduct[]): PackingListUnitRow[] {
  const rows: PackingListUnitRow[] = [];
  for (const product of products) {
    const stock = productStock(product);
    for (let unitIndex = 0; unitIndex < stock; unitIndex += 1) {
      rows.push({
        product,
        unitIndex,
        serie: resolveUnitSerie(product, unitIndex),
        rowKey: `${product.id}::${unitIndex}`,
      });
    }
  }
  return rows;
}

function ProductNameCell({ product }: { product: PackingListProduct }) {
  return (
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
  );
}

function AttributesCell({ product }: { product: PackingListProduct }) {
  const attributes = packingAttributes(product);
  if (attributes.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const visible = attributes.slice(0, ATTR_PREVIEW_COUNT);
  const rest = attributes.length - visible.length;

  return (
    <div className="flex min-w-0 max-w-[14rem] flex-col gap-0.5">
      {visible.map((attribute) => {
        const label = formatAttributeLabel(attribute);
        return (
          <Badge
            key={attribute.id}
            variant="outline"
            className="h-5 max-w-full justify-start truncate px-1.5 text-[0.625rem] font-normal"
            title={label}
          >
            <span className="truncate">{label}</span>
          </Badge>
        );
      })}
      {rest > 0 ? (
        <span className="text-[0.65rem] text-muted-foreground">+{rest} más</span>
      ) : null}
    </div>
  );
}

function AvailableForSaleCell({ product }: { product: PackingListProduct }) {
  const available = isProductAvailableForSale(product);
  const qty = productStock(product);
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          'text-sm font-semibold',
          available ? 'text-emerald-700' : 'text-muted-foreground',
        )}
      >
        {available ? 'Sí' : 'No'}
      </span>
      <span className="text-[0.65rem] tabular-nums text-muted-foreground">
        {qty} und.
      </span>
    </div>
  );
}

const VIEW_MODE_OPTIONS: { id: PackingListViewMode; label: string }[] = [
  { id: 'detalle', label: 'Detalle' },
  { id: 'resumen', label: 'Resumen' },
];

/** Packing list: Detalle (por unidad + serie) por defecto, o Resumen (agrupado). */
export function AccountPackingListPanel() {
  const { isAdmin } = useAuth();
  const { data: publicProducts = [], isLoading: publicLoading } = useProducts({
    enabled: !isAdmin,
  });
  const { data: adminProducts = [], isLoading: adminLoading } = useAdminInventory();
  const { data: warehousesData } = useWarehouses();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<PackingListViewMode>('detalle');

  const warehouses = useMemo(
    () => normalizeWarehouses(warehousesData ?? DEFAULT_WAREHOUSES),
    [warehousesData],
  );

  const sourceProducts = useMemo((): PackingListProduct[] => {
    if (isAdmin) return adminProducts;
    return publicProducts;
  }, [adminProducts, isAdmin, publicProducts]);

  const isLoading = isAdmin ? adminLoading : publicLoading;

  const inStockProducts = useMemo(
    () => sourceProducts.filter((product) => productStock(product) > 0),
    [sourceProducts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inStockProducts;
    return inStockProducts.filter((product) => {
      const seriesHaystack = parseStoredSeries(product).join(' ');
      const attrsHaystack = packingAttributes(product)
        .map((attr) => formatAttributeLabel(attr))
        .join(' ');
      const warehouse = resolveWarehouseLabel(product, warehouses);
      const haystack = [
        product.name,
        product.code,
        product.category,
        product.brand,
        seriesHaystack,
        attrsHaystack,
        warehouse,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [inStockProducts, query, warehouses]);

  const sectionGroups = useMemo(() => {
    const groups = groupSearchProductsByPanelSection(filtered, query.trim() || undefined);
    const order = new Map(
      SEARCH_PANEL_SECTION_ORDER.map((label, index) => [label, index] as const),
    );
    return [...groups]
      .map((group) => ({
        category: group.category,
        products: group.products as PackingListProduct[],
        rows: expandProductsToUnitRows(group.products as PackingListProduct[]),
      }))
      .filter((group) => group.products.length > 0)
      .sort(
        (a, b) => (order.get(a.category as never) ?? 99) - (order.get(b.category as never) ?? 99),
      );
  }, [filtered, query]);

  const totalSku = filtered.length;
  const totalUnits = useMemo(
    () => filtered.reduce((sum, product) => sum + productStock(product), 0),
    [filtered],
  );

  const isDetalle = viewMode === 'detalle';

  return (
    <div className="space-y-4">
      <header className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ClipboardList className="size-5 text-red-600" aria-hidden="true" />
              Packing List
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDetalle
                ? 'Vista detalle: una fila por unidad con su serie'
                : 'Vista resumen: productos agrupados con cantidad'}
              {totalUnits > 0
                ? ` · ${totalSku} ítems · ${totalUnits} unidades`
                : ''}
              .
            </p>
          </div>
          <div
            className="inline-flex shrink-0 self-start overflow-hidden rounded-lg border border-border bg-muted/40 p-0.5"
            role="group"
            aria-label="Modo de packing list"
          >
            {VIEW_MODE_OPTIONS.map((option) => {
              const active = viewMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    'min-h-9 rounded-md px-3 text-sm font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                    active
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
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
            placeholder="Buscar por nombre, código, categoría, almacén, atributo o serie…"
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
                    ({isDetalle ? group.rows.length : group.products.length})
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[8rem]">Categoría</TableHead>
                        <TableHead className="min-w-[5rem]">Código</TableHead>
                        <TableHead className="min-w-[14rem]">Producto</TableHead>
                        {isDetalle ? (
                          <TableHead className="min-w-[7rem]">Serie</TableHead>
                        ) : (
                          <TableHead className="min-w-[5rem] text-center">Cantidad</TableHead>
                        )}
                        <TableHead className="min-w-[7rem]">Almacén</TableHead>
                        <TableHead className="min-w-[7.5rem]">Disponible a la Venta</TableHead>
                        <TableHead className="min-w-[9rem]">Atributos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isDetalle
                        ? group.rows.map(({ product, serie, rowKey }) => (
                            <TableRow key={rowKey}>
                              <TableCell className="align-middle text-sm text-muted-foreground">
                                {product.category?.trim() || '—'}
                              </TableCell>
                              <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                                {product.code ?? '—'}
                              </TableCell>
                              <TableCell className="align-middle">
                                <ProductNameCell product={product} />
                              </TableCell>
                              <TableCell className="align-middle font-mono text-xs tabular-nums text-foreground">
                                {serie}
                              </TableCell>
                              <TableCell className="align-middle text-sm text-muted-foreground">
                                {resolveWarehouseLabel(product, warehouses)}
                              </TableCell>
                              <TableCell className="align-middle">
                                <AvailableForSaleCell product={product} />
                              </TableCell>
                              <TableCell className="align-middle">
                                <AttributesCell product={product} />
                              </TableCell>
                            </TableRow>
                          ))
                        : group.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="align-middle text-sm text-muted-foreground">
                                {product.category?.trim() || '—'}
                              </TableCell>
                              <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                                {product.code ?? '—'}
                              </TableCell>
                              <TableCell className="align-middle">
                                <ProductNameCell product={product} />
                              </TableCell>
                              <TableCell className="align-middle text-center tabular-nums font-semibold text-foreground">
                                {productStock(product)}
                              </TableCell>
                              <TableCell className="align-middle text-sm text-muted-foreground">
                                {resolveWarehouseLabel(product, warehouses)}
                              </TableCell>
                              <TableCell className="align-middle">
                                <AvailableForSaleCell product={product} />
                              </TableCell>
                              <TableCell className="align-middle">
                                <AttributesCell product={product} />
                              </TableCell>
                            </TableRow>
                          ))}
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
