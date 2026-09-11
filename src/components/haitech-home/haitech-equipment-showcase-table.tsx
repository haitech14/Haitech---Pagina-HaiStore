import {
  Fragment,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Copy, GitCompare, Plane, ShoppingCart, Tags, Trash2, Type } from 'lucide-react';
import { toast } from 'sonner';

import { createAdminInventarioBatchSelectionStore } from '@/components/admin/inventario/admin-inventario-batch-selection';
import {
  BatchSelectionCheckbox,
  BatchSelectAllCheckbox,
  useBatchSelectionSize,
} from '@/components/admin/inventario/admin-inventario-batch-selection-ui';
import { InventoryBulkEditDialog } from '@/components/admin/inventory/inventory-bulk-edit-dialog';
import { type InventoryProductFormFocusSection } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import {
  mergeCrossSellTonerId,
  ShowcaseTableTonerExpandPanel,
  ShowcaseTableTonerStockTrigger,
} from '@/components/haitech-home/haitech-equipment-showcase-table-toner';
import { ProductCardSplitBrandTitle } from '@/components/product/product-card-title';
import { ProductStockHover } from '@/components/product/product-stock-hover';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useProductCompare } from '@/context/product-compare-context';
import {
  formatEquipmentShowcaseFullTitle,
  resolveEquipmentCardSpecs,
  resolveEquipmentShowcaseCode,
} from '@/data/haitech-home-equipment-showcase';
import { formatHaitechPen, resolveHaitechShopStockLocations, type HaitechShopProduct } from '@/data/haitech-home-shop';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { useInventoryMutations } from '@/hooks/use-products';
import { FORMATO_PAPEL_ATTR } from '@/lib/category-catalog-filters';
import {
  CATALOG_INDEX_UPDATED_EVENT,
  getCatalogRows,
  subscribeCatalogMediaUpdates,
  type CatalogRow,
} from '@/lib/catalog-featured';
import { resolveCatalogStock } from '@/lib/catalog-row-lookup';
import { type CompareProductItem } from '@/lib/compare-product';
import {
  CONSULTAR_PRECIO_LABEL,
  getDisplayPriceVisibility,
  isPriceOnRequest,
  PRODUCT_ON_REQUEST_STOCK_LABEL,
} from '@/lib/display-price';
import { buildAttributeNameCatalog } from '@/lib/inventory-attributes';
import { findTechnicalSheetAttachment } from '@/lib/inventory-attachments';
import { buildInventoryCategoryOptions } from '@/lib/inventory-categories';
import { toPublicProduct } from '@/lib/pricing';
import { getProductTableSpecDisplay } from '@/lib/product-table-spec-columns';
import { randomId } from '@/lib/random-id';
import { ensureFullPrices, type PriceRole } from '@/lib/roles';
import { findShowcaseCatalogRow, resolveShowcaseProductHref } from '@/lib/showcase-product-href';
import { resolveShowcaseProductPricesUsd, showcaseDisplayUsd, showcaseUsdToPen } from '@/lib/showcase-product-pricing';
import { penToUsd, cn } from '@/lib/utils';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type {
  InventoryProduct,
  Product,
  ProductAttribute,
  ProductStockByWarehouse,
} from '@/types/product';

const InventoryProductFormDialog = lazy(() =>
  import('@/components/admin/inventory/inventory-product-form-dialog').then((module) => ({
    default: module.InventoryProductFormDialog,
  })),
);

const InventoryAttachmentsDialog = lazy(() =>
  import('@/components/admin/inventory/inventory-attachments-dialog').then((module) => ({
    default: module.InventoryAttachmentsDialog,
  })),
);

const BRAND = '#E30613';

/** Conserva el almacén con stock al editar el total (evita mover todo a «principal»). */
function stockPatchForTotal(
  row: CatalogRow,
  nextStock: number,
): Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'> {
  const qty = Math.max(0, Math.floor(Number(nextStock) || 0));
  const existing = Array.isArray(row.stock_by_warehouse) ? row.stock_by_warehouse : [];
  const primary =
    existing.find((entry) => Number(entry.quantity) > 0)?.warehouse_id?.trim() ||
    existing[0]?.warehouse_id?.trim() ||
    'operativo';

  const seen = new Set<string>();
  const stock_by_warehouse: ProductStockByWarehouse[] = [];
  for (const entry of existing) {
    const warehouse_id = entry.warehouse_id?.trim();
    if (!warehouse_id || seen.has(warehouse_id)) continue;
    seen.add(warehouse_id);
    stock_by_warehouse.push({
      warehouse_id,
      quantity: warehouse_id === primary ? qty : 0,
    });
  }
  if (!seen.has(primary)) {
    stock_by_warehouse.push({ warehouse_id: primary, quantity: qty });
  }

  return { stock: qty, stock_by_warehouse };
}

const HEAD =
  'sticky top-0 z-[1] whitespace-nowrap border-b border-[#D1D5DB] bg-[#F3F4F6] px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#4B5563] sm:px-3 sm:text-[11px]';

