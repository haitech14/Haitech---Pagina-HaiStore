import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ListFilter,
  Layers,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { InventoryBulkEditDialog } from '@/components/admin/inventory/inventory-bulk-edit-dialog';
import { AdminInventoryProductThumbHoverPreview } from '@/components/admin/inventario/admin-inventory-product-thumb-hover-preview';
import { AdminInventoryProductThumbImage } from '@/components/admin/inventario/admin-inventory-product-thumb-image';
import { AdminInventarioCategoryTreePopover } from '@/components/admin/inventario/admin-inventario-category-tree-popover';
import { InventoryAttributesCell } from '@/components/admin/inventory/inventory-attributes-cell';
import { AdminListasPreciosCategoryCell } from '@/components/admin/inventario/admin-listas-precios-category-cell';
import { AdminListasPreciosMerchandisingCell } from '@/components/admin/inventario/admin-listas-precios-merchandising-cell';
import { AdminListasPreciosNameCell } from '@/components/admin/inventario/admin-listas-precios-name-cell';
import { AdminListasPreciosPriceCell } from '@/components/admin/inventario/admin-listas-precios-price-cell';
import { AdminListasPreciosStatusBadge } from '@/components/admin/inventario/admin-listas-precios-status-badge';
import { AdminListasPreciosStockCell } from '@/components/admin/inventario/admin-listas-precios-stock-cell';
import { HeaderCurrencyControl } from '@/components/layout/header-currency-control';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useInventoryMutations } from '@/hooks/use-products';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useWarehouses } from '@/hooks/use-warehouses';
import {
  getListaPreciosParentCategories,
  mapProductToListaPreciosRecord,
  ROLE_HEADER_META,
  ROLE_LABELS,
} from '@/lib/admin-listas-precios-utils';
import { formatProductCodeCardDisplay } from '@/lib/format-product-code-display';
import { buildAttributeNameCatalog, normalizeAttributes } from '@/lib/inventory-attributes';
import { productMatchesCategoryFilterTree } from '@/lib/inventory-categories';
import { compareInventoryTableDivisionLabels } from '@/lib/inventory-equipment-sections';
import { listRootCategories } from '@/lib/inventory-product-category';
import { hasAdminInventoryProductImage } from '@/lib/admin-inventory-product-image';
import {
  getImageFilesFromClipboard,
  prepareInventoryPayloadForApi,
  readImageFile,
  setProductMainMediaUrl,
} from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { cn } from '@/lib/utils';
import type { AdminListaPreciosRoleKey } from '@/types/admin-listas-precios';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, ProductAttribute } from '@/types/product';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
/** Orden: Compra → Mayorista → Distribuidor → Público */
const PRICE_ROLES: AdminListaPreciosRoleKey[] = [
  'compra',
  'mayorista',
  'distribuidor',
  'public',
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

function PriceColumnHeader({
  role,
  active,
  direction,
  onSort,
}: {
  role: AdminListaPreciosRoleKey;
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: (role: AdminListaPreciosRoleKey) => void;
}) {
  const meta = ROLE_HEADER_META[role];
  const Icon = ROLE_HEADER_ICONS[role];
  const SortIcon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(role)}
      className={cn(
        'flex min-w-[5.5rem] items-center justify-end gap-1 rounded-sm transition-colors',
        'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        meta.tone,
        active && 'text-foreground',
      )}
      aria-label={`Ordenar por ${ROLE_LABELS[role]} ${
        active && direction === 'asc' ? 'descendente' : 'ascendente'
      }`}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span>{ROLE_LABELS[role]}</span>
      <SortIcon className={cn('size-3', active ? 'opacity-100' : 'opacity-40')} aria-hidden="true" />
    </button>
  );
}

const BASE_TABLE_COLUMN_COUNT = 15;

function VariantsCountCell() {
  // Variantes aún no viven en el modelo de inventario.
  return <span className="text-[0.6875rem] text-muted-foreground">—</span>;
}

