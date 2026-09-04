import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileText, GitCompare, Pencil, ShoppingCart } from 'lucide-react';

import { type InventoryProductFormFocusSection } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { ProductStockHover } from '@/components/product/product-stock-hover';
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
import type { CatalogRow } from '@/lib/catalog-featured';
import { type CompareProductItem } from '@/lib/compare-product';
import {
  CONSULTAR_PRECIO_LABEL,
  getDisplayPriceVisibility,
  isPriceOnRequest,
  PRODUCT_ON_REQUEST_STOCK_LABEL,
} from '@/lib/display-price';
import { findTechnicalSheetAttachment } from '@/lib/inventory-attachments';
import { getProductTableSpecDisplay } from '@/lib/product-table-spec-columns';
import { randomId } from '@/lib/random-id';
import { ensureFullPrices, type PriceRole } from '@/lib/roles';
import { findShowcaseCatalogRow, resolveShowcaseProductHref } from '@/lib/showcase-product-href';
import { resolveShowcaseProductPricesUsd, showcaseDisplayUsd, showcaseUsdToPen } from '@/lib/showcase-product-pricing';
import { penToUsd, cn } from '@/lib/utils';
import type { InventoryProduct, Product, ProductAttribute } from '@/types/product';

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

const HEAD =
  'sticky top-0 z-[1] whitespace-nowrap border-b border-[#D1D5DB] bg-[#F3F4F6] px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#4B5563] sm:px-3 sm:text-[11px]';

const CELL = 'border-b border-[#E5E7EB] px-2.5 py-2 align-middle text-[12px] text-[#111] sm:px-3 sm:text-[13px]';

const ACTION_ICON =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:border-[#E30613] hover:bg-[#FFF1F2] hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

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
    <div className={cn('group/cell flex min-h-8 items-center gap-1.5', alignClass, className)}>
      <div className={cn('min-w-0 flex-1', align === 'right' && 'text-right')}>{children}</div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit();
        }}
        className={cn(
          'shrink-0 rounded-md p-1 text-red-600 transition-opacity',
          'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100',
          'hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        )}
        aria-label={ariaLabel}
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </button>
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
    <div className={cn('group/cell flex min-h-8 items-center gap-1.5', alignClass, className)}>
      {!editing ? (
        <>
          <div className="min-w-0 flex-1">{children}</div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
            className={cn(
              'shrink-0 rounded-md p-1 text-red-600 transition-opacity',
              'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100',
              'hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            )}
            aria-label={ariaLabel}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
        </>
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
            'h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground',
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
    <div className={cn('group/cell flex min-h-8 items-center gap-1.5', alignClass)}>
      {!editing ? (
        <>
          <div className="min-w-0 flex-1">{children}</div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
            className={cn(
              'shrink-0 rounded-md p-1 text-red-600 transition-opacity',
              'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100',
              'hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
            )}
            aria-label={ariaLabel}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
        </>
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
            'h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground tabular-nums',
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
  onSave,
  onEditImage,
  onEditAttachments,
}: {
  product: HaitechShopProduct;
  catalogReady: boolean;
  isAdmin: boolean;
  onSave: (id: string, payload: Partial<InventoryProduct>) => Promise<void>;
  onEditImage: (row: CatalogRow) => void;
  onEditAttachments: (row: CatalogRow) => void;
}) {
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
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const hasStock = product.stock != null;
  const outOfStock = hasStock && stockCount <= 0;
  const cartProduct = useMemo(() => toCartProduct(product, saleRate), [product, saleRate]);
  const buyLabel = outOfStock ? 'Reservar' : getAddToCartLabel(cartProduct, 'short');
  const compareSelected = isSelected(product.id);

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
    <tr className="group/row bg-white hover:bg-[#FAFAFA]">
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
            {title}
          </Link>
        </InlineEditableTextCell>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-center')}>
        <InlineEditableNumberCell
          canEdit={canManage}
          ariaLabel="Modificar stock"
          value={stockCount}
          min={0}
          step={1}
          align="center"
          onCommit={async (next) => {
            if (!catalogRow) return;
            await onSave(catalogRow.id, { stock: next });
          }}
        >
          {hasStock ? (
            <ProductStockHover
              stock={stockCount}
              outOfStock={outOfStock}
              stockLocations={resolveHaitechShopStockLocations(product)}
              prefix=""
              className="justify-center text-[12px] font-semibold text-[#374151]"
              iconClassName="size-3.5"
            />
          ) : (
            <span className="text-[#9CA3AF]">{PRODUCT_ON_REQUEST_STOCK_LABEL}</span>
          )}
        </InlineEditableNumberCell>
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
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-[#E30613] hover:bg-[#FFF1F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              PDF
            </a>
          ) : (
            <Link
              to={href}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Ver
            </Link>
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
            <ShoppingCart className="size-3.5" aria-hidden="true" />
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
        </div>
      </td>
    </tr>
  );
}

type ShowcaseTableItem =
  | { type: 'header'; id: string; label: string }
  | { type: 'product'; product: HaitechShopProduct };

export function HaitechEquipmentShowcaseTable({
  items,
  catalogReady = false,
}: {
  items: ShowcaseTableItem[];
  catalogReady?: boolean;
}) {
  const { isAdmin } = useAuth();
  const { updateProduct } = useInventoryMutations();
  const [formProduct, setFormProduct] = useState<CatalogRow | null>(null);
  const [formFocus, setFormFocus] = useState<InventoryProductFormFocusSection | null>('image');
  const [attachmentsProduct, setAttachmentsProduct] = useState<CatalogRow | null>(null);

  const saveProduct = useCallback(
    async (id: string, payload: Partial<InventoryProduct>) => {
      await updateProduct.mutateAsync({ id, payload });
    },
    [updateProduct],
  );

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#D1D5DB] shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mt-6">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[84rem] border-collapse bg-white">
          <caption className="sr-only">
            Tabla de equipos: código, imagen, título, stock, formato, velocidad, año, precios, ficha, comprar, cotizar y
            comparar
          </caption>
          <thead>
            <tr>
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
                Stock
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
            {items.map((item) =>
              item.type === 'header' ? (
                <tr key={item.id} className="bg-[#F9FAFB]">
                  <td
                    colSpan={12}
                    className="border-b border-[#E5E7EB] px-3 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#111]"
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
                  onSave={saveProduct}
                  onEditImage={(row) => {
                    setFormFocus('image');
                    setFormProduct(row);
                  }}
                  onEditAttachments={setAttachmentsProduct}
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
        </Suspense>
      ) : null}
    </div>
  );
}