const CELL = 'border-b border-[#E5E7EB] px-2.5 py-2 align-middle text-[12px] text-[#111] sm:px-3 sm:text-[13px]';

const ACTION_ICON =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:border-[#E30613] hover:bg-[#FFF1F2] hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

/** Icono compacto de PDF (sin texto «Ver» / «PDF»). */
function PdfFileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path
        d="M8.2 16.2V11h1.55c.95 0 1.55.5 1.55 1.3 0 .78-.55 1.28-1.4 1.28H9.4v2.62H8.2Zm1.2-3.55h.3c.38 0 .62-.2.62-.52s-.24-.5-.62-.5h-.3v1.02ZM12.35 16.2V11h1.35c1.35 0 2.2.82 2.2 2.1s-.85 2.1-2.2 2.1h-.55v1Zm1.2-2.08h.28c.62 0 1-.4 1-1.02s-.38-1.02-1-1.02h-.28v2.04ZM17.05 16.2 18.5 11h1.25l-1.95 5.2h-1.25L15.6 11h1.28l1.17 5.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

const YEAR_ATTR_ALIASES = ['Año de Fabricación', 'Año fabricación', 'Año', 'Year'];
const SPEED_ATTR_ALIASES = ['Velocidad', 'Velocidad de impresión', 'ppm'];
const FORMAT_ATTR_ALIASES = [FORMATO_PAPEL_ATTR, 'Formato', 'Tamaño'];

function clampNumber(value: number, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toNumberDraft(value: number | null | undefined) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '';
  return String(num);
}

function parseDraftNumber(raw: string) {
  const cleaned = String(raw ?? '')
    .trim()
    .replace(/,/g, '.');
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num;
}

function normalizeAttrName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttribute(attributes: ProductAttribute[] | undefined, names: readonly string[]): ProductAttribute | undefined {
  const keys = names.map(normalizeAttrName);
  return attributes?.find((attr) => keys.includes(normalizeAttrName(attr.name)));
}

function findAttributeValue(attributes: ProductAttribute[] | undefined, names: readonly string[]): string {
  return findAttribute(attributes, names)?.value?.trim() ?? '';
}

function upsertAttribute(
  attributes: ProductAttribute[] | undefined,
  preferredName: string,
  aliases: readonly string[],
  value: string,
): ProductAttribute[] {
  const list = [...(attributes ?? [])];
  const existing = findAttribute(list, [preferredName, ...aliases]);
  if (existing) {
    return list.map((attr) => (attr.id === existing.id ? { ...attr, value } : attr));
  }
  return [...list, { id: randomId(), name: preferredName, value }];
}

function formatUsd(usd: number): string {
  const normalized = Math.round(usd * 100) / 100;
  const isWhole = Math.abs(normalized % 1) < 0.001;
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  })}`;
}

function toCartProduct(product: HaitechShopProduct, saleRate?: number): Product {
  const priceUsd = Math.round(penToUsd(product.price, saleRate) * 100) / 100;
  return {
    id: product.id,
    name: product.name,
    description: product.name,
    price: priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
    category: 'Equipos',
    brand: product.brand ?? 'RICOH',
    ...(product.code ? { code: product.code } : {}),
    created_at: new Date().toISOString(),
  };
}

function catalogAsProduct(row: CatalogRow): Product {
  return { ...row, price: row.prices?.public ?? 0 } as Product;
}

function isInteractiveEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('a,button,input,textarea,select,[role="link"]'));
}

function AdminHoverCell({
  children,
  canManage,
  ariaLabel,
  onEdit,
  align = 'center',
  className,
}: {
  children: ReactNode;
  canManage: boolean;
  ariaLabel: string;
  onEdit: () => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  if (!canManage) {
    return <div className={className}>{children}</div>;
  }

  const alignClass =
    align === 'right' ? 'justify-end text-right' : align === 'left' ? 'justify-start text-left' : 'justify-center text-center';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (isInteractiveEventTarget(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (isInteractiveEventTarget(event.target)) return;
        event.preventDefault();
        onEdit();
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'group/cell flex min-h-8 w-full min-w-0 items-center rounded-sm',
        'cursor-pointer hover:bg-[#F3F4F6]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        alignClass,
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1', align === 'right' && 'text-right')}>{children}</div>
    </div>
  );
}

function InlineEditableTextCell({
  value,
  canEdit,
  ariaLabel,
  align = 'left',
  className,
  onCommit,
  children,
}: {
  value: string;
  canEdit: boolean;
  ariaLabel: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  onCommit: (next: string) => Promise<void> | void;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) return;
    setDraft(value);
  }, [value, editing]);

  const alignClass =
    align === 'right' ? 'justify-end text-right' : align === 'left' ? 'justify-start text-left' : 'justify-center text-center';

  const commit = async () => {
    const next = draft.trim();
    if (!next || next === value.trim()) {
      setDraft(value);
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await onCommit(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar.';
      window.alert(message);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (!canEdit) {
    return <div className={cn('min-h-8', alignClass, className)}>{children}</div>;
  }

  return (
    <div className={cn('group/cell flex min-h-8 items-center', alignClass, className)}>
      {!editing ? (
        <div
          role="button"
          tabIndex={0}
          onClick={(event) => {
            if (isInteractiveEventTarget(event.target)) return;
            event.preventDefault();
            event.stopPropagation();
            setEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (isInteractiveEventTarget(event.target)) return;
            event.preventDefault();
            setEditing(true);
          }}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={cn(
            'min-h-8 w-full min-w-0 rounded-sm px-0.5',
            'cursor-pointer hover:bg-[#F3F4F6]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            alignClass,
          )}
        >
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        <input
          autoFocus
          type="text"
          value={draft}
          disabled={saving}
          aria-label={ariaLabel}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(value);
              setEditing(false);
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              void commit();
            }
          }}
          className={cn(
            'h-8 w-full cursor-text rounded-md border border-input bg-background px-2 text-xs text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            align === 'right' && 'text-right',
            align === 'center' && 'text-center',
          )}
        />
      )}
    </div>
  );
}

function InlineEditableNumberCell({
  value,
  canEdit,
  ariaLabel,
  align = 'center',
  min = 0,
  step = 1,
  precision = 0,
  onCommit,
  children,
}: {
  value: number;
  canEdit: boolean;
  ariaLabel: string;
  align?: 'left' | 'center' | 'right';
  min?: number;
  step?: number;
  precision?: number;
  onCommit: (next: number) => Promise<void> | void;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toNumberDraft(value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) return;
    setDraft(toNumberDraft(value));
  }, [value, editing]);

  const alignClass =
    align === 'right' ? 'justify-end text-right' : align === 'left' ? 'justify-start text-left' : 'justify-center text-center';

  const commit = async () => {
    const parsed = parseDraftNumber(draft);
    if (parsed == null) {
      setDraft(toNumberDraft(value));
      setEditing(false);
      return;
    }

    const fixed = precision > 0 ? Number(parsed.toFixed(precision)) : Math.round(parsed);
    const next = clampNumber(fixed, { min });
    if (next === value) {
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await onCommit(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar.';
      window.alert(message);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (!canEdit) {
    return <div className={cn('min-h-8', alignClass)}>{children}</div>;
  }

  return (
    <div className={cn('group/cell flex min-h-8 items-center', alignClass)}>
      {!editing ? (
        <div
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setEditing(true);
          }}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={cn(
            'min-h-8 w-full min-w-0 rounded-sm px-0.5',
            'cursor-pointer hover:bg-[#F3F4F6]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            alignClass,
          )}
        >
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        <input
          autoFocus
          type="number"
          min={min}
          step={step}
          value={draft}
          disabled={saving}
          aria-label={ariaLabel}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(toNumberDraft(value));
              setEditing(false);
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              void commit();
            }
          }}
          className={cn(
            'h-8 w-full cursor-text rounded-md border border-input bg-background px-2 text-xs text-foreground tabular-nums',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            align === 'right' && 'text-right',
            align === 'center' && 'text-center',
          )}
        />
      )}
    </div>
  );
}

function TablePriceCell({
  usd,
  isConsumable,
}: {
  usd: number;
  isConsumable: boolean;
}) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { data: companySettings } = useCompanySettings();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const displayUsd = showcaseDisplayUsd(usd, { isConsumable });
  const displayPen = showcaseUsdToPen(displayUsd, {
    isConsumable,
    ...(saleRate != null ? { saleRate } : {}),
  });
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);

  if (isPriceOnRequest(displayUsd)) {
    return <span className="text-[#6B7280]">{CONSULTAR_PRECIO_LABEL}</span>;
  }

  const usdLabel = formatUsd(displayUsd);
  const penLabel = formatHaitechPen(displayPen);
  const penFirst = dualPriceOrder === 'pen-usd';

  if (showUsd && showPen) {
    return (
      <span className="flex flex-col items-end gap-0.5 text-right leading-tight">
        <span className="font-bold tabular-nums" style={{ color: BRAND }}>
          {penFirst ? penLabel : usdLabel}
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-[#6B7280]">
          {penFirst ? usdLabel : penLabel}
        </span>
      </span>
    );
  }

  return (
    <span className="font-bold tabular-nums" style={{ color: BRAND }}>
      {showPen && !showUsd ? penLabel : usdLabel}
    </span>
  );
}

function EquipmentShowcaseTableRow({
  product,
  catalogReady,
  isAdmin,
  showStockAndToner,
  batchStore,
  tonerExpanded,
  onToggleToner,
  onSave,
  onDelete,
  onEditImage,
  onEditAttachments,
  colSpan,
}: {
  product: HaitechShopProduct;
  catalogReady: boolean;
  isAdmin: boolean;
  showStockAndToner: boolean;
  batchStore: ReturnType<typeof createAdminInventarioBatchSelectionStore>;
  tonerExpanded: boolean;
  onToggleToner: () => void;
  onSave: (id: string, payload: Partial<InventoryProduct>) => Promise<void>;
  onDelete: (row: CatalogRow, showcaseProductId: string) => void;
  onEditImage: (row: CatalogRow) => void;
  onEditAttachments: (row: CatalogRow) => void;
  colSpan: number;
}) {
  const { effectiveRole } = useAuth();
  const { data: companySettings } = useCompanySettings();
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const { isSelected, toggle } = useProductCompare();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const isConsumable = Boolean(product.toner) || /repuesto|unidad de imagen|t[oó]ner/i.test(product.name);
  const catalogRow = catalogReady ? findShowcaseCatalogRow(product) : undefined;
  const canManage = isAdmin && catalogRow != null;
  const specs = resolveEquipmentCardSpecs(product);
  const title = formatEquipmentShowcaseFullTitle(product);
  const codeLabel = resolveEquipmentShowcaseCode(product);
  const href = resolveShowcaseProductHref(product);
  const prices = resolveShowcaseProductPricesUsd(product, {
    isConsumable,
    ...(saleRate != null ? { saleRate } : {}),
  });
  const catalogYear = catalogRow ? getProductTableSpecDisplay(catalogAsProduct(catalogRow), 'anio') : '—';
  const catalogSpeed = catalogRow ? getProductTableSpecDisplay(catalogAsProduct(catalogRow), 'velocidad') : '';
  const formatLabel =
    findAttributeValue(catalogRow?.attributes, FORMAT_ATTR_ALIASES) || specs.paperSize;
  const speedLabel = catalogSpeed && catalogSpeed !== '—' ? catalogSpeed : specs.speedPpm;
  const yearLabel = catalogYear && catalogYear !== '—' ? catalogYear : '—';
  const sheet = catalogRow ? findTechnicalSheetAttachment(catalogRow) : undefined;
  const stockCount = resolveCatalogStock(catalogRow, product.stock);
  const hasStock = product.stock != null || catalogRow?.stock != null;
  const outOfStock = hasStock && stockCount <= 0;
  const cartProduct = useMemo(
    () => toCartProduct({ ...product, stock: stockCount }, saleRate),
    [product, saleRate, stockCount],
  );
  const tonerEquipmentProduct = useMemo(
    () => (catalogRow ? toPublicProduct(catalogRow, String(effectiveRole)) : cartProduct),
    [cartProduct, catalogRow, effectiveRole],
  );
  const buyLabel = outOfStock ? 'Agregar a Pedido' : 'Agregar al carrito';
  const compareSelected = isSelected(product.id);
  const batchSelected = useSyncExternalStore(
    batchStore.subscribe,
    () => (catalogRow ? batchStore.isSelected(catalogRow.id) : false),
    () => false,
  );

  const compareItem = useMemo<CompareProductItem>(
    () => ({
      id: product.id,
      name: title,
      category: catalogRow?.category ?? 'Equipos',
      brand: product.brand ?? 'RICOH',
      code: codeLabel || catalogRow?.code || null,
      price: prices.public,
      image: product.image || catalogRow?.image_url || null,
      attributes: catalogRow?.attributes ?? [],
    }),
    [catalogRow, codeLabel, prices.public, product.brand, product.id, product.image, title],
  );

  const saveAttribute = async (preferredName: string, aliases: readonly string[], next: string) => {
    if (!catalogRow) return;
    await onSave(catalogRow.id, {
      attributes: upsertAttribute(catalogRow.attributes, preferredName, aliases, next),
    });
  };

  const savePrice = async (role: PriceRole, next: number) => {
    if (!catalogRow) return;
    await onSave(catalogRow.id, {
      prices: ensureFullPrices({
        ...catalogRow.prices,
        [role]: next,
      }),
    });
  };

  return (
    <Fragment>
    <tr
      className={cn(
        'group/row bg-white hover:bg-[#FAFAFA]',
        batchSelected && 'bg-[#FFF1F2] hover:bg-[#FFE4E6]',
      )}
    >
      {isAdmin ? (
        <td className={cn(CELL, 'w-10 text-center')}>
          {catalogRow ? (
            <BatchSelectionCheckbox
              store={batchStore}
              id={catalogRow.id}
              aria-label={`Seleccionar ${title}`}
            />
          ) : (
            <span className="inline-block size-3.5" aria-hidden="true" />
          )}
        </td>
      ) : null}
      <td className={cn(CELL, 'whitespace-nowrap font-semibold tabular-nums text-[#4B5563]')}>
        <InlineEditableTextCell
          canEdit={canManage}
          value={catalogRow?.code ?? codeLabel ?? ''}
          ariaLabel="Modificar código"
          align="left"
          onCommit={async (next) => {
            if (!catalogRow) return;
            await onSave(catalogRow.id, { code: next });
          }}
        >
          {codeLabel || '—'}
        </InlineEditableTextCell>
      </td>
      <td className={CELL}>
        <AdminHoverCell
          canManage={canManage}
          ariaLabel="Cambiar imagen"
          align="left"
          onEdit={() => {
            if (catalogRow) onEditImage(catalogRow);
          }}
        >
          <Link
            to={href}
            className="block size-12 overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            aria-label={`Ver ficha de ${title}`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt=""
                width={48}
                height={48}
                className="size-full object-contain p-1"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-[11px] font-bold text-[#D1D5DB]">
                {title.charAt(0)}
              </span>
            )}
          </Link>
        </AdminHoverCell>
      </td>
      <td className={cn(CELL, 'min-w-[14rem] max-w-[22rem]')}>
        <InlineEditableTextCell
          canEdit={canManage}
          value={catalogRow?.name ?? product.name}
          ariaLabel="Modificar título"
          align="left"
          onCommit={async (next) => {
            if (!catalogRow) return;
            await onSave(catalogRow.id, { name: next });
          }}
        >
          <Link
            to={href}
            className="font-semibold leading-snug text-[#111] hover:text-[#E30613] focus-visible:outline-none focus-visible:underline"
          >
            <ProductCardSplitBrandTitle title={title} brand={product.brand ?? 'RICOH'} />
          </Link>
        </InlineEditableTextCell>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-center')}>
        <div className="inline-flex flex-col items-center gap-1.5">
          {showStockAndToner && !isConsumable ? (
            <ShowcaseTableTonerStockTrigger
              expanded={tonerExpanded}
              stockCount={stockCount}
              outOfStock={outOfStock}
              onToggleStock={onToggleToner}
              onToggleToner={onToggleToner}
            />
          ) : null}
          <InlineEditableNumberCell
            canEdit={canManage}
            ariaLabel="Modificar stock"
            value={stockCount}
            min={0}
            step={1}
            align="center"
            onCommit={async (next) => {
              if (!catalogRow) return;
              await onSave(catalogRow.id, stockPatchForTotal(catalogRow, next));
            }}
          >
            {hasStock ? (
              <ProductStockHover
                stock={stockCount}
                outOfStock={outOfStock}
                stockLocations={resolveHaitechShopStockLocations(product)}
                prefix=""
                showIcon={!showStockAndToner}
                className="justify-center text-[12px] font-semibold text-[#374151]"
                iconClassName="size-3.5"
              />
            ) : (
              <span className="text-[#9CA3AF]">{PRODUCT_ON_REQUEST_STOCK_LABEL}</span>
            )}
          </InlineEditableNumberCell>
        </div>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-center')}>
        <InlineEditableTextCell
          canEdit={canManage}
          value={formatLabel}
          ariaLabel="Modificar formato"
          align="center"
          onCommit={(next) => saveAttribute(FORMATO_PAPEL_ATTR, FORMAT_ATTR_ALIASES, next)}
        >
          {formatLabel}
        </InlineEditableTextCell>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-center')}>
        <InlineEditableTextCell
          canEdit={canManage}
          value={speedLabel}
          ariaLabel="Modificar velocidad"
          align="center"
          onCommit={(next) => saveAttribute('Velocidad', SPEED_ATTR_ALIASES, next)}
        >
          {speedLabel}
        </InlineEditableTextCell>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-center')}>
        <InlineEditableTextCell
          canEdit={canManage}
          value={yearLabel === '—' ? '' : yearLabel}
          ariaLabel="Modificar año de fabricación"
          align="center"
          onCommit={(next) => saveAttribute('Año de Fabricación', YEAR_ATTR_ALIASES, next)}
        >
          {yearLabel}
        </InlineEditableTextCell>
      </td>
      <td className={cn(CELL, 'text-right')}>
        <InlineEditableNumberCell
          canEdit={canManage}
          ariaLabel="Modificar precio técnico (USD)"
          value={prices.tecnico}
          min={0}
          step={1}
          align="right"
          onCommit={(next) => savePrice('tecnico', next)}
        >
          <TablePriceCell usd={prices.tecnico} isConsumable={isConsumable} />
        </InlineEditableNumberCell>
      </td>
      <td className={cn(CELL, 'text-right')}>
        <InlineEditableNumberCell
          canEdit={canManage}
          ariaLabel="Modificar precio distribuidor (USD)"
          value={prices.distribuidor}
          min={0}
          step={1}
          align="right"
          onCommit={(next) => savePrice('distribuidor', next)}
        >
          <TablePriceCell usd={prices.distribuidor} isConsumable={isConsumable} />
        </InlineEditableNumberCell>
      </td>
      <td className={cn(CELL, 'text-right')}>
        <InlineEditableNumberCell
          canEdit={canManage}
          ariaLabel="Modificar precio corporativo (USD)"
          value={prices.public}
          min={0}
          step={1}
          align="right"
          onCommit={(next) => savePrice('public', next)}
        >
          <TablePriceCell usd={prices.public} isConsumable={isConsumable} />
        </InlineEditableNumberCell>
      </td>
      <td className={cn(CELL, 'text-center')}>
        <AdminHoverCell
          canManage={canManage}
          ariaLabel="Editar ficha técnica"
          align="center"
          onEdit={() => {
            if (catalogRow) onEditAttachments(catalogRow);
          }}
        >
          {sheet?.url ? (
            <a
              href={sheet.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ficha técnica PDF de ${title}`}
              title="Ficha técnica PDF"
              className="inline-flex size-8 items-center justify-center rounded-md text-[#E30613] hover:bg-[#FFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            >
              <PdfFileIcon className="size-5" />
            </a>
          ) : (
            <span
              aria-label="Sin ficha técnica PDF"
              title="Sin ficha técnica PDF"
              className="inline-flex size-8 items-center justify-center rounded-md text-[#D1D5DB]"
            >
              <PdfFileIcon className="size-5" />
            </span>
          )}
        </AdminHoverCell>
      </td>
      <td className={cn(CELL, 'text-right')}>
        <div className="inline-flex items-center justify-end gap-1.5">
          <AddToCartButton
            product={cartProduct}
            size="sm"
            className={cn(
              'h-8 min-h-8 gap-1.5 rounded-md px-3 text-[11px] font-bold text-white shadow-none',
              outOfStock ? 'bg-[#111111] hover:bg-[#222222]' : 'bg-[#E30613] hover:bg-[#c90511]',
            )}
          >
            {outOfStock ? (
              <Plane className="size-3.5" aria-hidden="true" />
            ) : (
              <ShoppingCart className="size-3.5" aria-hidden="true" />
            )}
            {buyLabel}
          </AddToCartButton>
          <button
            type="button"
            className={ACTION_ICON}
            aria-label={`Cotizar ${title}`}
            title="Cotizar"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              requestQuote({
                campaign: 'vitrina-tabla-equipos',
                extraLines: [
                  `Equipo: ${title}`,
                  ...(codeLabel ? [`Código: ${codeLabel}`] : []),
                  `Precio corporativo: ${formatUsd(prices.public)}`,
                ],
                title: 'Cotizar equipo',
              });
            }}
          >
            <Calculator className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(
              ACTION_ICON,
              compareSelected && 'border-[#E30613] bg-[#FFF1F2] text-[#E30613]',
            )}
            aria-label={compareSelected ? `Quitar ${title} del comparador` : `Comparar ${title}`}
            aria-pressed={compareSelected}
            title="Comparar"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggle(compareItem);
            }}
          >
            <GitCompare className="size-3.5" aria-hidden="true" />
          </button>
          {canManage && catalogRow ? (
            <button
              type="button"
              className={cn(
                ACTION_ICON,
                'text-[#6B7280] hover:border-red-300 hover:bg-red-50 hover:text-[#E30613]',
              )}
              aria-label={`Eliminar ${title}`}
              title="Eliminar"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete(catalogRow, product.id);
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
    {tonerExpanded && showStockAndToner && !isConsumable ? (
      <tr className="bg-[#FFF8F8]">
        <td colSpan={colSpan} className="border-b border-[#E5E7EB] px-3 py-2">
          <ShowcaseTableTonerExpandPanel
            equipmentProduct={tonerEquipmentProduct}
            catalogRow={catalogRow}
            isColor={specs.printMode === 'Color'}
            {...(saleRate != null ? { saleRate } : {})}
            canManage={canManage}
            onLinkToner={async (tonerId) => {
              if (!catalogRow) return;
              await onSave(catalogRow.id, {
                cross_sell_product_ids: mergeCrossSellTonerId(catalogRow, tonerId),
              });
              toast.success('Tóner vinculado al equipo');
            }}
          />
        </td>
      </tr>
    ) : null}
    </Fragment>
  );
}

