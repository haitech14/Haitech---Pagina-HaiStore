import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
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
  ExternalLink,
  ListFilter,
  Layers,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { InventoryBulkEditDialog } from '@/components/admin/inventory/inventory-bulk-edit-dialog';
import { InventoryImagePreviewDialog } from '@/components/admin/inventory/inventory-image-preview-dialog';
import { MediaAlbumPickerDialog } from '@/components/admin/media-album/media-album-picker-dialog';
import { createAdminInventarioBatchSelectionStore } from '@/components/admin/inventario/admin-inventario-batch-selection';
import {
  BatchSelectAllCheckbox,
  BatchSelectionCheckbox,
  BatchSelectableTableRow,
  InventarioBatchToolbar,
} from '@/components/admin/inventario/admin-inventario-batch-selection-ui';
import { AdminInventoryProductThumbHoverPreview } from '@/components/admin/inventario/admin-inventory-product-thumb-hover-preview';
import { AdminInventoryProductThumbImage } from '@/components/admin/inventario/admin-inventory-product-thumb-image';
import { AdminInventarioCategoryTreePopover } from '@/components/admin/inventario/admin-inventario-category-tree-popover';
import { AdminInventarioVariantsCell } from '@/components/admin/inventario/admin-inventario-variants-cell';
import { InventoryAttributesCell } from '@/components/admin/inventory/inventory-attributes-cell';
import { AdminListasPreciosCategoryCell } from '@/components/admin/inventario/admin-listas-precios-category-cell';
import { AdminListasPreciosMerchandisingCell } from '@/components/admin/inventario/admin-listas-precios-merchandising-cell';
import { AdminListasPreciosNameCell } from '@/components/admin/inventario/admin-listas-precios-name-cell';
import { AdminListasPreciosPriceCell } from '@/components/admin/inventario/admin-listas-precios-price-cell';
import { AdminListasPreciosStatusBadge } from '@/components/admin/inventario/admin-listas-precios-status-badge';
import { AdminListasPreciosStockCell } from '@/components/admin/inventario/admin-listas-precios-stock-cell';
import { HeaderCurrencyControl } from '@/components/layout/header-currency-control';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { Button } from '@/components/ui/button';
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
import { uploadFileToMediaAlbum } from '@/hooks/use-media-album';
import { useInventarioTableModel } from '@/hooks/use-inventario-table-model';
import { useInventoryMutations } from '@/hooks/use-products';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useWarehouses } from '@/hooks/use-warehouses';
import {
  ROLE_HEADER_META,
  ROLE_LABELS,
} from '@/lib/admin-listas-precios-utils';
import { formatProductCodeCardDisplay } from '@/lib/format-product-code-display';
import { buildAttributeNameCatalog, normalizeAttributes } from '@/lib/inventory-attributes';
import { hasAdminInventoryProductImage } from '@/lib/admin-inventory-product-image';
import {
  getImageFilesFromClipboard,
  prepareInventoryPayloadForApi,
  readImageFile,
  replaceProductMainImage,
} from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { buildProductPath } from '@/lib/product-slug';
import { cn } from '@/lib/utils';
import type { AdminListaPreciosRoleKey } from '@/types/admin-listas-precios';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, ProductAttribute } from '@/types/product';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const VIEW_PERSIST_DEBOUNCE_MS = 400;

const INVENTARIO_TABLE_VIEW_KEY = 'haistore:admin-inventario-table-view';

interface InventarioTableViewState {
  search: string;
  roleFilter: string;
  currencyFilter: string;
  channelFilter: string;
  validityFilter: string;
  page: number;
  pageSize: number;
  batchMode: boolean;
  showRelations: boolean;
}

