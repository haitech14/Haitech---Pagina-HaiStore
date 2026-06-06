import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers,
  PackagePlus,
  Paperclip,
  Pencil,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';

import { InventoryAttachmentsDialog } from '@/components/admin/inventory/inventory-attachments-dialog';
import { InventoryBulkEditDialog } from '@/components/admin/inventory/inventory-bulk-edit-dialog';
import { InventoryDraggableHeader } from '@/components/admin/inventory/inventory-draggable-header';
import { InventoryOrderCell } from '@/components/admin/inventory/inventory-order-cell';
import {
  ALL_INVENTORY_CATEGORIES,
  InventoryCategoryFilterSelect,
} from '@/components/admin/inventory/inventory-category-filter-select';
import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { InventoryRowCells } from '@/components/admin/inventory/inventory-row-cells';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryColumnOrder } from '@/hooks/use-inventory-column-order';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import { useWarehouses } from '@/hooks/use-warehouses';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import {
  getInventoryColumnCellClass,
  INVENTORY_ACTIONS_COLUMN_CLASS,
  isInventoryPriceColumn,
} from '@/lib/inventory-table-columns';
import { buildAttributeNameCatalog } from '@/lib/inventory-attributes';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import { productMatchesCategoryFilterTree } from '@/lib/inventory-categories';
import { sortProductsByPublicPriceAsc } from '@/lib/inventory-product-order';
import { cn } from '@/lib/utils';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct } from '@/types/product';

const PAGE_SIZE = 20;

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

