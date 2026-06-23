import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Pencil, ShoppingCart, Trash2 } from 'lucide-react';

import {
  InventoryProductFormDialog,
  type InventoryProductFormFocusSection,
} from '@/components/admin/inventory/inventory-product-form-dialog';
import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { CategoryTableDiscountBadge } from '@/components/category/category-table-pricing';
import { CategoryTablePurchaseCell } from '@/components/category/category-table-purchase-cell';
import { CategoryTableRolePricing } from '@/components/category/category-table-role-pricing';
import { InventoryStockStatusBar } from '@/components/inventory-stock-status-bar';
import { ProductCardTitle } from '@/components/product/product-card-title';
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
import {
  countCategoryTableColumns,
  getCategoryTableVisiblePriceRoles,
} from '@/lib/category-table-price-columns';
import { createEmptyInventoryProduct } from '@/lib/inventory-product';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import {
  formatProductTableCategory,
  getProductTableSpecDisplay,
  PRODUCT_TABLE_SPEC_COLUMNS,
  type ProductTableSpecColumnId,
} from '@/lib/product-table-spec-columns';
import {
  ensureFullPrices,
  PRICE_ROLE_LABELS,
  resolvePriceRole,
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

interface CategoryProductsTableProps {
  products: Product[];
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
  'hidden text-center lg:table-cell',
);

const specCellClass = cn(
  tableCellClass,
  'hidden text-center text-xs leading-tight text-muted-foreground lg:table-cell',
);

const SPEC_COLUMN_MIN_WIDTH: Partial<Record<ProductTableSpecColumnId, string>> = {
  velocidad: 'min-w-[4.5rem]',
  adf: 'min-w-[5rem]',
  produccion: 'min-w-[5.5rem]',
  anio: 'min-w-[4rem]',
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
      className="relative block size-11 shrink-0 overflow-hidden rounded-md border border-border/70 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 sm:size-12"
      aria-label={`Ver ficha de ${product.name}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="size-full object-contain p-1"
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

function CategoryTableCategoryCell({
  category,
  canManage,
  onEditCategory,
}: {
  category: string | null | undefined;
  canManage: boolean;
  onEditCategory: () => void;
}) {
  const label = formatProductTableCategory(category);
  const hasCategory = Boolean(category?.trim());

  if (!canManage) {
    return (
      <span
        className="block truncate text-center text-xs leading-tight text-muted-foreground"
        title={category ?? undefined}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="group/category relative flex min-h-8 items-center justify-center">
      <span
        className={cn(
          'block max-w-full truncate px-5 text-center text-xs leading-tight text-muted-foreground',
          'transition-opacity sm:group-hover/row:opacity-0',
        )}
        title={category ?? undefined}
      >
        {label || '—'}
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEditCategory();
        }}
        className={cn(
          'absolute inset-0 inline-flex items-center justify-center rounded-md text-red-600 transition-opacity',
          'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100',
          'hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        )}
        aria-label={hasCategory ? 'Modificar categoría' : 'Agregar categoría'}
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function CategoryProductsTable({
  products,
  defaultCategory = null,
  bindOpenCreate,
}: CategoryProductsTableProps) {
  const { isAdmin, role, viewAsRoles, effectiveRole } = useAuth();
  const catalogMap = useAdminInventoryCatalogMap();
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
  const discountPriceRole: PriceRole = isAdmin && !previewAsRole ? 'public' : resolvePriceRole(effectiveRole);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [dialogFocusSection, setDialogFocusSection] =
    useState<InventoryProductFormFocusSection | null>(null);
  const { deleteProduct } = useInventoryMutations();

  const tableMinWidth = isAdmin ? '96rem' : '52rem';

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
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table className="border-collapse" style={{ minWidth: tableMinWidth }}>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead
                scope="col"
                className={cn(
                  tableHeadClass,
                  'hidden text-center md:table-cell',
                  isAdmin ? 'min-w-[8.75rem]' : 'min-w-[7.5rem]',
                )}
              >
                Categoría
              </TableHead>
            <TableHead scope="col" className={cn(tableHeadClass, 'min-w-[18rem] text-left')}>
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
              <TableHead scope="col" className={cn(tableHeadClass, 'w-28 text-center')}>
                Stock
              </TableHead>
              <TableHead scope="col" className={cn(tableHeadClass, 'w-24 text-center')}>
                Descuento
              </TableHead>
              {isAdmin ? (
                <TableHead scope="col" className={rolePriceHeadClass}>
                  Compra
                </TableHead>
              ) : null}
              {visiblePriceRoles.map((priceRole) => (
                <TableHead key={priceRole} scope="col" className={rolePriceHeadClass}>
                  {PRICE_ROLE_LABELS[priceRole]}
                </TableHead>
              ))}
              <TableHead scope="col" className={cn(tableHeadClass, 'w-36 text-center')}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <CategoryProductTableRow
                key={product.id}
                product={product}
                catalogEntry={catalogMap?.get(product.id)}
                visiblePriceRoles={visiblePriceRoles}
                discountPriceRole={discountPriceRole}
                isAdmin={isAdmin}
                striped={index % 2 === 1}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

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
  visiblePriceRoles,
  discountPriceRole,
  isAdmin,
  striped,
  onEdit,
  onDelete,
}: {
  product: Product;
  catalogEntry: AdminCatalogInventoryEntry | undefined;
  visiblePriceRoles: readonly PriceRole[];
  discountPriceRole: PriceRole;
  isAdmin: boolean;
  striped: boolean;
  onEdit: (inventory: InventoryProduct, focusSection?: InventoryProductFormFocusSection) => void;
  onDelete: (inventory: InventoryProduct) => void;
}) {
  const stockQty = catalogEntry?.product.stock ?? product.stock;
  const displayProduct: Product =
    catalogEntry != null ? { ...product, stock: catalogEntry.product.stock } : product;
  const detailHref = productPath(product.id);
  const imageProduct = catalogEntry?.product ?? product;
  const rolePrices = resolveTableRolePrices(product, catalogEntry);
  const canManage = isAdmin && catalogEntry != null;
  const displayPriceUsd = product.price;

  return (
    <TableRow
      className={cn(
        'group/row border-b border-border/70 transition-colors hover:bg-muted/30',
        striped && 'bg-muted/20',
      )}
    >
      <TableCell
        className={cn(
          tableCellClass,
          'hidden md:table-cell',
          isAdmin ? 'min-w-[8.75rem]' : 'max-w-[7.5rem]',
        )}
      >
        <CategoryTableCategoryCell
          category={product.category}
          canManage={canManage}
          onEditCategory={() => {
            if (!catalogEntry) return;
            onEdit(catalogEntry.product, 'category');
          }}
        />
      </TableCell>
      <TableCell className={tableCellClass}>
        <div className="flex min-w-0 items-center gap-2.5">
          <ProductTableThumbnail
            product={imageProduct}
            detailHref={detailHref}
            allowDataUrl={canManage}
          />
          <Link
            to={detailHref}
            className="min-w-0 flex-1 rounded no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
            title={getProductCardTitleContent(product).title}
          >
            <ProductCardTitle product={product} variant="table" />
          </Link>
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
          <ProductTableSpecCell product={product} columnId={column.id} />
        </TableCell>
      ))}
      <TableCell className={cn(tableCellClass, 'text-center')}>
        <InventoryStockStatusBar stock={stockQty} compact />
      </TableCell>
      <TableCell className={cn(tableCellClass, 'text-center')}>
        <CategoryTableDiscountBadge
          productId={product.id}
          priceUsd={rolePrices[discountPriceRole]}
        />
      </TableCell>
      {isAdmin ? (
        <TableCell className={rolePriceCellClass}>
          <CategoryTablePurchaseCell
            purchasePriceUsd={catalogEntry?.purchasePriceUsd ?? 0}
          />
        </TableCell>
      ) : null}
      {visiblePriceRoles.map((priceRole) => (
        <TableCell key={priceRole} className={rolePriceCellClass}>
          <CategoryTableRolePricing priceUsd={rolePrices[priceRole]} />
        </TableCell>
      ))}
      <TableCell className={tableCellClass}>
        <div className="flex items-center justify-center gap-1.5">
          <AddToCartButton
            product={displayProduct}
            size="sm"
            className="h-8 min-w-[5rem] gap-1 rounded-md bg-red-600 px-2 text-[0.65rem] font-semibold hover:bg-red-500"
          >
            <ShoppingCart className="size-3 shrink-0" aria-hidden="true" />
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
