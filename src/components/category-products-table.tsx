import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Pencil, ShoppingCart, Trash2 } from 'lucide-react';

import {
  InventoryProductFormDialog,
  type InventoryProductFormFocusSection,
} from '@/components/admin/inventory/inventory-product-form-dialog';
import { InventoryAttributesFieldset } from '@/components/admin/inventory/inventory-attributes-fieldset';
import { InventorySelectField } from '@/components/admin/inventory/inventory-select-field';
import { AddToCartButton, getAddToCartLabel, ON_REQUEST_PRODUCT_BUTTON_CLASS } from '@/components/cart/add-to-cart-button';
import { CategoryTablePurchaseCell } from '@/components/category/category-table-purchase-cell';
import { CategoryTableRolePricing } from '@/components/category/category-table-role-pricing';
import { Input } from '@/components/ui/input';
import { InventoryStockStatusBar } from '@/components/inventory-stock-status-bar';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import {
  useAdminInventoryCatalogMap,
  type AdminCatalogInventoryEntry,
} from '@/hooks/use-admin-inventory-price-map';
import { useInventoryMutations } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  countCategoryTableColumns,
  getCategoryTableVisiblePriceRoles,
} from '@/lib/category-table-price-columns';
import { buildCategorySelectGroups } from '@/lib/inventory-category-options';
import { createEmptyInventoryProduct } from '@/lib/inventory-product';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { getProductCardTitleContent, PRODUCT_CARD_CODE_CLASS } from '@/lib/product-card-title';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { resolveProductEquipmentConditionLabel } from '@/lib/product-hero-meta';
import {
  getProductTableSpecDisplay,
  PRODUCT_TABLE_SPEC_COLUMNS,
  splitProductTableCategoryParts,
  type ProductTableSpecColumnId,
} from '@/lib/product-table-spec-columns';
import {
  ensureFullPrices,
  PRICE_ROLE_LABELS,
  type PriceRole,
  type ProductRolePrices,
} from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';

function resolveTableRolePrices(
  product: Product,
  catalogEntry: AdminCatalogInventoryEntry | undefined,
): ProductRolePrices {
  return (
    catalogEntry?.prices ??
    product.prices ??
    ensureFullPrices({ public: product.price })
  );
}

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
  const cleaned = String(raw ?? '').trim().replace(/,/g, '.');
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num;
}

interface CategoryProductsTableProps {
  products: Product[];
  /** Total filtrado en servidor (puede ser mayor que `products.length`). */
  totalCount?: number;
  /** Categoría preseleccionada al crear producto (solo administrador). */
  defaultCategory?: string | null;
  bindOpenCreate?: (openCreate: (() => void) | null) => void;
}

const tableHeadClass =
  'h-9 whitespace-nowrap px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground';

const tableCellClass = 'px-2.5 py-2 align-middle';

const rolePriceHeadClass = cn(tableHeadClass, 'min-w-[5.5rem] text-right');

const rolePriceCellClass = cn(tableCellClass, 'text-right');

const specHeadClass = cn(
  tableHeadClass,
  'hidden border-l border-border/60 text-center md:table-cell',
);

const specCellClass = cn(
  tableCellClass,
  'hidden border-l border-border/60 text-center text-xs leading-tight text-muted-foreground md:table-cell',
);

const SPEC_COLUMN_MIN_WIDTH: Partial<Record<ProductTableSpecColumnId, string>> = {
  velocidad: 'min-w-[4.25rem]',
  adf: 'min-w-[5.25rem]',
  produccion: 'min-w-[6rem]',
  anio: 'min-w-[4.25rem]',
};

type ProductTableImageSource = Pick<
  Product,
  'id' | 'name' | 'category' | 'brand' | 'image_url' | 'gallery'
>;

