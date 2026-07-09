import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/components/admin/categories/category-form-dialog';
import { AdminListasPreciosCategoryCell } from '@/components/admin/inventario/admin-listas-precios-category-cell';
import { AdminListasPreciosPriceCell } from '@/components/admin/inventario/admin-listas-precios-price-cell';
import { AdminListasPreciosStatusBadge } from '@/components/admin/inventario/admin-listas-precios-status-badge';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesMutations,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import {
  getListaPreciosParentCategories,
  mapProductToListaPreciosRecord,
  ROLE_HEADER_META,
  ROLE_LABELS,
} from '@/lib/admin-listas-precios-utils';
import { formatProductCodeCardDisplay } from '@/lib/format-product-code-display';
import { listRootCategories } from '@/lib/inventory-product-category';
import {
  prepareInventoryPayloadForApi,
  readImageFile,
  setProductMainMediaUrl,
} from '@/lib/inventory-product';
import { sanitizeStoredProductMedia } from '@/lib/product-media-sanitize';
import { cn } from '@/lib/utils';
import type { AdminListaPreciosRoleKey } from '@/types/admin-listas-precios';
import type { InventoryProduct } from '@/types/product';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const PRICE_ROLES: AdminListaPreciosRoleKey[] = [
  'public',
  'distribuidor',
  'mayorista',
  'compra',
];

const ROLE_HEADER_ICONS = {
  public: User,
  distribuidor: Building2,
  mayorista: Building2,
  compra: ShoppingCart,
} as const;

function buildPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const items: Array<number | 'ellipsis'> = [1];
  if (current > 3) items.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) items.push(page);

  if (current < total - 2) items.push('ellipsis');
  items.push(total);
  return items;
}

function PriceColumnHeader({ role }: { role: AdminListaPreciosRoleKey }) {
  const meta = ROLE_HEADER_META[role];
  const Icon = ROLE_HEADER_ICONS[role];

  return (
    <div className={cn('flex min-w-[5.5rem] items-center justify-end gap-1', meta.tone)}>
      <Icon className="size-3" aria-hidden="true" />
      <span>{ROLE_LABELS[role]}</span>
    </div>
  );
}

const TABLE_COLUMN_COUNT = 10;

function labelsFromCategoryForm(values: CategoryFormValues): string[] {
  const parsed = values.inventoryLabels
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
  if (parsed.length > 0) return parsed;
  return values.name.trim() ? [values.name.trim()] : [];
}

function EditableProductThumb({
  product,
  name,
  isUploading,
  onUpload,
}: {
  product: InventoryProduct;
  name: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sanitized = sanitizeStoredProductMedia({
    id: product.id,
    code: product.code ?? null,
    image_url: product.image_url,
    gallery: product.gallery ?? null,
  });
  const imageUrl = sanitized.image_url;

  const openPicker = () => {
    if (!isUploading) inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await onUpload(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void handleChange(event)}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={isUploading}
        className={cn(
          'relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted/30 transition-colors',
          'hover:border-[hsl(var(--admin-accent))]/50 hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2',
          isUploading && 'cursor-wait opacity-70',
        )}
        aria-label={`Cambiar foto de ${name}`}
        title="Clic para cambiar la foto del producto"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <ProductNoImagePlaceholder size="sm" className="w-full max-w-none" />
        )}
        {!isUploading && imageUrl ? (
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45 py-px text-[0.5rem] font-medium text-white"
            aria-hidden="true"
          >
            Editar
          </span>
        ) : null}
      </button>
    </>
  );
}

interface AdminInventarioTablePanelProps {
  products: InventoryProduct[];
  saleExchangeRate: number;
  purchaseExchangeRate: number;
  onPatchProduct: (productId: string, patch: Partial<InventoryProduct>) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export function AdminInventarioTablePanel({
  products,
  saleExchangeRate,
  purchaseExchangeRate,
  onPatchProduct,
  isLoading = false,
  isSaving = false,
}: AdminInventarioTablePanelProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ambas');
  const [channelFilter, setChannelFilter] = useState<string>('todos');
  const [validityFilter, setValidityFilter] = useState<string>('vigente');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();
  const { createCategory } = useStoreCategoriesMutations();

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const records = useMemo(
    () => products.map(mapProductToListaPreciosRecord),
    [products],
  );

  const categories = useMemo(() => {
    const fromProducts = getListaPreciosParentCategories(products);
    const fromTree = listRootCategories(categoryTree).map((node) => node.name);
    return [...new Set([...fromTree, ...fromProducts])].sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }, [categoryTree, products]);

  const filteredRecords = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return records.filter((record) => {
      if (roleFilter !== 'todos') {
        const role = roleFilter as AdminListaPreciosRoleKey;
        if (record.prices[role] <= 0) return false;
      }

      if (validityFilter === 'vigente' && record.status === 'inactiva') return false;
      if (validityFilter === 'borrador' && record.status !== 'borrador') return false;

      if (currencyFilter === 'pen' && record.prices.public <= 0) return false;
      if (currencyFilter === 'usd' && record.prices.compra <= 0) return false;

      if (channelFilter !== 'todos' && record.parentCategory !== channelFilter) return false;

      if (!normalized) return true;
      return (
        record.name.toLowerCase().includes(normalized) ||
        record.sku.toLowerCase().includes(normalized)
      );
    });
  }, [channelFilter, currencyFilter, records, roleFilter, search, validityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredRecords.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const closeEditor = useCallback(() => setActiveFieldId(null), []);

  const patchProduct = useCallback(
    async (productId: string, patch: Partial<InventoryProduct>) => {
      await onPatchProduct(productId, patch);
    },
    [onPatchProduct],
  );

  const uploadProductImage = useCallback(
    async (product: InventoryProduct, file: File) => {
      setUploadingProductId(product.id);
      try {
        const url = await readImageFile(file);
        const media = setProductMainMediaUrl(product, url);
        const payload = await prepareInventoryPayloadForApi({ ...product, ...media });
        await patchProduct(product.id, {
          image_url: payload.image_url,
          gallery: payload.gallery,
        });
        toast.success('Imagen del producto actualizada');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar la imagen del producto',
        );
      } finally {
        setUploadingProductId(null);
      }
    },
    [patchProduct],
  );