function ShowcaseTableBatchToolbar({
  store,
  bulkBusy,
  onOpenTitle,
  onOpenCategories,
  onDuplicate,
  onDelete,
  onClear,
}: {
  store: ReturnType<typeof createAdminInventarioBatchSelectionStore>;
  bulkBusy: boolean;
  onOpenTitle: () => void;
  onOpenCategories: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const selectedCount = useBatchSelectionSize(store);
  if (selectedCount === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] bg-[#FFF8F8] px-3 py-2.5"
      role="region"
      aria-label="Acciones por lotes de la vitrina"
    >
      <span className="text-[12px] font-semibold text-[#E30613]">
        {selectedCount} seleccionado{selectedCount === 1 ? '' : 's'}
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bulkBusy}
          onClick={onOpenTitle}
          className="h-7 gap-1.5 text-xs"
        >
          <Type className="size-3.5" aria-hidden="true" />
          Cambiar título
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bulkBusy}
          onClick={onOpenCategories}
          className="h-7 gap-1.5 text-xs"
        >
          <Tags className="size-3.5" aria-hidden="true" />
          Cambiar categoría
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bulkBusy}
          onClick={onDuplicate}
          className="h-7 gap-1.5 text-xs"
        >
          <Copy className="size-3.5" aria-hidden="true" />
          Duplicar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bulkBusy}
          onClick={onDelete}
          className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Eliminar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={bulkBusy}
          onClick={onClear}
          className="h-7 text-xs"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
}