function readInventarioTableView(): InventarioTableViewState | null {
  try {
    const raw = sessionStorage.getItem(INVENTARIO_TABLE_VIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InventarioTableViewState>;
    const pageSize = Number(parsed.pageSize);
    return {
      search: typeof parsed.search === 'string' ? parsed.search : '',
      roleFilter: typeof parsed.roleFilter === 'string' ? parsed.roleFilter : 'todos',
      currencyFilter:
        typeof parsed.currencyFilter === 'string' ? parsed.currencyFilter : 'ambas',
      channelFilter:
        typeof parsed.channelFilter === 'string' ? parsed.channelFilter : 'todos',
      validityFilter:
        typeof parsed.validityFilter === 'string' ? parsed.validityFilter : 'todas',
      page: Math.max(1, Number(parsed.page) || 1),
      pageSize: PAGE_SIZE_OPTIONS.includes(pageSize as (typeof PAGE_SIZE_OPTIONS)[number])
        ? pageSize
        : 10,
      batchMode: parsed.batchMode === true,
      showRelations: parsed.showRelations === true,
    };
  } catch {
    return null;
  }
}

/** Orden: Compra → Mayorista → Técnico → Público */
const PRICE_ROLES: AdminListaPreciosRoleKey[] = [
  'compra',
  'mayorista',
  'tecnico',
  'public',
];

const ROLE_HEADER_ICONS = {
  public: User,
  tecnico: Building2,
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
        'flex min-w-[5.5rem] items-center justify-end gap-0.5 rounded-sm text-[0.625rem] leading-none transition-colors',
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

const BASE_CORE_COLUMN_COUNT = 11;
const RELATIONS_COLUMN_COUNT = 4;

function EditableProductThumbComponent({
  product,
  name,
  isUploading,
  optimisticPreviewSrc = null,
  isRowSelected = false,
  onUpload,
  onOpenGallery,
  onOpenPreview,
}: {
  product: InventoryProduct;
  name: string;
  isUploading: boolean;
  optimisticPreviewSrc?: string | null;
  isRowSelected?: boolean;
  onUpload: (file: File) => Promise<void>;
  onOpenGallery: () => void;
  onOpenPreview: () => void;
}) {
  const thumbRef = useRef<HTMLButtonElement>(null);
  const dragDepthRef = useRef(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const hasImage = hasAdminInventoryProductImage(product, optimisticPreviewSrc);
  const isDocumentPasteActive =
    !isUploading && !isFocused && (isHovered || isRowSelected);
  const showDropHint = !isUploading && isDragOver;
  const showPasteHint =
    !isUploading && !isDragOver && (isFocused || isHovered || isRowSelected);
  const showHoverPreview = hasImage && isHovered && !isUploading && !isDragOver;

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

  const resetDragState = useCallback(() => {
    dragDepthRef.current = 0;
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      if (isUploading) return;
      if (![...event.dataTransfer.types].includes('Files')) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current += 1;
      setIsDragOver(true);
    },
    [isUploading],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      if (isUploading) return;
      if (![...event.dataTransfer.types].includes('Files')) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    },
    [isUploading],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      resetDragState();
      if (isUploading) return;
      const files = getImageFilesFromClipboard(event.dataTransfer);
      if (files.length === 0) return;
      void onUpload(files[0]);
    },
    [isUploading, onUpload, resetDragState],
  );

  useEffect(() => {
    if (!isDocumentPasteActive) return;
    const onPaste = (event: globalThis.ClipboardEvent) => handlePaste(event);
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handlePaste, isDocumentPasteActive]);

  useEffect(() => {
    if (!isDragOver) return;
    const cancelDrag = () => resetDragState();
    window.addEventListener('dragend', cancelDrag);
    window.addEventListener('drop', cancelDrag);
    return () => {
      window.removeEventListener('dragend', cancelDrag);
      window.removeEventListener('drop', cancelDrag);
    };
  }, [isDragOver, resetDragState]);

  return (
    <>
      <button
        ref={thumbRef}
        type="button"
        tabIndex={0}
        onClick={(event) => {
          if (isUploading) return;
          // Shift+clic: elegir desde el álbum. Clic normal: ampliar (o álbum si no hay foto).
          if (event.shiftKey || !hasImage) {
            onOpenGallery();
            return;
          }
          setIsHovered(false);
          onOpenPreview();
        }}
        onPaste={handlePaste}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isUploading}
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border/70 bg-muted/30 transition-colors',
          'hover:border-[hsl(var(--admin-accent))]/50 hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2',
          (showPasteHint || showDropHint) &&
            'border-[hsl(var(--admin-accent))]/60 ring-1 ring-[hsl(var(--admin-accent))]/30',
          showDropHint && 'border-[hsl(var(--admin-accent))] ring-2 ring-[hsl(var(--admin-accent))]/50',
          isUploading && 'cursor-wait opacity-70',
        )}
        aria-label={
          hasImage
            ? `Ver foto ampliada de ${name}. Shift+clic para álbum. Ctrl+V o arrastrar imagen.`
            : `Elegir foto de ${name} desde el álbum. Ctrl+V o arrastrar imagen.`
        }
        title={
          hasImage
            ? 'Clic para ampliar · Shift+clic: álbum · Ctrl+V / arrastrar'
            : 'Clic para abrir álbum · Ctrl+V o arrastrar imagen'
        }
      >
        {hasImage ? (
          <AdminInventoryProductThumbImage
            key={`${product.id}:${optimisticPreviewSrc ?? product.image_url ?? 'none'}`}
            product={product}
            optimisticSrc={optimisticPreviewSrc}
            className="size-full"
            loading={optimisticPreviewSrc ? 'eager' : 'lazy'}
          />
        ) : (
          <ProductNoImagePlaceholder size="sm" className="w-full max-w-none opacity-70" />
        )}
        {isUploading ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/55">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
          </span>
        ) : null}
        {showDropHint ? (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[hsl(var(--admin-accent))]/80 text-[0.5625rem] font-semibold leading-none text-white"
            aria-hidden="true"
          >
            Soltar
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

const EditableProductThumb = memo(EditableProductThumbComponent);

const SEARCH_DEBOUNCE_MS = 150;

/** Input local: evita refiltrar/re-renderizar la tabla en cada tecla. */
const InventarioSearchInput = memo(function InventarioSearchInput({
  value: committedValue,
  onSearchChange,
}: {
  value: string;
  onSearchChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(committedValue);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    setDraft(committedValue);
  }, [committedValue]);

  useEffect(() => {
    if (draft === committedValue) return;
    const timer = window.setTimeout(() => {
      onSearchChangeRef.current(draft);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [committedValue, draft]);

  return (
    <div className="relative min-w-[12rem] flex-1 sm:max-w-sm">
      <Search
        className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Buscar por producto, código o SKU..."
        className="h-8 bg-background pl-8 text-xs"
        aria-label="Buscar productos"
      />
    </div>
  );
});

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
  const initialView = useMemo(() => readInventarioTableView(), []);
  const [search, setSearch] = useState(initialView?.search ?? '');
  const [roleFilter, setRoleFilter] = useState<string>(initialView?.roleFilter ?? 'todos');
  const [currencyFilter, setCurrencyFilter] = useState<string>(
    initialView?.currencyFilter ?? 'ambas',
  );
  const [channelFilter, setChannelFilter] = useState<string>(
    initialView?.channelFilter ?? 'todos',
  );
  const [validityFilter, setValidityFilter] = useState<string>(
    initialView?.validityFilter ?? 'todas',
  );
  const [sortRole, setSortRole] = useState<AdminListaPreciosRoleKey>('public');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(initialView?.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(initialView?.pageSize ?? 10);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [uploadingProductIds, setUploadingProductIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [optimisticPreviewByProductId, setOptimisticPreviewByProductId] = useState<
    Record<string, string>
  >({});
  const [batchMode, setBatchMode] = useState(initialView?.batchMode ?? false);
  const [showRelations, setShowRelations] = useState(initialView?.showRelations ?? false);
  const batchSelectionStoreRef = useRef(createAdminInventarioBatchSelectionStore());
  const batchSelectionStore = batchSelectionStoreRef.current;
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDialogFocus, setBulkDialogFocus] = useState<
    'categories' | 'name' | 'code' | null
  >(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** IDs a los que aplicar la imagen elegida en el álbum (uno o varios en lote). */
  const [albumPickerTargetIds, setAlbumPickerTargetIds] = useState<string[] | null>(null);
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const albumPickerTargetIdsRef = useRef<string[] | null>(null);
  albumPickerTargetIdsRef.current = albumPickerTargetIds;
  const optimisticHoldTimersRef = useRef<Map<string, number>>(new Map());

  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();
  const { data: warehouses = DEFAULT_WAREHOUSES } = useWarehouses();
  const { deleteProduct, bulkDeleteProducts, bulkDuplicateProducts, bulkUpdateProducts } =
    useInventoryMutations();

  const {
    productsById,
    merchandisingProductById,
    merchandisingCatalog,
    categoryOptions: categories,
    filteredRecords,
    sortedRecords,
    divisionCounts,
  } = useInventarioTableModel(products, categoryTree, {
    search,
    roleFilter,
    currencyFilter,
    channelFilter,
    validityFilter,
    sortRole,
    sortDir,
  });

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

  // Solo ajustar página cuando hay datos y el índice quedó fuera de rango
  // (p. ej. borrados). No bajar a 1 durante un refetch transitorio vacío.
  useEffect(() => {
    if (sortedRecords.length === 0) return;
    if (page > totalPages) setPage(totalPages);
  }, [page, sortedRecords.length, totalPages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const payload: InventarioTableViewState = {
          search,
          roleFilter,
          currencyFilter,
          channelFilter,
          validityFilter,
          page: safePage,
          pageSize,
          batchMode,
          showRelations,
        };
        sessionStorage.setItem(INVENTARIO_TABLE_VIEW_KEY, JSON.stringify(payload));
      } catch {
        // sessionStorage no disponible
      }
    }, VIEW_PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [
    batchMode,
    channelFilter,
    currencyFilter,
    pageSize,
    roleFilter,
    safePage,
    search,
    showRelations,
    validityFilter,
  ]);

  const closeEditor = useCallback(() => setActiveFieldId(null), []);

  const patchProduct = useCallback(
    async (productId: string, patch: Partial<InventoryProduct>) => {
      await onPatchProduct(productId, patch);
    },
    [onPatchProduct],
  );

  const setProductsUploading = useCallback((productIds: string[], uploading: boolean) => {
    setUploadingProductIds((current) => {
      const next = new Set(current);
      for (const id of productIds) {
        if (uploading) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clearOptimisticPreview = useCallback((productId: string, blobUrl?: string) => {
    const timer = optimisticHoldTimersRef.current.get(productId);
    if (timer != null) {
      window.clearTimeout(timer);
      optimisticHoldTimersRef.current.delete(productId);
    }
    setOptimisticPreviewByProductId((current) => {
      if (!(productId in current)) return current;
      const next = { ...current };
      delete next[productId];
      return next;
    });
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, []);

  const isPersistedProductImageUrl = useCallback((url: string | null | undefined) => {
    const trimmed = url?.trim() ?? '';
    if (!trimmed) return false;
    const path = trimmed.split('?')[0]?.split('#')[0] ?? '';
    return path.startsWith('/products/') && trimmed.includes('?v=');
  }, []);

  // Quita preview solo cuando la caché ya tiene /products/…?v= (evita flash a “sin imagen”).
  useEffect(() => {
    setOptimisticPreviewByProductId((current) => {
      const ids = Object.keys(current);
      if (ids.length === 0) return current;
      let changed = false;
      const next = { ...current };
      for (const id of ids) {
        const product = productsById.get(id);
        if (!isPersistedProductImageUrl(product?.image_url)) continue;
        delete next[id];
        changed = true;
      }
      return changed ? next : current;
    });
  }, [isPersistedProductImageUrl, productsById]);

  useEffect(() => {
    return () => {
      for (const timer of optimisticHoldTimersRef.current.values()) {
        window.clearTimeout(timer);
      }
      optimisticHoldTimersRef.current.clear();
      for (const url of Object.values(optimisticPreviewByProductId)) {
        URL.revokeObjectURL(url);
      }
    };
    // Solo al desmontar: no revocar en cada cambio de previews.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup
  }, []);

  const applyImageUrlToProduct = useCallback(
    async (product: InventoryProduct, imageUrl: string) => {
      const media = replaceProductMainImage(product, imageUrl);
      const payload = await prepareInventoryPayloadForApi({ ...product, ...media });
      await patchProduct(product.id, {
        image_url: payload.image_url,
        gallery: payload.gallery,
      });
    },
    [patchProduct],
  );

  const uploadProductImage = useCallback(
    async (product: InventoryProduct, file: File) => {
      const optimisticPreviewSrc = URL.createObjectURL(file);
      setOptimisticPreviewByProductId((current) => ({
        ...current,
        [product.id]: optimisticPreviewSrc,
      }));
      setProductsUploading([product.id], true);

      try {
        // Sube al álbum (ruta corta) en lugar de embeber data: en el PATCH.
        const albumItem = await uploadFileToMediaAlbum(file, readImageFile);
        setOptimisticPreviewByProductId((current) => ({
          ...current,
          [product.id]: albumItem.url,
        }));
        await applyImageUrlToProduct(product, albumItem.url);
        toast.success('Imagen del producto actualizada');
        if (optimisticPreviewSrc) URL.revokeObjectURL(optimisticPreviewSrc);
        // El effect limpia cuando la caché tenga /products/…?v=.
      } catch (error) {
        clearOptimisticPreview(product.id, optimisticPreviewSrc);
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar la imagen del producto',
        );
      } finally {
        setProductsUploading([product.id], false);
      }
    },
    [
      applyImageUrlToProduct,
      clearOptimisticPreview,
      setProductsUploading,
    ],
  );

  const applyImageToSelectedProducts = useCallback(
    async (file: File) => {
      const ids = [...batchSelectionStore.getSelectedIds()];
      if (ids.length === 0) return;

      const targets = ids
        .map((id) => productsById.get(id))
        .filter((product): product is InventoryProduct => Boolean(product));
      if (targets.length === 0) {
        toast.error('No se encontraron los productos seleccionados en el inventario');
        return;
      }

      const targetIds = targets.map((product) => product.id);
      const previewById: Record<string, string> = {};
      for (const id of targetIds) {
        previewById[id] = URL.createObjectURL(file);
      }

      setOptimisticPreviewByProductId((current) => ({ ...current, ...previewById }));
      setProductsUploading(targetIds, true);
      setBulkBusy(true);

      try {
        const albumItem = await uploadFileToMediaAlbum(file, readImageFile);
        const result = await bulkUpdateProducts.mutateAsync({
          ids: targetIds,
          patch: { image_url: albumItem.url },
        });
        const persistedById = new Map(
          (result.products ?? []).map((product) => [product.id, product.image_url ?? null]),
        );
        setOptimisticPreviewByProductId((current) => {
          const next = { ...current };
          for (const id of targetIds) {
            const blobUrl = previewById[id];
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            const persisted = persistedById.get(id)?.trim();
            next[id] = persisted || albumItem.url;
          }
          return next;
        });
        toast.success(
          targetIds.length === 1
            ? 'Imagen aplicada al producto seleccionado'
            : `Imagen aplicada a ${targetIds.length} productos`,
        );
      } catch (error) {
        for (const id of targetIds) {
          clearOptimisticPreview(id, previewById[id]);
        }
        toast.error(
          error instanceof Error
            ? error.message
            : 'No se pudo aplicar la imagen a los productos seleccionados',
        );
      } finally {
        setProductsUploading(targetIds, false);
        setBulkBusy(false);
      }
    },
    [
      batchSelectionStore,
      bulkUpdateProducts,
      clearOptimisticPreview,
      productsById,
      setProductsUploading,
    ],
  );

  const applyAlbumUrlToTargets = useCallback(
    async (imageUrl: string, productIds: string[]) => {
      const targetIds = [...new Set(productIds.filter(Boolean))];
      if (targetIds.length === 0) {
        toast.error('No hay productos destino para aplicar la imagen');
        return;
      }

      const targets = targetIds
        .map((id) => productsById.get(id))
        .filter((product): product is InventoryProduct => Boolean(product));
      if (targets.length === 0) {
        toast.error('Los productos seleccionados ya no están en el inventario cargado');
        return;
      }

      // Preview inmediata mientras el PATCH escribe /products/…webp
      setOptimisticPreviewByProductId((current) => {
        const next = { ...current };
        for (const id of targetIds) next[id] = imageUrl;
        return next;
      });
      setProductsUploading(targetIds, true);
      if (targetIds.length > 1) setBulkBusy(true);

      try {
        // Un solo producto: replaceProductMainImage + prepare/persist (igual que subida).
        if (targets.length === 1) {
          await applyImageUrlToProduct(targets[0], imageUrl);
          toast.success('Imagen del álbum aplicada');
          return;
        }

        const result = await bulkUpdateProducts.mutateAsync({
          ids: targetIds,
          patch: { image_url: imageUrl },
        });
        const persistedById = new Map(
          (result.products ?? []).map((product) => [product.id, product.image_url ?? null]),
        );
        // Nunca borrar el preview aquí: si el API no trae image_url, se mantiene el álbum.
        // El effect limpia solo cuando la caché ya tiene /products/…?v=.
        setOptimisticPreviewByProductId((current) => {
          const next = { ...current };
          for (const id of targetIds) {
            const persisted = persistedById.get(id)?.trim();
            next[id] = persisted || imageUrl;
          }
          return next;
        });
        toast.success(`Imagen del álbum aplicada a ${targetIds.length} productos`);
      } catch (error) {
        for (const id of targetIds) {
          clearOptimisticPreview(id);
        }
        toast.error(
          error instanceof Error
            ? error.message
            : `No se pudo aplicar la imagen en ${targetIds.length} productos`,
        );
      } finally {
        setProductsUploading(targetIds, false);
        setBulkBusy(false);
      }
    },
    [
      applyImageUrlToProduct,
      bulkUpdateProducts,
      clearOptimisticPreview,
      productsById,
      setProductsUploading,
    ],
  );

  useEffect(() => {
    if (!batchMode || bulkBusy) return;
    const onPaste = (event: globalThis.ClipboardEvent) => {
      if (batchSelectionStore.getSize() < 2) return;
      const files = getImageFilesFromClipboard(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      void applyImageToSelectedProducts(files[0]);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [applyImageToSelectedProducts, batchMode, batchSelectionStore, bulkBusy]);

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('todos');
    setCurrencyFilter('ambas');
    setValidityFilter('todas');
    setPage(1);
  };

  const tableColumnCount =
    BASE_CORE_COLUMN_COUNT +
    (showRelations ? RELATIONS_COLUMN_COUNT : 0) +
    (batchMode ? 1 : 0);
  const pageIds = paginatedRecords.map((record) => record.id);

  const clearSelection = () => {
    batchSelectionStore.clear();
  };

  const toggleBatchMode = () => {
    setBatchMode((prev) => {
      if (prev) clearSelection();
      return !prev;
    });
  };

  const getSelectedIds = () => [...batchSelectionStore.getSelectedIds()];

  const openBulkDialog = (focus: 'categories' | 'name' | 'code' | null = null) => {
    setBulkDialogFocus(focus);
    setBulkDialogOpen(true);
  };

  const handleDeleteProduct = async (product: InventoryProduct) => {
    if (!window.confirm(`¿Eliminar «${product.name}» del inventario?`)) return;
    setRowBusyId(product.id);
    try {
      await deleteProduct.mutateAsync(product.id);
      batchSelectionStore.setSelected(product.id, false);
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const hasHiddenFilters =
    roleFilter !== 'todos' || currencyFilter !== 'ambas' || validityFilter !== 'todas';

  return (
    <section
      className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
      aria-busy={isSaving}
    >
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 p-4">
        <InventarioSearchInput value={search} onSearchChange={handleSearchChange} />

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

        <Button
          type="button"
          variant={showRelations ? 'default' : 'outline'}
          className={cn(
            'h-8 gap-1 bg-background text-xs',
            showRelations &&
              'bg-[hsl(var(--admin-accent))] text-white hover:bg-[hsl(var(--admin-accent-hover))]',
          )}
          onClick={() => setShowRelations((current) => !current)}
          aria-pressed={showRelations}
          title="Mostrar u ocultar venta cruzada, upsells, atributos y variantes"
        >
          Relaciones
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
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

          <HeaderCurrencyControl className="h-8 shrink-0 bg-background px-1.5 py-0 sm:px-2" />
        </div>
      </div>

      {batchMode ? (
        <InventarioBatchToolbar
          store={batchSelectionStore}
          bulkBusy={bulkBusy}
          onOpenAlbum={() => setAlbumPickerTargetIds(getSelectedIds())}
          onOpenCategories={() => openBulkDialog('categories')}
          onOpenText={() => openBulkDialog('name')}
          onOpenModify={() => openBulkDialog(null)}
          onDuplicate={() => void handleBulkDuplicate()}
          onDelete={() => void handleBulkDelete()}
          onClear={clearSelection}
          onPasteImage={(file) => void applyImageToSelectedProducts(file)}
        />
      ) : null}

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {batchMode ? (
                <TableHead className="h-7 w-9 px-2 py-1">
                  <BatchSelectAllCheckbox store={batchSelectionStore} pageIds={pageIds} />
                </TableHead>
              ) : null}
              <TableHead className="h-7 min-w-[6.5rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Código
              </TableHead>
              <TableHead className="h-7 min-w-[12rem] max-w-[18rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Categorías
              </TableHead>
              <TableHead className="h-7 min-w-[4.5rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Producto
              </TableHead>
              <TableHead className="h-7 min-w-[22rem] w-[460px] max-w-[460px] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Nombre
              </TableHead>
              <TableHead className="h-7 min-w-[4.5rem] px-1.5 py-1 text-center text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Stock
              </TableHead>
              {PRICE_ROLES.map((role) => (
                <TableHead
                  key={role}
                  className="h-7 min-w-[6.5rem] px-1.5 py-1 text-right text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground"
                >
                  <PriceColumnHeader
                    role={role}
                    active={sortRole === role}
                    direction={sortDir}
                    onSort={handleSortRole}
                  />
                </TableHead>
              ))}
              {showRelations ? (
                <>
                  <TableHead className="h-7 min-w-[6.5rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                    Venta Cruzada
                  </TableHead>
                  <TableHead className="h-7 min-w-[5.5rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                    Upsells
                  </TableHead>
                  <TableHead className="h-7 w-[12rem] max-w-[12rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                    Atributos
                  </TableHead>
                  <TableHead className="h-7 min-w-[6.5rem] px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                    Variantes
                  </TableHead>
                </>
              ) : null}
              <TableHead className="h-7 w-auto shrink px-1.5 py-1 text-[0.625rem] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="h-7 w-9 px-2 py-1" aria-label="Acciones" />
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
              paginatedRecords.flatMap((record, index) => {
                let product = productsById.get(record.id);
                // Nunca silenciar filas: si falta el producto (carrera de caché / id
                // colisionado en el Map), sintetizamos un stub para que footer N
                // coincida con filas visibles.
                if (!product) {
                  console.warn(
                    `[inventario] productsById sin ${record.id}; stub desde record`,
                  );
                  product = {
                    id: record.id,
                    code: record.sku,
                    name: record.name,
                    description: null,
                    currency: 'USD',
                    image_url: record.imageUrl ?? null,
                    stock: 0,
                    category: null,
                    created_at: new Date(0).toISOString(),
                    sort_order: 0,
                    purchase_price_usd: record.prices.compra,
                    status: record.status,
                    prices: {
                      public: record.prices.public,
                      tecnico: record.prices.tecnico,
                      mayorista: record.prices.mayorista,
                      distribuidor: record.prices.public,
                    },
                  } satisfies InventoryProduct;
                }
                const prevRecord = index > 0 ? paginatedRecords[index - 1] : null;
                const showDivisionHeader =
                  index === 0 || prevRecord?.divisionLabel !== record.divisionLabel;
                const divisionCount = divisionCounts.get(record.divisionLabel) ?? 0;

                const rows = [];
                if (showDivisionHeader) {
                  rows.push(
                    <TableRow
                      key={`division:${record.divisionLabel}:${record.id}`}
                      className="hover:bg-transparent"
                    >
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
                    </TableRow>,
                  );
                }
                rows.push(
                  <BatchSelectableTableRow
                    key={record.id}
                    store={batchSelectionStore}
                    id={record.id}
                    batchMode={batchMode}
                  >
                    {batchMode ? (
                      <TableCell className="px-2 py-1">
                        <BatchSelectionCheckbox
                          store={batchSelectionStore}
                          id={record.id}
                          aria-label={`Seleccionar ${record.name}`}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="px-1.5 py-1">
                      <span
                        className="block max-w-[8rem] truncate font-mono text-[0.6875rem] leading-tight text-muted-foreground"
                        title={record.sku}
                      >
                        {formatProductCodeCardDisplay(record.sku)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-[12rem] max-w-[18rem] px-1.5 py-1 align-top">
                      <AdminListasPreciosCategoryCell
                        product={product}
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="px-1.5 py-1">
                      <EditableProductThumb
                        product={product}
                        name={record.name}
                        isUploading={uploadingProductIds.has(product.id)}
                        optimisticPreviewSrc={optimisticPreviewByProductId[product.id] ?? null}
                        isRowSelected={false}
                        onUpload={(file) => uploadProductImage(product, file)}
                        onOpenGallery={() => setAlbumPickerTargetIds([product.id])}
                        onOpenPreview={() => setPreviewProductId(product.id)}
                      />
                    </TableCell>
                    <TableCell className="min-w-[22rem] max-w-[460px] px-1.5 py-1">
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
                    <TableCell className="px-1.5 py-1">
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
                      <TableCell key={role} className="px-1.5 py-1">
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
                    {showRelations ? (
                      <>
                        <TableCell className="px-1.5 py-1">
                          <AdminListasPreciosMerchandisingCell
                            product={product}
                            catalog={merchandisingCatalog}
                            productById={merchandisingProductById}
                            kind="cross_sell"
                            onPatch={(patch) => patchProduct(product.id, patch)}
                          />
                        </TableCell>
                        <TableCell className="px-1.5 py-1">
                          <AdminListasPreciosMerchandisingCell
                            product={product}
                            catalog={merchandisingCatalog}
                            productById={merchandisingProductById}
                            kind="upsell"
                            onPatch={(patch) => patchProduct(product.id, patch)}
                          />
                        </TableCell>
                        <TableCell className="w-[12rem] max-w-[12rem] px-1.5 py-1">
                          <InventoryAttributesCell
                            attributes={product.attributes ?? []}
                            nameOptions={attributeNameOptions}
                            catalogProducts={products}
                            onSave={async (attributes: ProductAttribute[]) => {
                              await patchProduct(product.id, {
                                attributes: normalizeAttributes(attributes),
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="px-1.5 py-1">
                          <AdminInventarioVariantsCell
                            product={product}
                            catalog={merchandisingCatalog}
                            productById={merchandisingProductById}
                            onPatch={(patch) => patchProduct(product.id, patch)}
                          />
                        </TableCell>
                      </>
                    ) : null}
                    <TableCell className="w-auto shrink px-1.5 py-1">
                      <AdminListasPreciosStatusBadge
                        status={record.status}
                        product={product}
                        onPatch={(patch) => patchProduct(product.id, patch)}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6"
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
                          <DropdownMenuItem asChild>
                            <a
                              href={buildProductPath(product)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-3.5" aria-hidden="true" />
                              Ver el producto
                            </a>
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
                    </BatchSelectableTableRow>,
                );
                return rows;
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
        onOpenChange={(open) => {
          setBulkDialogOpen(open);
          if (!open) setBulkDialogFocus(null);
        }}
        selectedCount={batchSelectionStore.getSize()}
        categoryOptions={categories}
        attributeNameOptions={attributeNameOptions}
        onApply={handleBulkApply}
        isSaving={bulkBusy || bulkUpdateProducts.isPending}
        initialFocus={bulkDialogFocus}
      />

      <MediaAlbumPickerDialog
        open={albumPickerTargetIds !== null}
        onOpenChange={(next) => {
          if (!next) setAlbumPickerTargetIds(null);
        }}
        mode="single"
        title="Galería de imágenes"
        description={
          albumPickerTargetIds && albumPickerTargetIds.length > 1
            ? `Elige o sube una imagen; se aplicará a ${albumPickerTargetIds.length} productos seleccionados.`
            : 'Elige una imagen ya guardada, súbela si no está, o elimínala del álbum.'
        }
        onConfirm={(items) => {
          const url = items[0]?.url?.trim();
          const targetIds = albumPickerTargetIdsRef.current;
          setAlbumPickerTargetIds(null);
          if (!url) {
            toast.error('No se pudo obtener la URL de la imagen seleccionada');
            return;
          }
          if (!targetIds?.length) {
            toast.error('No hay productos destino para aplicar la imagen');
            return;
          }
          void applyAlbumUrlToTargets(url, targetIds);
        }}
      />

      <InventoryImagePreviewDialog
        product={previewProductId ? productsById.get(previewProductId) ?? null : null}
        open={previewProductId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewProductId(null);
        }}
        onSaveMedia={async (media) => {
          if (!previewProductId) return;
          await onPatchProduct(previewProductId, media);
          toast.success('Medios actualizados');
        }}
      />
    </section>
  );
}