function ProductTableThumbnail({
  product,
  detailHref,
  allowDataUrl,
}: {
  product: ProductTableImageSource;
  detailHref: string;
  allowDataUrl?: boolean;
}) {
  const imageCandidates = useMemo(
    () =>
      buildProductImageCandidates(product, {
        ...(allowDataUrl ? { allowDataUrl: true } : {}),
      }),
    [allowDataUrl, product],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [imagesExhausted, setImagesExhausted] = useState(false);
  const src = imagesExhausted ? null : (imageCandidates[imageIndex] ?? null);

  const handleError = () => {
    if (imageIndex + 1 < imageCandidates.length) {
      setImageIndex((current) => current + 1);
      return;
    }
    setImagesExhausted(true);
  };

  return (
    <Link
      to={detailHref}
      className="relative block size-14 shrink-0 overflow-hidden rounded-md border border-border/70 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 sm:size-16"
      aria-label={`Ver ficha de ${product.name}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="size-full object-contain p-1.5 sm:p-2"
          loading="lazy"
          onError={handleError}
        />
      ) : (
        <ImageOff className="mx-auto size-4 text-muted-foreground/70" aria-hidden="true" />
      )}
    </Link>
  );
}

function ProductTableSpecCell({
  product,
  columnId,
}: {
  product: Product;
  columnId: ProductTableSpecColumnId;
}) {
  const value = getProductTableSpecDisplay(product, columnId);
  const compact = columnId === 'velocidad' || columnId === 'adf' || columnId === 'anio';
  return (
    <span
      className={cn(
        'block leading-tight',
        compact ? 'whitespace-nowrap' : 'text-pretty',
      )}
      title={value === '—' ? undefined : value}
    >
      {value}
    </span>
  );
}

function CategoryTableAdminHoverCell({
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
    align === 'right'
      ? 'justify-end text-right'
      : align === 'left'
        ? 'justify-start text-left'
        : 'justify-center text-center';

  return (
    <div className={cn('group/cell flex min-h-8 items-center gap-2', alignClass, className)}>
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
          // En móvil/tablet sin hover se mantiene visible.
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
    align === 'right'
      ? 'justify-end text-right'
      : align === 'left'
        ? 'justify-start text-left'
        : 'justify-center text-center';

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
    <div className={cn('group/cell flex min-h-8 items-center gap-2', alignClass)}>
      {!editing ? (
        <>
          <div className={cn('min-w-0 flex-1')}>{children}</div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
            className={cn(
              'shrink-0 rounded-md p-1 text-red-600 transition-opacity',
              // En móvil/tablet sin hover se mantiene visible.
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

function ProductTableCodeCell({ product }: { product: Product }) {
  const code = formatProductDisplayCode(product.code, {
    brand: product.brand,
    category: product.category,
    name: product.name,
  });

  return (
    <span
      className={cn(PRODUCT_CARD_CODE_CLASS, 'block truncate text-center tabular-nums')}
      title={code ?? product.code ?? undefined}
    >
      {code ?? '—'}
    </span>
  );
}

function CategoryTableSectionRow({
  label,
  colSpan,
  productCount,
  variant = 'category',
}: {
  label: string;
  colSpan: number;
  productCount: number;
  variant?: 'category' | 'subcategory';
}) {
  const isSubcategory = variant === 'subcategory';

  return (
    <TableRow
      className={cn(
        'border-y border-border/80 hover:bg-muted/50',
        isSubcategory ? 'bg-blue-50 hover:bg-blue-50' : 'bg-muted/50',
      )}
    >
      <TableCell
        colSpan={colSpan}
        className={cn('py-2', isSubcategory ? 'pl-6 pr-3 sm:pl-8' : 'px-3')}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={cn(
              'font-bold tracking-wide text-foreground',
              isSubcategory
                ? 'text-[0.72rem] font-semibold normal-case text-blue-950 sm:text-[0.78rem]'
                : 'text-xs uppercase',
            )}
          >
            {label}
          </span>
          <span className="text-[0.65rem] font-medium tabular-nums text-muted-foreground">
            {productCount} producto{productCount === 1 ? '' : 's'}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

type TableSubcategorySection = {
  subLabel: string;
  products: Product[];
};

type TableCategorySection = {
  rootLabel: string;
  subcategories: TableSubcategorySection[];
  productCount: number;
};

function normalizeSubcategorySortKey(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function subcategorySortRank(label: string): number {
  const key = normalizeSubcategorySortKey(label);
  if (key === 'nuevas' || key === 'nueva') return 0;
  if (key === 'seminuevas' || key === 'seminueva') return 1;
  if (key === 'remanufacturadas' || key === 'remanufacturada') return 2;
  if (key === '—' || key === '-' || key === '') return 99;
  return 10;
}

function groupProductsForTable(products: Product[]): TableCategorySection[] {
  const categoryOrder: string[] = [];
  const categoryMap = new Map<string, Map<string, Product[]>>();

  for (const product of products) {
    const { rootLabel, subLabel } = splitProductTableCategoryParts(product.category);
    if (!categoryMap.has(rootLabel)) {
      categoryMap.set(rootLabel, new Map());
      categoryOrder.push(rootLabel);
    }
    const subMap = categoryMap.get(rootLabel)!;
    if (!subMap.has(subLabel)) {
      subMap.set(subLabel, []);
    }
    subMap.get(subLabel)!.push(product);
  }

  return categoryOrder.map((rootLabel) => {
    const subMap = categoryMap.get(rootLabel) ?? new Map();
    const subcategories = Array.from(subMap.entries())
      .map(([subLabel, sectionProducts]) => ({
        subLabel,
        products: sectionProducts,
      }))
      .sort((a, b) => {
        const aRank = subcategorySortRank(a.subLabel);
        const bRank = subcategorySortRank(b.subLabel);
        if (aRank !== bRank) return aRank - bRank;
        return a.subLabel.localeCompare(b.subLabel, 'es', { sensitivity: 'base' });
      });
    const productCount = subcategories.reduce((sum, section) => sum + section.products.length, 0);
    return { rootLabel, subcategories, productCount };
  });
}

export function CategoryProductsTable({
  products,
  totalCount,
  defaultCategory = null,
  bindOpenCreate,
}: CategoryProductsTableProps) {
  const { isAdmin, role, viewAsRoles } = useAuth();
  const catalogMap = useAdminInventoryCatalogMap();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const previewAsRole = viewAsRoles.length > 0;
  const visiblePriceRoles = useMemo(
    () =>
      getCategoryTableVisiblePriceRoles(
        isAdmin && !previewAsRole,
        role,
        previewAsRole ? viewAsRoles : undefined,
      ),
    [isAdmin, previewAsRole, viewAsRoles, role],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [dialogFocusSection, setDialogFocusSection] =
    useState<InventoryProductFormFocusSection | null>(null);
  const { deleteProduct } = useInventoryMutations();

  const tableMinWidth = isAdmin ? '96rem' : '52rem';
  const tableColSpan = useMemo(
    () =>
      countCategoryTableColumns(
        isAdmin && !previewAsRole,
        role,
        previewAsRole ? viewAsRoles : undefined,
      ),
    [isAdmin, previewAsRole, viewAsRoles, role],
  );
  const categorySections = useMemo(() => groupProductsForTable(products), [products]);
  const categorySelectGroups = useMemo(
    () => (isAdmin ? buildCategorySelectGroups(categoryTree, []) : []),
    [categoryTree, isAdmin],
  );

  const openCreate = useCallback(() => {
    const empty = createEmptyInventoryProduct();
    if (defaultCategory?.trim()) {
      empty.category = defaultCategory.trim();
    }
    setEditingProduct(empty);
    setDialogFocusSection(null);
    setDialogOpen(true);
  }, [defaultCategory]);

  useEffect(() => {
    if (!isAdmin || !bindOpenCreate) return;
    bindOpenCreate(openCreate);
    return () => bindOpenCreate(null);
  }, [isAdmin, bindOpenCreate, openCreate]);

  const openEdit = useCallback(
    (inventory: InventoryProduct, focusSection?: InventoryProductFormFocusSection) => {
      setEditingProduct(inventory);
      setDialogFocusSection(focusSection ?? null);
      setDialogOpen(true);
    },
    [],
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      setDialogFocusSection(null);
    }
  }, []);

  const handleDelete = useCallback(
    async (inventory: InventoryProduct) => {
      if (!window.confirm(`¿Eliminar «${inventory.name}» del inventario?`)) return;
      await deleteProduct.mutateAsync(inventory.id);
    },
    [deleteProduct],
  );

  return (
    <div className="space-y-2">
      <div className="max-h-[min(70vh,48rem)] overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <Table className="border-collapse text-xs" style={{ minWidth: tableMinWidth }}>
          <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            <TableRow className="border-b border-border hover:bg-muted/95">
              <TableHead
                scope="col"
                className={cn(
                  tableHeadClass,
                  'w-[5.25rem] min-w-[5.25rem] border-r border-border/60 text-center sm:w-28 sm:min-w-[7rem]',
                )}
              >
                Código
              </TableHead>
              <TableHead
                scope="col"
                className={cn(
                  tableHeadClass,
                  'min-w-[22rem] border-r border-border/60 text-left sm:min-w-[26rem]',
                )}
              >
                Producto
              </TableHead>
              {PRODUCT_TABLE_SPEC_COLUMNS.map((column) => (
                <TableHead
                  key={column.id}
                  scope="col"
                  className={cn(specHeadClass, SPEC_COLUMN_MIN_WIDTH[column.id])}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead scope="col" className={cn(tableHeadClass, 'w-28 border-l border-border/60 text-center')}>
                Stock
              </TableHead>
              {isAdmin ? (
                <TableHead scope="col" className={rolePriceHeadClass}>
                  Compra
                </TableHead>
              ) : null}
              {visiblePriceRoles.map((priceRole) => (
                <TableHead
                  key={priceRole}
                  scope="col"
                  className={cn(rolePriceHeadClass, 'border-l border-border/60')}
                >
                  {PRICE_ROLE_LABELS[priceRole]}
                </TableHead>
              ))}
              <TableHead scope="col" className={cn(tableHeadClass, 'w-36 border-l border-border/60 text-center')}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorySections.map((section) => (
              <Fragment key={section.rootLabel}>
                <CategoryTableSectionRow
                  label={section.rootLabel}
                  colSpan={tableColSpan}
                  productCount={section.productCount}
                  variant="category"
                />
                {section.subcategories.map((subSection) => (
                  <Fragment key={`${section.rootLabel}-${subSection.subLabel}`}>
                    {subSection.subLabel !== '—' ? (
                      <CategoryTableSectionRow
                        label={subSection.subLabel}
                        colSpan={tableColSpan}
                        productCount={subSection.products.length}
                        variant="subcategory"
                      />
                    ) : null}
                    {subSection.products.map((product, index) => (
                      <CategoryProductTableRow
                        key={product.id}
                        product={product}
                        catalogEntry={catalogMap?.get(product.id)}
                        categorySelectGroups={categorySelectGroups}
                        visiblePriceRoles={visiblePriceRoles}
                        isAdmin={isAdmin}
                        striped={index % 2 === 1}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-right text-xs tabular-nums text-muted-foreground">
        {totalCount != null && totalCount > products.length
          ? `Mostrando ${products.length} de ${totalCount} productos`
          : `${products.length} producto${products.length === 1 ? '' : 's'}`}
      </p>

      {isAdmin ? (
        <InventoryProductFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          initial={editingProduct}
          focusSection={dialogFocusSection}
        />
      ) : null}
    </div>
  );
}

function CategoryProductTableRow({
  product,
  catalogEntry,
  categorySelectGroups,
  visiblePriceRoles,
  isAdmin,
  striped,
  onEdit,
  onDelete,
}: {
  product: Product;
  catalogEntry: AdminCatalogInventoryEntry | undefined;
  categorySelectGroups: ReturnType<typeof buildCategorySelectGroups>;
  visiblePriceRoles: readonly PriceRole[];
  isAdmin: boolean;
  striped: boolean;
  onEdit: (inventory: InventoryProduct, focusSection?: InventoryProductFormFocusSection) => void;
  onDelete: (inventory: InventoryProduct) => void;
}) {
  const { updateProduct } = useInventoryMutations();
  const stockQty = catalogEntry?.product.stock ?? product.stock;
  const displayProduct: Product =
    catalogEntry != null ? { ...product, stock: catalogEntry.product.stock } : product;
  const detailHref = productPath(product);
  const imageProduct = catalogEntry?.product ?? product;
  const rolePrices = resolveTableRolePrices(product, catalogEntry);
  const canManage = isAdmin && catalogEntry != null;
  const displayPriceUsd = product.price;
  const conditionLabel = resolveProductEquipmentConditionLabel(product);
  const showConditionBadge =
    conditionLabel === 'Nueva' ||
    conditionLabel === 'Seminueva' ||
    conditionLabel === 'Remanufacturada';

  const [inlineEditor, setInlineEditor] = useState<null | 'title' | 'category' | 'attributes'>(null);
  const [draftTitle, setDraftTitle] = useState(product.name);
  const [draftCategory, setDraftCategory] = useState(product.category ?? '');
  const [draftAttributes, setDraftAttributes] = useState(product.attributes ?? []);

  useEffect(() => {
    if (inlineEditor !== 'title') setDraftTitle(product.name);
  }, [product.name, inlineEditor]);
  useEffect(() => {
    if (inlineEditor !== 'category') setDraftCategory(product.category ?? '');
  }, [product.category, inlineEditor]);
  useEffect(() => {
    if (inlineEditor !== 'attributes') setDraftAttributes(product.attributes ?? []);
  }, [product.attributes, inlineEditor]);

  const commitPatch = async (patch: Partial<InventoryProduct>) => {
    if (!catalogEntry) return;
    await updateProduct.mutateAsync({ id: catalogEntry.product.id, payload: patch });
  };
  const openTitleEdit = () => {
    if (!catalogEntry) return;
    setInlineEditor((prev) => (prev === 'title' ? null : 'title'));
  };
  const openImageEdit = () => {
    if (!catalogEntry) return;
    onEdit(catalogEntry.product, 'image');
  };
  const openCategoryEdit = () => {
    if (!catalogEntry) return;
    setInlineEditor((prev) => (prev === 'category' ? null : 'category'));
  };
  const openAttributesEdit = () => {
    if (!catalogEntry) return;
    setInlineEditor((prev) => (prev === 'attributes' ? null : 'attributes'));
  };

  const editorColSpan = useMemo(
    () => countCategoryTableColumns(true, 'public'),
    [],
  );

  return (
    <>
      <TableRow
        className={cn(
          'group/row border-b border-border/70 transition-colors hover:bg-muted/30',
          striped && 'bg-muted/15',
        )}
      >
      <TableCell
        className={cn(
          tableCellClass,
          'w-[5.25rem] min-w-[5.25rem] border-r border-border/60 sm:w-28 sm:min-w-[7rem]',
        )}
      >
        <CategoryTableAdminHoverCell
          canManage={canManage}
          ariaLabel="Modificar código"
          onEdit={openTitleEdit}
        >
          <ProductTableCodeCell product={product} />
        </CategoryTableAdminHoverCell>
      </TableCell>
      <TableCell className={cn(tableCellClass, 'border-r border-border/60')}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <ProductTableThumbnail
              product={imageProduct}
              detailHref={detailHref}
              allowDataUrl={canManage}
            />
            <div className="absolute inset-0">
              <CategoryTableAdminHoverCell
                canManage={canManage}
                ariaLabel="Modificar imágenes"
                onEdit={openImageEdit}
                className="h-full"
              >
                <span className="sr-only">Modificar imágenes</span>
              </CategoryTableAdminHoverCell>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {showConditionBadge ? (
              <div className="mb-0.5 flex justify-end sm:justify-start">
                <ProductConditionBadge label={conditionLabel} size="table" />
              </div>
            ) : null}
            <CategoryTableAdminHoverCell
              canManage={canManage}
              ariaLabel="Modificar título"
              onEdit={openTitleEdit}
              align="left"
            >
              <Link
                to={detailHref}
                className="block min-w-0 rounded no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                title={getProductCardTitleContent(product).title}
              >
                <ProductCardTitle product={product} variant="table" className="text-[0.92rem] sm:text-[0.95rem]" />
              </Link>
            </CategoryTableAdminHoverCell>
            <div className="mt-1 flex gap-1.5">
              <button
                type="button"
                className={cn(
                  'text-[0.65rem] font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                  !canManage && 'hidden',
                )}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openCategoryEdit();
                }}
              >
                Categoría
              </button>
              <span className={cn('text-[0.65rem] text-muted-foreground', !canManage && 'hidden')}>
                ·
              </span>
              <button
                type="button"
                className={cn(
                  'text-[0.65rem] font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                  !canManage && 'hidden',
                )}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openAttributesEdit();
                }}
              >
                Atributos
              </button>
            </div>
          </div>
          {canManage ? (
            <button
              type="button"
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors',
                'hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                'opacity-100 sm:opacity-0 sm:transition-opacity',
                'sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100',
              )}
              aria-label={`Eliminar ${product.name}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void onDelete(catalogEntry.product);
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </TableCell>
      {PRODUCT_TABLE_SPEC_COLUMNS.map((column) => (
        <TableCell key={column.id} className={specCellClass}>
          <CategoryTableAdminHoverCell
            canManage={canManage}
            ariaLabel={`Modificar ${column.label}`}
            onEdit={openAttributesEdit}
          >
            <ProductTableSpecCell product={product} columnId={column.id} />
          </CategoryTableAdminHoverCell>
        </TableCell>
      ))}
      <TableCell className={cn(tableCellClass, 'border-l border-border/60 text-center')}>
        <InlineEditableNumberCell
          canEdit={canManage}
          ariaLabel="Modificar stock"
          value={stockQty}
          min={0}
          step={1}
          align="center"
          onCommit={async (next) => {
            if (!catalogEntry) return;
            await updateProduct.mutateAsync({
              id: catalogEntry.product.id,
              payload: { stock: next },
            });
          }}
        >
          <InventoryStockStatusBar stock={stockQty} compact variant="storefront" />
        </InlineEditableNumberCell>
      </TableCell>
      {isAdmin ? (
        <TableCell className={rolePriceCellClass}>
          <InlineEditableNumberCell
            canEdit={canManage}
            ariaLabel="Modificar precio de compra (USD)"
            value={catalogEntry?.purchasePriceUsd ?? 0}
            min={0}
            step={0.01}
            precision={2}
            align="right"
            onCommit={async (next) => {
              if (!catalogEntry) return;
              await updateProduct.mutateAsync({
                id: catalogEntry.product.id,
                payload: { purchase_price_usd: next },
              });
            }}
          >
            <CategoryTablePurchaseCell
              purchasePriceUsd={catalogEntry?.purchasePriceUsd ?? 0}
            />
          </InlineEditableNumberCell>
        </TableCell>
      ) : null}
      {visiblePriceRoles.map((priceRole) => (
        <TableCell key={priceRole} className={cn(rolePriceCellClass, 'border-l border-border/60')}>
          <InlineEditableNumberCell
            canEdit={canManage}
            ariaLabel={`Modificar precio ${PRICE_ROLE_LABELS[priceRole]} (USD)`}
            value={rolePrices[priceRole]}
            min={0}
            step={1}
            align="right"
            onCommit={async (next) => {
              if (!catalogEntry) return;
              await updateProduct.mutateAsync({
                id: catalogEntry.product.id,
                payload: {
                  prices: {
                    ...(catalogEntry.product.prices ?? {}),
                    [priceRole]: next,
                  },
                },
              });
            }}
          >
            <CategoryTableRolePricing priceUsd={rolePrices[priceRole]} />
          </InlineEditableNumberCell>
        </TableCell>
      ))}
      <TableCell className={cn(tableCellClass, 'border-l border-border/60')}>
        <div className="flex items-center justify-center gap-1.5">
          <AddToCartButton
            product={displayProduct}
            size="sm"
            className={cn(
              'h-8 min-w-[5rem] gap-1 rounded-md px-2 text-[0.65rem] font-semibold',
              stockQty <= 0
                ? ON_REQUEST_PRODUCT_BUTTON_CLASS
                : 'bg-red-600 text-white hover:bg-red-500',
            )}
          >
            {stockQty > 0 ? (
              <ShoppingCart className="size-3 shrink-0" aria-hidden="true" />
            ) : null}
            {getAddToCartLabel(displayProduct, 'short')}
          </AddToCartButton>
          <ProductWhatsAppButton
            className="size-8 shrink-0 rounded-md"
            product={{
              id: product.id,
              name: product.name,
              priceUsd: displayPriceUsd,
              category: product.category,
              brand: product.brand ?? null,
            }}
          />
        </div>
      </TableCell>
      </TableRow>

      {canManage && inlineEditor ? (
        <TableRow className="border-b border-border/70 bg-muted/10">
          <TableCell colSpan={editorColSpan} className="px-3 py-3">
            {inlineEditor === 'title' ? (
              <div className="max-w-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Editar título</p>
                <Input
                  value={draftTitle}
                  onChange={(event) => {
                    const next = event.target.value;
                    setDraftTitle(next);
                    void commitPatch({ name: next });
                  }}
                  onBlur={() => setInlineEditor(null)}
                  className="h-10"
                />
                <p className="text-[0.65rem] text-muted-foreground">Se guarda automáticamente.</p>
              </div>
            ) : inlineEditor === 'category' ? (
              <div className="max-w-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Editar categoría</p>
                <InventorySelectField
                  id={`inline-cat-${product.id}`}
                  label=""
                  placeholder="Elegir…"
                  value={draftCategory}
                  groups={categorySelectGroups}
                  onChange={(value) => {
                    setDraftCategory(value);
                    void commitPatch({ category: value });
                  }}
                />
                <p className="text-[0.65rem] text-muted-foreground">Se guarda automáticamente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Editar atributos</p>
                <InventoryAttributesFieldset
                  embedded
                  attributes={draftAttributes}
                  onChange={(next) => {
                    setDraftAttributes(next);
                    void commitPatch({ attributes: next });
                  }}
                />
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="min-h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setInlineEditor(null)}
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

export function CategoryProductsTableSkeleton({ rows = 8 }: { rows?: number }) {
  const { isAdmin, role, viewAsRoles } = useAuth();
  const previewAsRole = viewAsRoles.length > 0;
  const colSpan = useMemo(
    () =>
      countCategoryTableColumns(
        isAdmin && !previewAsRole,
        role,
        previewAsRole ? viewAsRoles : undefined,
      ),
    [isAdmin, previewAsRole, viewAsRoles, role],
  );

  const minWidth = isAdmin ? '96rem' : '52rem';

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm"
      aria-hidden="true"
    >
      <Table style={{ minWidth }}>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className={index % 2 === 1 ? 'bg-muted/20' : undefined}>
              <TableCell colSpan={colSpan} className="px-2 py-1.5">
                <div className="h-10 animate-pulse rounded-md border border-border/60 bg-muted" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