type ShowcaseTableItem =
  | { type: 'header'; id: string; label: string }
  | { type: 'product'; product: HaitechShopProduct };

export function HaitechEquipmentShowcaseTable({
  items,
  catalogReady = false,
  showStockAndToner = false,
}: {
  items: ShowcaseTableItem[];
  catalogReady?: boolean;
  showStockAndToner?: boolean;
}) {
  const { isAdmin } = useAuth();
  const { updateProduct, bulkDeleteProducts, bulkDuplicateProducts, bulkUpdateProducts } =
    useInventoryMutations();
  const [formProduct, setFormProduct] = useState<CatalogRow | null>(null);
  const [formFocus, setFormFocus] = useState<InventoryProductFormFocusSection | null>('image');
  const [attachmentsProduct, setAttachmentsProduct] = useState<CatalogRow | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [hiddenShowcaseIds, setHiddenShowcaseIds] = useState<Set<string>>(() => new Set());
  const [expandedTonerId, setExpandedTonerId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFocus, setBulkFocus] = useState<'name' | 'categories' | null>(null);
  const batchStore = useMemo(() => createAdminInventarioBatchSelectionStore(), []);
  const selectedCount = useBatchSelectionSize(batchStore);

  const colSpan = isAdmin ? 13 : 12;

  useEffect(() => {
    const bump = () => setCatalogRevision((current) => current + 1);
    window.addEventListener(CATALOG_INDEX_UPDATED_EVENT, bump);
    const unsubscribe = subscribeCatalogMediaUpdates(bump);
    return () => {
      window.removeEventListener(CATALOG_INDEX_UPDATED_EVENT, bump);
      unsubscribe();
    };
  }, []);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.type === 'header') return true;
        return !hiddenShowcaseIds.has(item.product.id);
      }),
    [hiddenShowcaseIds, items],
  );

  const pageCatalogIds = useMemo(() => {
    if (!catalogReady) return [] as string[];
    const ids: string[] = [];
    for (const item of visibleItems) {
      if (item.type !== 'product') continue;
      const row = findShowcaseCatalogRow(item.product);
      if (row) ids.push(row.id);
    }
    return ids;
  }, [catalogReady, catalogRevision, visibleItems]);

  const categoryOptions = useMemo(
    () => buildInventoryCategoryOptions(getCatalogRows()),
    [catalogRevision],
  );

  const attributeNameOptions = useMemo(
    () => buildAttributeNameCatalog(getCatalogRows()),
    [catalogRevision],
  );

  const saveProduct = useCallback(
    async (id: string, payload: Partial<InventoryProduct>) => {
      await updateProduct.mutateAsync({ id, payload });
    },
    [updateProduct],
  );

  const hideShowcaseForCatalogIds = useCallback(
    (catalogIds: string[]) => {
      const idSet = new Set(catalogIds);
      const showcaseIds: string[] = [];
      for (const item of items) {
        if (item.type !== 'product') continue;
        const row = findShowcaseCatalogRow(item.product);
        if (row && idSet.has(row.id)) showcaseIds.push(item.product.id);
      }
      if (showcaseIds.length === 0) return;
      setHiddenShowcaseIds((prev) => {
        const next = new Set(prev);
        for (const id of showcaseIds) next.add(id);
        return next;
      });
    },
    [items],
  );

  const handleDeleteOne = useCallback(
    async (row: CatalogRow, showcaseProductId: string) => {
      if (!window.confirm(`¿Eliminar «${row.name}» del inventario?`)) return;
      try {
        await bulkDeleteProducts.mutateAsync([row.id]);
        setHiddenShowcaseIds((prev) => new Set(prev).add(showcaseProductId));
        batchStore.setSelected(row.id, false);
        toast.success('Producto eliminado');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
      }
    },
    [batchStore, bulkDeleteProducts],
  );

  const getSelectedIds = useCallback(() => [...batchStore.getSelectedIds()], [batchStore]);

  const handleBulkDelete = useCallback(async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `¿Eliminar ${ids.length} producto${ids.length === 1 ? '' : 's'} del inventario? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBulkBusy(true);
    try {
      await bulkDeleteProducts.mutateAsync(ids);
      hideShowcaseForCatalogIds(ids);
      batchStore.clear();
      toast.success(`${ids.length} producto${ids.length === 1 ? '' : 's'} eliminado${ids.length === 1 ? '' : 's'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
    } finally {
      setBulkBusy(false);
    }
  }, [batchStore, bulkDeleteProducts, getSelectedIds, hideShowcaseForCatalogIds]);

  const handleBulkDuplicate = useCallback(async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const result = await bulkDuplicateProducts.mutateAsync(ids);
      batchStore.clear();
      toast.success(
        `${result.created} copia${result.created === 1 ? '' : 's'} creada${result.created === 1 ? '' : 's'} en inventario`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo duplicar');
    } finally {
      setBulkBusy(false);
    }
  }, [batchStore, bulkDuplicateProducts, getSelectedIds]);

  const handleBulkApply = useCallback(
    async (patch: InventoryBulkPatch) => {
      const ids = getSelectedIds();
      if (ids.length === 0) return;
      setBulkBusy(true);
      try {
        await bulkUpdateProducts.mutateAsync({ ids, patch });
        batchStore.clear();
        setBulkDialogOpen(false);
        toast.success('Cambios aplicados');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo actualizar');
      } finally {
        setBulkBusy(false);
      }
    },
    [batchStore, bulkUpdateProducts, getSelectedIds],
  );

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#D1D5DB] shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mt-6">
      {isAdmin ? (
        <ShowcaseTableBatchToolbar
          store={batchStore}
          bulkBusy={bulkBusy}
          onOpenTitle={() => {
            setBulkFocus('name');
            setBulkDialogOpen(true);
          }}
          onOpenCategories={() => {
            setBulkFocus('categories');
            setBulkDialogOpen(true);
          }}
          onDuplicate={() => {
            void handleBulkDuplicate();
          }}
          onDelete={() => {
            void handleBulkDelete();
          }}
          onClear={() => batchStore.clear()}
        />
      ) : null}
      <div className="max-h-[70vh] overflow-auto">
        <table
          className="w-full min-w-[84rem] border-collapse bg-white"
          data-catalog-revision={catalogRevision}
        >
          <caption className="sr-only">
            Tabla de equipos: código, imagen, título, stock y tóner, formato, velocidad, año, precios,
            ficha, comprar, cotizar y comparar
          </caption>
          <thead>
            <tr>
              {isAdmin ? (
                <th scope="col" className={cn(HEAD, 'w-10 text-center')}>
                  <BatchSelectAllCheckbox store={batchStore} pageIds={pageCatalogIds} />
                </th>
              ) : null}
              <th scope="col" className={HEAD}>
                Código
              </th>
              <th scope="col" className={HEAD}>
                Imagen
              </th>
              <th scope="col" className={HEAD}>
                Título
              </th>
              <th scope="col" className={cn(HEAD, 'text-center')}>
                {showStockAndToner ? 'Stock / Tóner' : 'Stock'}
              </th>
              <th scope="col" className={cn(HEAD, 'text-center')}>
                Formato
              </th>
              <th scope="col" className={cn(HEAD, 'text-center')}>
                Velocidad
              </th>
              <th scope="col" className={cn(HEAD, 'text-center')}>
                Año fabricación
              </th>
              <th scope="col" className={cn(HEAD, 'text-right')}>
                Precio técnico
              </th>
              <th scope="col" className={cn(HEAD, 'text-right')}>
                Distribuidor
              </th>
              <th scope="col" className={cn(HEAD, 'text-right')}>
                Corporativo
              </th>
              <th scope="col" className={cn(HEAD, 'text-center')}>
                Ficha técnica
              </th>
              <th scope="col" className={cn(HEAD, 'text-right')}>
                Comprar
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) =>
              item.type === 'header' ? (
                <tr key={item.id} className="bg-white">
                  <td
                    colSpan={colSpan}
                    className="border-b border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#111]"
                  >
                    {item.label}
                  </td>
                </tr>
              ) : (
                <EquipmentShowcaseTableRow
                  key={item.product.id}
                  product={item.product}
                  catalogReady={catalogReady}
                  isAdmin={isAdmin}
                  showStockAndToner={showStockAndToner}
                  batchStore={batchStore}
                  tonerExpanded={expandedTonerId === item.product.id}
                  onToggleToner={() =>
                    setExpandedTonerId((current) =>
                      current === item.product.id ? null : item.product.id,
                    )
                  }
                  onSave={saveProduct}
                  onDelete={(row, showcaseId) => {
                    void handleDeleteOne(row, showcaseId);
                  }}
                  onEditImage={(row) => {
                    setFormFocus('image');
                    setFormProduct(row);
                  }}
                  onEditAttachments={setAttachmentsProduct}
                  colSpan={colSpan}
                />
              ),
            )}
          </tbody>
        </table>
      </div>
      {isAdmin ? (
        <Suspense fallback={null}>
          <InventoryProductFormDialog
            open={formProduct != null}
            onOpenChange={(open) => {
              if (!open) setFormProduct(null);
            }}
            initial={formProduct}
            focusSection={formFocus}
            onSaved={() => setFormProduct(null)}
          />
          <InventoryAttachmentsDialog
            open={attachmentsProduct != null}
            onOpenChange={(open) => {
              if (!open) setAttachmentsProduct(null);
            }}
            product={attachmentsProduct}
          />
          <InventoryBulkEditDialog
            open={bulkDialogOpen}
            onOpenChange={(open) => {
              setBulkDialogOpen(open);
              if (!open) setBulkFocus(null);
            }}
            selectedCount={selectedCount}
            categoryOptions={categoryOptions}
            attributeNameOptions={attributeNameOptions}
            onApply={handleBulkApply}
            isSaving={bulkBusy}
            initialFocus={bulkFocus}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