function EditableProductThumb({
  product,
  name,
  isUploading,
  optimisticPreviewSrc = null,
  isRowSelected = false,
  onUpload,
}: {
  product: InventoryProduct;
  name: string;
  isUploading: boolean;
  optimisticPreviewSrc?: string | null;
  isRowSelected?: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasImage = hasAdminInventoryProductImage(product, optimisticPreviewSrc);
  const isDocumentPasteActive =
    !isUploading && !isFocused && (isHovered || isRowSelected);
  const showPasteHint = !isUploading && (isFocused || isHovered || isRowSelected);
  const showHoverPreview = hasImage && isHovered && !isUploading;

  const openPicker = () => {
    if (!isUploading) inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await onUpload(file);
  };

  const handlePaste = useCallback(
    (event: ClipboardEvent | globalThis.ClipboardEvent) => {
      if (isUploading) return;
      const files = getImageFilesFromClipboard(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      void onUpload(files[0]);
    },
    [isUploading, onUpload],
  );

  useEffect(() => {
    if (!isDocumentPasteActive) return;
    const onPaste = (event: globalThis.ClipboardEvent) => handlePaste(event);
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handlePaste, isDocumentPasteActive]);

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
        ref={thumbRef}
        type="button"
        tabIndex={0}
        onClick={openPicker}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isUploading}
        className={cn(
          'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted/30 transition-colors',
          'hover:border-[hsl(var(--admin-accent))]/50 hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2',
          showPasteHint &&
            'border-[hsl(var(--admin-accent))]/60 ring-1 ring-[hsl(var(--admin-accent))]/30',
          isUploading && 'cursor-wait opacity-70',
        )}
        aria-label={`Cambiar foto de ${name}. Clic o Ctrl+V para pegar imagen.`}
        title="Clic para elegir archivo · Ctrl+V para pegar desde portapapeles"
      >
        {hasImage ? (
          <AdminInventoryProductThumbImage
            product={product}
            optimisticSrc={optimisticPreviewSrc}
            className="size-full"
            loading="eager"
          />
        ) : (
          <ProductNoImagePlaceholder size="md" className="w-full max-w-none" />
        )}
        {isUploading ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/55">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </span>
        ) : null}
        {showPasteHint ? (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-[0.625rem] font-semibold leading-none text-white"
            aria-hidden="true"
          >
            Ctrl+V
          </span>
        ) : null}
      </button>
      <AdminInventoryProductThumbHoverPreview
        open={showHoverPreview}
        anchorEl={thumbRef.current}
        product={product}
        optimisticSrc={optimisticPreviewSrc}
        productName={name}
      />
    </>
  );
}

interface AdminInventarioTablePanelProps {
  products: InventoryProduct[];
  saleExchangeRate: number;
  purchaseExchangeRate: number;
  onPatchProduct: (productId: string, patch: Partial<InventoryProduct>) => Promise<void>;
  onNewProduct?: () => void;
  onEditProduct?: (product: InventoryProduct) => void;
  isLoading?: boolean;
  isSaving?: boolean;
}

