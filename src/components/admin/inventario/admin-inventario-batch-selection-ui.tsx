import { memo, useSyncExternalStore, type ClipboardEvent } from 'react';
import {
  Copy,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  SlidersHorizontal,
  Tags,
  Trash2,
  Type,
} from 'lucide-react';

import { TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminInventarioBatchSelectionStore } from '@/components/admin/inventario/admin-inventario-batch-selection';
import { getImageFilesFromClipboard } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';

export function BatchSelectionCheckbox({
  store,
  id,
  'aria-label': ariaLabel,
}: {
  store: AdminInventarioBatchSelectionStore;
  id: string;
  'aria-label': string;
}) {
  const checked = useSyncExternalStore(
    store.subscribe,
    () => store.isSelected(id),
    () => false,
  );

  return (
    <input
      type="checkbox"
      className="size-3.5 accent-[hsl(var(--admin-accent))]"
      checked={checked}
      onChange={(event) => store.setSelected(id, event.target.checked)}
      aria-label={ariaLabel}
    />
  );
}

export function BatchSelectAllCheckbox({
  store,
  pageIds,
}: {
  store: AdminInventarioBatchSelectionStore;
  pageIds: string[];
}) {
  const state = useSyncExternalStore(
    store.subscribe,
    () => {
      const all = pageIds.length > 0 && pageIds.every((id) => store.isSelected(id));
      const some = pageIds.some((id) => store.isSelected(id));
      return all ? 'all' : some ? 'some' : 'none';
    },
    () => 'none' as const,
  );

  return (
    <input
      type="checkbox"
      className="size-3.5 accent-[hsl(var(--admin-accent))]"
      checked={state === 'all'}
      ref={(el) => {
        if (el) el.indeterminate = state === 'some';
      }}
      onChange={(event) => store.setMany(pageIds, event.target.checked)}
      aria-label="Seleccionar todos los productos de la página"
    />
  );
}

export const BatchSelectableTableRow = memo(function BatchSelectableTableRow({
  store,
  id,
  batchMode,
  children,
}: {
  store: AdminInventarioBatchSelectionStore;
  id: string;
  batchMode: boolean;
  children: React.ReactNode;
}) {
  const selected = useSyncExternalStore(
    store.subscribe,
    () => (batchMode ? store.isSelected(id) : false),
    () => false,
  );

  return (
    <TableRow className={cn(batchMode && selected && 'bg-red-50/50 dark:bg-red-950/20')}>
      {children}
    </TableRow>
  );
});

export function useBatchSelectionSize(store: AdminInventarioBatchSelectionStore) {
  return useSyncExternalStore(store.subscribe, () => store.getSize(), () => 0);
}

export function InventarioBatchToolbar({
  store,
  bulkBusy,
  exportBusy = false,
  canExport = true,
  onOpenAlbum,
  onOpenCategories,
  onOpenText,
  onOpenModify,
  onDuplicate,
  onDelete,
  onClear,
  onPasteImage,
  onExportListaPrecios,
}: {
  store: AdminInventarioBatchSelectionStore;
  bulkBusy: boolean;
  exportBusy?: boolean;
  canExport?: boolean;
  onOpenAlbum: () => void;
  onOpenCategories: () => void;
  onOpenText: () => void;
  onOpenModify: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClear: () => void;
  onPasteImage: (file: File) => void;
  onExportListaPrecios: () => void;
}) {
  const selectedCount = useBatchSelectionSize(store);

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (selectedCount === 0 || bulkBusy) return;
    const files = getImageFilesFromClipboard(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    onPasteImage(files[0]!);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b bg-card px-4 py-2.5"
      role="region"
      aria-label="Acciones por lotes"
      onPaste={handlePaste}
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
          onClick={onOpenAlbum}
          className="h-7 gap-1.5 text-xs"
          title="Abre la galería y aplica la imagen a todos los seleccionados. También puedes pegar (Ctrl+V)."
        >
          <ImagePlus className="size-3.5" aria-hidden="true" />
          Aplicar imagen a seleccionados
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0 || bulkBusy}
          onClick={onOpenCategories}
          className="h-7 gap-1.5 text-xs"
        >
          <Tags className="size-3.5" aria-hidden="true" />
          Categorías
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0 || bulkBusy}
          onClick={onOpenText}
          className="h-7 gap-1.5 text-xs"
        >
          <Type className="size-3.5" aria-hidden="true" />
          Texto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0 || bulkBusy}
          onClick={onOpenModify}
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
          disabled={
            bulkBusy ||
            exportBusy ||
            (selectedCount === 0 && !canExport)
          }
          onClick={onExportListaPrecios}
          className="h-7 gap-1.5 text-xs"
          title={
            selectedCount > 0
              ? 'Descarga Excel de lista de precios de los productos seleccionados'
              : 'Descarga Excel de lista de precios de los productos visibles (filtros actuales)'
          }
        >
          {exportBusy ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <FileSpreadsheet className="size-3.5" aria-hidden="true" />
          )}
          Lista de Precios
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0 || bulkBusy}
          onClick={onDelete}
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
            onClick={onClear}
            disabled={bulkBusy}
            className="h-7 text-xs"
          >
            Limpiar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