export function InventoryPanel() {
  const { data: products, isLoading, isError, error, refetch, isFetching } = useAdminInventory();
  const { data: warehouses = DEFAULT_WAREHOUSES } = useWarehouses();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { columnOrder, reorder } = useInventoryColumnOrder();
  const {
    deleteProduct,
    updateProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
    bulkDuplicateProducts,
    syncCatalog,
  } = useInventoryMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryProduct | null>(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(ALL_INVENTORY_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [attachmentsProduct, setAttachmentsProduct] = useState<InventoryProduct | null>(null);
  const patchProduct = useCallback(
    async (product: InventoryProduct, patch: Partial<InventoryProduct>) => {
      await updateProduct.mutateAsync({ id: product.id, payload: patch });
    },
    [updateProduct],
  );

  const productCategoryLabels = useMemo(
    () => (products ?? []).map((p) => p.category ?? '').filter(Boolean),
    [products],
  );

  const categoryOptions = useMemo(
    () => buildCategorySelectOptions(categoryTree, productCategoryLabels).map((o) => o.value),
    [categoryTree, productCategoryLabels],
  );

  const attributeNameOptions = useMemo(
    () => buildAttributeNameCatalog(products ?? []),
    [products],
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return sortProductsByPublicPriceAsc(
      products.filter((product) => {
        if (!productMatchesCategoryFilterTree(product, categoryFilter, categoryTree)) {
          return false;
        }
        if (normalizedSearch && !productMatchesSearch(product, normalizedSearch)) return false;
        return true;
      }),
    );
  }, [products, categoryFilter, normalizedSearch, categoryTree]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, normalizedSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const selectedCount = selectedIds.size;
  const pageIds = pageProducts.map((product) => product.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const toggleSelectAllPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleBatchMode = () => {
    setBatchMode((prev) => {
      if (prev) clearSelection();
      return !prev;
    });
  };

  const getSelectedIds = () => [...selectedIds];

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: InventoryProduct) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: InventoryProduct) => {
    if (!window.confirm(`¿Eliminar "${product.name}" del inventario?`)) return;
    await deleteProduct.mutateAsync(product.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
  };

  const handleDuplicate = async (product: InventoryProduct) => {
    setRowBusyId(product.id);
    try {
      await bulkDuplicateProducts.mutateAsync([product.id]);
      toast.success(`Copia creada de «${product.name}»`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo duplicar el producto';
      toast.error(message);
    } finally {
      setRowBusyId(null);
    }
  };

  const handleBulkDelete = async () => {
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
      clearSelection();
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDuplicate = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const result = await bulkDuplicateProducts.mutateAsync(ids);
      clearSelection();
      toast.success(
        `${result.created} copia${result.created === 1 ? '' : 's'} creada${result.created === 1 ? '' : 's'}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron duplicar los productos';
      toast.error(message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleSyncFromStore = async () => {
    if (
      !window.confirm(
        '¿Sincronizar inventario con el catálogo maestro? Solo se actualizan productos que ya existen (precios e imágenes). No se volverán a importar productos que eliminaste.',
      )
    ) {
      return;
    }
    setBulkBusy(true);
    try {
      await syncCatalog.mutateAsync(false);
      clearSelection();
      setPage(1);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkApply = async (patch: InventoryBulkPatch) => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkUpdateProducts.mutateAsync({ ids, patch });
      clearSelection();
    } finally {
      setBulkBusy(false);
    }
  };

  const colCount = columnOrder.length + 2 + (batchMode ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
        <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 lg:w-auto lg:shrink-0">
            <Label htmlFor="inv-category-filter" className="shrink-0 text-sm font-medium">
              Categoría
            </Label>
            <InventoryCategoryFilterSelect
              id="inv-category-filter"
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              categoryTree={categoryTree}
              productCategoryLabels={productCategoryLabels}
              className="h-10 min-w-[10rem] bg-background sm:min-w-[12rem]"
            />
          </div>

          <div className="relative min-w-0 flex-1">
            <Label htmlFor="inv-search" className="sr-only">
              Buscador
            </Label>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="inv-search"
              type="search"
              placeholder="Buscador: código, nombre, marca…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 bg-background pl-9"
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:ml-0">
            <Button
              type="button"
              variant={batchMode ? 'default' : 'outline'}
              onClick={toggleBatchMode}
              className={cn(
                'h-10 gap-1.5',
                batchMode && 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-600',
              )}
              aria-pressed={batchMode}
            >
              <Layers className="size-4" aria-hidden="true" />
              Lotes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSyncFromStore()}
              disabled={bulkBusy || syncCatalog.isPending}
              className="h-10 gap-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span className="hidden xl:inline">Sincronizar con tienda</span>
              <span className="xl:hidden">Sincronizar</span>
            </Button>
            <Button onClick={openCreate} className="h-10 bg-red-600 hover:bg-red-500">
              <PackagePlus aria-hidden="true" />
              Nuevo producto
            </Button>
          </div>
        </div>
      </div>

      {batchMode && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
          role="region"
          aria-label="Acciones por lotes"
        >
          {selectedCount > 0 ? (
            <Badge variant="secondary" className="h-9 px-3 text-sm">
              {selectedCount} seleccionado{selectedCount === 1 ? '' : 's'}
            </Badge>
          ) : (
            <p className="text-sm text-muted-foreground">
              Marca los productos en la tabla para aplicar una acción.
            </p>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedCount === 0 || bulkBusy}
              onClick={() => setBulkDialogOpen(true)}
              className="gap-1.5"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Modificar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedCount === 0 || bulkBusy}
              onClick={() => void handleBulkDuplicate()}
              className="gap-1.5"
            >
              <Copy className="size-4" aria-hidden="true" />
              Duplicar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedCount === 0 || bulkBusy}
              onClick={() => void handleBulkDelete()}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Eliminar
            </Button>
            {selectedCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={bulkBusy}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Administra stock y precios por rol. Usa Lotes para acciones masivas. Los productos se
        muestran por precio público de menor a mayor; la columna Orden indica la posición. Los
        encabezados se pueden reordenar (se guarda en este navegador).
      </p>

      {isError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">
            {error instanceof Error ? error.message : 'No se pudo cargar el inventario.'}
          </p>
          <p className="mt-1 text-destructive/90">
            {import.meta.env.DEV
              ? 'Si acabas de guardar cambios en el código, el servidor se reinicia y debes volver a iniciar sesión. Usa «npm run dev:all» para tener API y web juntos.'
              : 'Comprueba que tu cuenta tenga rol de administrador e intenta cerrar sesión y entrar de nuevo.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Reintentando…' : 'Reintentar'}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[1180px] table-fixed text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th
                scope="col"
                className="w-12 min-w-12 px-1 py-2.5 text-center align-middle font-medium"
              >
                Orden
              </th>
              {batchMode ? (
                <th className="w-10 px-2 py-2.5 align-middle">
                  <Checkbox
                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => toggleSelectAllPage(checked === true)}
                    aria-label="Seleccionar todos en esta página"
                  />
                </th>
              ) : null}
              {columnOrder.map((columnId) => (
                <InventoryDraggableHeader
                  key={columnId}
                  columnId={columnId}
                  onReorder={reorder}
                />
              ))}
              <th
                scope="col"
                className={cn(
                  INVENTORY_ACTIONS_COLUMN_CLASS,
                  'px-2 py-2.5 text-center align-middle font-medium',
                )}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td colSpan={colCount} className="px-4 py-4">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}

            {!isLoading && pageProducts.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-muted-foreground">
                  {normalizedSearch
                    ? 'No hay productos que coincidan con la búsqueda.'
                    : categoryFilter === ALL_INVENTORY_CATEGORIES
                      ? 'No hay productos en el inventario.'
                      : 'No hay productos en esta categoría.'}
                </td>
              </tr>
            )}

            {!isLoading &&
              pageProducts.map((product, rowIndex) => {
                const isSelected = selectedIds.has(product.id);
                const displayPosition = (page - 1) * PAGE_SIZE + rowIndex + 1;
                return (
                  <tr
                    key={product.id}
                    className={cn(
                      'border-b last:border-b-0',
                      batchMode && isSelected && 'bg-red-50/50 dark:bg-red-950/20',
                    )}
                  >
                    <td className="px-1 py-2.5 text-center align-middle">
                      <InventoryOrderCell displayPosition={displayPosition} />
                    </td>
                    {batchMode ? (
                      <td className="px-2 py-2.5 align-middle">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(product.id, checked === true)}
                          aria-label={`Seleccionar ${product.name}`}
                        />
                      </td>
                    ) : null}
                    {columnOrder.map((columnId) => (
                      <td
                        key={columnId}
                        className={cn(
                          'px-2 py-2.5 align-middle',
                          getInventoryColumnCellClass(columnId),
                          isInventoryPriceColumn(columnId) && 'overflow-visible text-right',
                          columnId === 'stock' && 'text-center',
                        )}
                      >
                        <InventoryRowCells
                          product={product}
                          columnId={columnId}
                          categoryTree={categoryTree}
                          warehouses={warehouses}
                          onPatch={(patch) => patchProduct(product, patch)}
                        />
                      </td>
                    ))}
                    <td
                      className={cn(
                        INVENTORY_ACTIONS_COLUMN_CLASS,
                        'px-2 py-2.5 align-middle',
                        isSelected && 'bg-red-50/50 dark:bg-red-950/20',
                      )}
                    >
                      <div className="flex flex-nowrap items-center justify-center gap-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={`Editar ${product.name}`}
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={`Duplicar ${product.name}`}
                          disabled={rowBusyId === product.id || bulkBusy}
                          onClick={() => void handleDuplicate(product)}
                        >
                          <Copy className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={`Adjuntar archivos a ${product.name}${
                            (product.attachments?.length ?? 0) > 0
                              ? ` (${product.attachments?.length} adjuntos)`
                              : ''
                          }`}
                          onClick={() => setAttachmentsProduct(product)}
                        >
                          <Paperclip className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={`Eliminar ${product.name}`}
                          onClick={() => void handleDelete(product)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredProducts.length > 0 && (
        <nav
          className="flex flex-wrap items-center justify-between gap-3"
          aria-label="Paginación del inventario"
        >
          <p className="text-sm text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredProducts.length)} de{' '}
            {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'}
            {(categoryFilter !== ALL_INVENTORY_CATEGORIES || normalizedSearch) && products
              ? ` (filtrado de ${products.length})`
              : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Anterior
            </Button>
            <span className="min-w-[4.5rem] text-center text-sm tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}

      <InventoryProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        initial={editing}
      />

      <InventoryBulkEditDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        selectedCount={selectedCount}
        categoryOptions={categoryOptions}
        attributeNameOptions={attributeNameOptions}
        onApply={handleBulkApply}
        isSaving={bulkBusy || bulkUpdateProducts.isPending}
      />

      <InventoryAttachmentsDialog
        open={attachmentsProduct != null}
        onOpenChange={(open) => {
          if (!open) setAttachmentsProduct(null);
        }}
        product={attachmentsProduct}
      />
    </div>
  );
}