export function AdminInventarioTablePanel({
  products,
  saleExchangeRate,
  purchaseExchangeRate,
  onPatchProduct,
  onNewProduct,
  onEditProduct,
  isLoading = false,
  isSaving = false,
}: AdminInventarioTablePanelProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ambas');
  const [channelFilter, setChannelFilter] = useState<string>('todos');
  const [validityFilter, setValidityFilter] = useState<string>('todas');
  const [sortRole, setSortRole] = useState<AdminListaPreciosRoleKey>('public');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [optimisticPreviewByProductId, setOptimisticPreviewByProductId] = useState<
    Record<string, string>
  >({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();
  const { data: warehouses = DEFAULT_WAREHOUSES } = useWarehouses();
  const { deleteProduct, bulkDeleteProducts, bulkDuplicateProducts, bulkUpdateProducts } =
    useInventoryMutations();

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
    const hasCategory = channelFilter !== 'todos';
    const hasSearch = normalized.length > 0;

    return records.filter((record) => {
      if (roleFilter !== 'todos') {
        const role = roleFilter as AdminListaPreciosRoleKey;
        if (record.prices[role] <= 0) return false;
      }

      if (validityFilter === 'vigente' && record.status === 'inactiva') return false;
      if (validityFilter === 'activa' && record.status !== 'activa') return false;
      if (validityFilter === 'borrador' && record.status !== 'borrador') return false;
      if (validityFilter === 'inactiva' && record.status !== 'inactiva') return false;

      if (currencyFilter === 'pen' && record.prices.public <= 0) return false;
      if (currencyFilter === 'usd' && record.prices.compra <= 0) return false;

      if (hasCategory) {
        const product = productsById.get(record.id);
        if (
          !productMatchesCategoryFilterTree(
            { category: product?.category ?? record.parentCategory },
            channelFilter,
            categoryTree,
          )
        ) {
          return false;
        }
      }

      if (!hasSearch) return true;
      return (
        record.name.toLowerCase().includes(normalized) ||
        record.sku.toLowerCase().includes(normalized)
      );
    });
  }, [
    categoryTree,
    channelFilter,
    currencyFilter,
    productsById,
    records,
    roleFilter,
    search,
    validityFilter,
  ]);

  const sortedRecords = useMemo(() => {
    const direction = sortDir === 'asc' ? 1 : -1;
    return [...filteredRecords].sort((a, b) => {
      const divisionDiff = compareInventoryTableDivisionLabels(
        a.divisionLabel,
        b.divisionLabel,
      );
      if (divisionDiff !== 0) return divisionDiff;
      const diff =
        (Number(a.prices[sortRole]) || 0) - (Number(b.prices[sortRole]) || 0);
      if (diff !== 0) return diff * direction;
      return a.name.localeCompare(b.name, 'es');
    });
  }, [filteredRecords, sortDir, sortRole]);

  const divisionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of sortedRecords) {
      counts.set(record.divisionLabel, (counts.get(record.divisionLabel) ?? 0) + 1);
    }
    return counts;
  }, [sortedRecords]);

  const handleSortRole = useCallback(
    (role: AdminListaPreciosRoleKey) => {
      setPage(1);
      if (sortRole === role) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setSortRole(role);
      setSortDir('asc');
    },
    [sortRole],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = sortedRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = sortedRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, sortedRecords.length);
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
      const optimisticPreviewSrc = URL.createObjectURL(file);
      setOptimisticPreviewByProductId((current) => ({
        ...current,
        [product.id]: optimisticPreviewSrc,
      }));
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
        setOptimisticPreviewByProductId((current) => {
          if (!(product.id in current)) return current;
          const next = { ...current };
          delete next[product.id];
          return next;
        });
        URL.revokeObjectURL(optimisticPreviewSrc);
      }
    },
    [patchProduct],
  );

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('todos');
    setCurrencyFilter('ambas');
    setValidityFilter('todas');
    setPage(1);
  };

  const tableColumnCount = BASE_TABLE_COLUMN_COUNT + (batchMode ? 1 : 0);
  const selectedCount = selectedIds.size;
  const soleSelectedProductId = useMemo(
    () => (selectedCount === 1 ? [...selectedIds][0] : null),
    [selectedCount, selectedIds],
  );
  const pageIds = paginatedRecords.map((record) => record.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const clearSelection = () => setSelectedIds(new Set());

  const toggleBatchMode = () => {
    setBatchMode((prev) => {
      if (prev) clearSelection();
      return !prev;
    });
  };

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

  const getSelectedIds = () => [...selectedIds];

  const handleDeleteProduct = async (product: InventoryProduct) => {
    if (!window.confirm(`¿Eliminar «${product.name}» del inventario?`)) return;
    setRowBusyId(product.id);
    try {
      await deleteProduct.mutateAsync(product.id);
      setSelectedIds((prev) => {
        if (!prev.has(product.id)) return prev;
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      toast.success(`«${product.name}» eliminado`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo eliminar el producto',
      );
    } finally {
      setRowBusyId(null);
    }
  };

  const handleDuplicateProduct = async (product: InventoryProduct) => {
    setRowBusyId(product.id);
    try {
      await bulkDuplicateProducts.mutateAsync([product.id]);
      toast.success(`Copia creada de «${product.name}»`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo duplicar el producto',
      );
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudieron duplicar los productos',
      );
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

  const attributeNameOptions = useMemo(
    () => buildAttributeNameCatalog(products),
    [products],
  );

  const hasHiddenFilters =
    roleFilter !== 'todos' || currencyFilter !== 'ambas' || validityFilter !== 'todas';

  return (
    <section
      className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
      aria-busy={isSaving}
    >
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 p-4">
        <div className="relative min-w-[12rem] flex-1 sm:max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
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

        <AdminInventarioCategoryTreePopover
          value={channelFilter}
          onValueChange={(value) => {
            setChannelFilter(value);
            setPage(1);
          }}
        />

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'relative h-8 w-8 shrink-0 bg-background',
                hasHiddenFilters && 'border-[hsl(var(--admin-accent))] text-[hsl(var(--admin-accent))]',
              )}
              aria-label="Más filtros"
              aria-expanded={filtersOpen}
            >
              <ListFilter className="size-3.5" aria-hidden="true" />
              {hasHiddenFilters ? (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[hsl(var(--admin-accent))]"
                  aria-hidden="true"
                />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[18rem] space-y-3 p-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Rol</p>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-full bg-background text-xs" aria-label="Filtrar por rol">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {PRICE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Moneda</p>
              <Select
                value={currencyFilter}
                onValueChange={(value) => {
                  setCurrencyFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-full bg-background text-xs" aria-label="Filtrar por moneda">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambas">Ambas</SelectItem>
                  <SelectItem value="pen">PEN</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Vigencia</p>
              <Select
                value={validityFilter}
                onValueChange={(value) => {
                  setValidityFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-full bg-background text-xs" aria-label="Vigencia">
                  <SelectValue placeholder="Vigencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="vigente">Vigente (sin inactivas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                className="h-8 flex-1 text-xs"
                onClick={() => {
                  clearFilters();
                  setFiltersOpen(false);
                }}
              >
                Limpiar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    className="h-8 flex-1 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
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
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <HeaderCurrencyControl className="h-8 shrink-0 bg-background px-1.5 py-0 sm:px-2" />

          <Button
            type="button"
            variant={batchMode ? 'default' : 'outline'}
            className={cn(
              'h-8 gap-1 bg-background text-xs',
              batchMode &&
                'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
            )}
            onClick={toggleBatchMode}
            aria-pressed={batchMode}
          >
            <Layers className="size-3.5" aria-hidden="true" />
            Lotes
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1 bg-background text-xs"
            onClick={() => onNewProduct?.()}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {batchMode ? (
        <div
          className="flex flex-wrap items-center gap-2 border-b bg-card px-4 py-2.5"
          role="region"
          aria-label="Acciones por lotes"
        >
          {selectedCount > 0 ? (
            <Badge variant="secondary" className="h-7 px-2.5 text-xs">
              {selectedCount} seleccionado{selectedCount === 1 ? '' : 's'}
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground">
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
              className="h-7 gap-1.5 text-xs"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              Modificar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedCount === 0 || bulkBusy}
              onClick={() => void handleBulkDuplicate()}
              className="h-7 gap-1.5 text-xs"
            >
              <Copy className="size-3.5" aria-hidden="true" />
              Duplicar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedCount === 0 || bulkBusy}
              onClick={() => void handleBulkDelete()}
              className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Eliminar
            </Button>
            {selectedCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={bulkBusy}
                className="h-7 text-xs"
              >
                Limpiar
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {batchMode ? (
                <TableHead className="h-8 w-10 px-3">
                  <Checkbox
                    checked={
                      allPageSelected ? true : somePageSelected ? 'indeterminate' : false
                    }
                    onCheckedChange={(checked) => toggleSelectAllPage(checked === true)}
                    aria-label="Seleccionar todos los productos de la página"
                  />
                </TableHead>
              ) : null}
              <TableHead className="h-8 min-w-[6.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Código
              </TableHead>
              <TableHead className="h-8 min-w-[7rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Categorías
              </TableHead>
              <TableHead className="h-8 min-w-[4.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Producto
              </TableHead>
              <TableHead className="h-8 w-[460px] max-w-[460px] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre
              </TableHead>
              <TableHead className="h-8 min-w-[4.5rem] text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Stock
              </TableHead>
              {PRICE_ROLES.map((role) => (
                <TableHead
                  key={role}
                  className="h-8 min-w-[6.5rem] text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <PriceColumnHeader
                    role={role}
                    active={sortRole === role}
                    direction={sortDir}
                    onSort={handleSortRole}
                  />
                </TableHead>
              ))}
              <TableHead className="h-8 min-w-[6.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Venta Cruzada
              </TableHead>
              <TableHead className="h-8 min-w-[5.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Upsells
              </TableHead>
              <TableHead className="h-8 min-w-[6rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Atributos
              </TableHead>
              <TableHead className="h-8 min-w-[4.5rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Variantes
              </TableHead>
              <TableHead className="h-8 w-auto shrink px-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="h-8 w-10 px-3" aria-label="Acciones" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="py-10 text-center text-sm text-muted-foreground">
                  Cargando listas de precios…
                </TableCell>
              </TableRow>
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="py-10 text-center text-sm text-muted-foreground">
                  No hay productos que coincidan con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record, index) => {
                const product = productsById.get(record.id);
                if (!product) return null;
                const isSelected = selectedIds.has(record.id);
                const prevRecord = index > 0 ? paginatedRecords[index - 1] : null;
                const showDivisionHeader =
                  index === 0 || prevRecord?.divisionLabel !== record.divisionLabel;
                const divisionCount = divisionCounts.get(record.divisionLabel) ?? 0;

                return (
                  <Fragment key={record.id}>
                    {showDivisionHeader ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={tableColumnCount}
                          className="border-y border-border/60 bg-muted/50 px-3 py-1.5"
                        >
                          <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-foreground">
                            <Layers
                              className="size-3.5 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                            {record.divisionLabel}
                            <span className="font-normal normal-case tracking-normal text-muted-foreground">
                              {divisionCount}{' '}
                              {divisionCount === 1 ? 'producto' : 'productos'}
                            </span>
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow
                      className={cn(batchMode && isSelected && 'bg-red-50/50 dark:bg-red-950/20')}
                    >
                    {batchMode ? (
                      <TableCell className="px-3 py-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(record.id, checked === true)}
                          aria-label={`Seleccionar ${record.name}`}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="py-2">
                      <span
                        className="block max-w-[8rem] truncate font-mono text-xs text-muted-foreground"
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
                    <TableCell className="py-2.5">
                      <EditableProductThumb
                        product={product}
                        name={record.name}
                        isUploading={uploadingProductId === product.id}
                        optimisticPreviewSrc={optimisticPreviewByProductId[product.id] ?? null}
                        isRowSelected={batchMode && soleSelectedProductId === product.id}
                        onUpload={(file) => uploadProductImage(product, file)}
                      />
                    </TableCell>
                    <TableCell className="max-w-[460px] py-2">
                      <AdminListasPreciosNameCell
                        product={product}
                        name={record.name}
                        subtitle={record.subtitle}
                        activeFieldId={activeFieldId}
                        onActivate={setActiveFieldId}
                        onClose={closeEditor}
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <AdminListasPreciosStockCell
                        product={product}
                        warehouses={warehouses}
                        activeFieldId={activeFieldId}
                        onActivate={setActiveFieldId}
                        onClose={closeEditor}
                        onPatch={(patch) => patchProduct(product.id, patch)}
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
                      <AdminListasPreciosMerchandisingCell
                        product={product}
                        products={products}
                        kind="cross_sell"
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <AdminListasPreciosMerchandisingCell
                        product={product}
                        products={products}
                        kind="upsell"
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <InventoryAttributesCell
                        attributes={product.attributes ?? []}
                        onSave={async (attributes: ProductAttribute[]) => {
                          await patchProduct(product.id, {
                            attributes: normalizeAttributes(attributes),
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <VariantsCountCell />
                    </TableCell>
                    <TableCell className="w-auto shrink px-1.5 py-2">
                      <AdminListasPreciosStatusBadge
                        status={record.status}
                        product={product}
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={rowBusyId === product.id || bulkBusy}
                            aria-label={`Acciones para ${record.name}`}
                          >
                            <MoreVertical className="size-3.5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => onEditProduct?.(product)}
                            disabled={!onEditProduct}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => void handleDuplicateProduct(product)}
                            disabled={rowBusyId === product.id || bulkBusy}
                          >
                            <Copy className="size-3.5" aria-hidden="true" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => void handleDeleteProduct(product)}
                            disabled={rowBusyId === product.id || bulkBusy}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </TableRow>
                  </Fragment>
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

      <InventoryBulkEditDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        selectedCount={selectedCount}
        categoryOptions={categories}
        attributeNameOptions={attributeNameOptions}
        onApply={handleBulkApply}
        isSaving={bulkBusy || bulkUpdateProducts.isPending}
      />
    </section>
  );
}