  const handleCreateCategory = useCallback(
    async (values: CategoryFormValues) => {
      await createCategory.mutateAsync({
        name: values.name.trim(),
        tagline: values.tagline.trim() || null,
        image: values.image.trim() || null,
        parentId: values.parentId,
        inventoryLabels: labelsFromCategoryForm(values),
        ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
      });
      toast.success(`Categoría "${values.name.trim()}" creada`);
    },
    [createCategory],
  );

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('todos');
    setCurrencyFilter('ambas');
    setChannelFilter('todos');
    setValidityFilter('vigente');
    setPage(1);
  };

  return (
    <section
      className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
      aria-busy={isSaving}
    >
      <div className="border-b px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-foreground">Lista de Precios</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Haz clic en un precio para editarlo en línea (USD y soles)
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por producto, código o SKU..."
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar productos"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9rem]" aria-label="Filtrar por rol">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Rol: Todos</SelectItem>
            {PRICE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currencyFilter}
          onValueChange={(value) => {
            setCurrencyFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9rem]" aria-label="Filtrar por moneda">
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ambas">Moneda: Ambas</SelectItem>
            <SelectItem value="pen">PEN</SelectItem>
            <SelectItem value="usd">USD</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={channelFilter}
          onValueChange={(value) => {
            setChannelFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Canal o segmento">
            <SelectValue placeholder="Canal / Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Canal: Todos</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={validityFilter}
          onValueChange={(value) => {
            setValidityFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9rem]" aria-label="Vigencia">
            <SelectValue placeholder="Vigencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vigente">Vigente</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="todas">Todas</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1 bg-background text-xs"
          onClick={() => setCategoryDialogOpen(true)}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Nueva categoría
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8 bg-background text-xs"
          onClick={clearFilters}
        >
          Limpiar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              Exportar
              <ChevronDown className="size-3.5 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Excel (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 min-w-[5.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Código
              </TableHead>
              <TableHead className="h-8 min-w-[7rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Categoría padre
              </TableHead>
              <TableHead className="h-8 min-w-[9rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre
              </TableHead>
              <TableHead className="h-8 min-w-[4.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Producto
              </TableHead>
              {PRICE_ROLES.map((role) => (
                <TableHead
                  key={role}
                  className="h-8 min-w-[6.5rem] text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <PriceColumnHeader role={role} />
                </TableHead>
              ))}
              <TableHead className="h-8 min-w-[5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="h-8 w-10 px-3" aria-label="Acciones" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMN_COUNT} className="py-10 text-center text-sm text-muted-foreground">
                  Cargando listas de precios…
                </TableCell>
              </TableRow>
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMN_COUNT} className="py-10 text-center text-sm text-muted-foreground">
                  No hay productos que coincidan con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => {
                const product = productsById.get(record.id);
                if (!product) return null;

                return (
                  <TableRow key={record.id}>
                    <TableCell className="py-2">
                      <span
                        className="block max-w-[7rem] truncate font-mono text-[0.625rem] text-muted-foreground"
                        title={record.sku}
                      >
                        {formatProductCodeCardDisplay(record.sku)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <AdminListasPreciosCategoryCell
                        product={product}
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">{record.name}</p>
                        {record.subtitle ? (
                          <p className="truncate text-[0.625rem] text-muted-foreground">
                            {record.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <EditableProductThumb
                        product={product}
                        name={record.name}
                        isUploading={uploadingProductId === product.id}
                        onUpload={(file) => uploadProductImage(product, file)}
                      />
                    </TableCell>
                    {PRICE_ROLES.map((role) => (
                      <TableCell key={role} className="py-2">
                        <AdminListasPreciosPriceCell
                          product={product}
                          role={role}
                          activeFieldId={activeFieldId}
                          onActivate={setActiveFieldId}
                          onClose={closeEditor}
                          saleExchangeRate={saleExchangeRate}
                          purchaseExchangeRate={purchaseExchangeRate}
                          onPatch={(patch) => patchProduct(product.id, patch)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="py-2">
                      <AdminListasPreciosStatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Acciones para ${record.name}`}
                      >
                        <MoreVertical className="size-3.5" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Paginación de listas de precios"
        className="flex flex-col gap-2 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-xs text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredRecords.length}</span> productos
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>

            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === safePage ? 'default' : 'outline'}
                  size="icon"
                  className={cn(
                    'size-8 tabular-nums',
                    item === safePage &&
                      'bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]',
                  )}
                  onClick={() => setPage(item)}
                  aria-label={`Página ${item}`}
                  aria-current={item === safePage ? 'page' : undefined}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs" aria-label="Registros por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </nav>

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        title="Nueva categoría"
        description="La categoría quedará disponible para asignarla a productos en esta tabla."
        parentId={null}
        isSaving={createCategory.isPending}
        onSubmit={handleCreateCategory}
      />
    </section>
  );
}
