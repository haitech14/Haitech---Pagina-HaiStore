import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Check, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  uploadFileToMediaAlbum,
  useMediaAlbum,
  useMediaAlbumMutations,
} from '@/hooks/use-media-album';
import { dedupeMediosForDisplay } from '@/lib/admin-medios-utils';
import { readImageFile } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';
import type { MediaAlbumItem, MediaAlbumItemKind } from '@/types/media-album';

interface MediaAlbumPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'single' | 'multiple';
  kind?: MediaAlbumItemKind;
  excludeUrls?: string[];
  title?: string;
  description?: string;
  onConfirm: (items: MediaAlbumItem[]) => void;
  /** Muestra subir / eliminar en el álbum (por defecto true). */
  allowManage?: boolean;
}

function mediaUrlKey(url: string): string {
  return String(url ?? '')
    .trim()
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
}

function itemMatchesSelection(item: MediaAlbumItem, selected: Map<string, MediaAlbumItem>): boolean {
  if (selected.has(item.id)) return true;
  if (item.mergedIds?.some((id) => selected.has(id))) return true;
  const key = mediaUrlKey(item.url);
  for (const selectedItem of selected.values()) {
    if (mediaUrlKey(selectedItem.url) === key) return true;
  }
  return false;
}

export function MediaAlbumPickerDialog({
  open,
  onOpenChange,
  mode,
  kind = 'image',
  excludeUrls = [],
  title = 'Elegir del álbum',
  description = 'Selecciona una imagen ya guardada, o sube una nueva si no la encuentras.',
  onConfirm,
  allowManage = true,
}: MediaAlbumPickerDialogProps) {
  const { data: items = [], isLoading, isError, error, refetch, isFetching } = useMediaAlbum(kind);
  const { remove } = useMediaAlbumMutations();
  const [selectedById, setSelectedById] = useState<Map<string, MediaAlbumItem>>(() => new Map());
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const excluded = useMemo(
    () => new Set(excludeUrls.map((url) => mediaUrlKey(url)).filter(Boolean)),
    [excludeUrls],
  );

  const visibleItems = useMemo(() => {
    const deduped = dedupeMediosForDisplay(items);
    const available = deduped.filter((item) => !excluded.has(mediaUrlKey(item.url)));
    const query = search.trim().toLowerCase();
    if (!query) return available;
    return available.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.url.toLowerCase().includes(query),
    );
  }, [items, excluded, search]);

  // Tras refetch/dedupe, re-anclar la selección a los ítems visibles (mismo URL o mergedIds).
  useEffect(() => {
    if (!open || selectedById.size === 0 || visibleItems.length === 0) return;

    const prev = selectedById;
    const next = new Map<string, MediaAlbumItem>();

    for (const item of visibleItems) {
      if (itemMatchesSelection(item, prev)) {
        next.set(item.id, item);
        if (mode === 'single') break;
      }
    }

    if (next.size === 0) return;

    let same = next.size === prev.size;
    if (same) {
      for (const id of next.keys()) {
        if (!prev.has(id)) {
          same = false;
          break;
        }
      }
    }
    if (!same) setSelectedById(next);
    // Solo al cambiar la grilla visible o el modo; selectedById se lee del render actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- evita bucles al remapeo
  }, [open, visibleItems, mode]);

  const selectedCount = selectedById.size;

  const clearSelection = () => setSelectedById(new Map());

  const toggleItem = (item: MediaAlbumItem) => {
    setSelectedById((prev) => {
      if (mode === 'single') {
        return itemMatchesSelection(item, prev) ? new Map() : new Map([[item.id, item]]);
      }
      const next = new Map(prev);
      if (itemMatchesSelection(item, next)) {
        for (const [id, selected] of [...next.entries()]) {
          if (
            id === item.id ||
            item.mergedIds?.includes(id) ||
            mediaUrlKey(selected.url) === mediaUrlKey(item.url)
          ) {
            next.delete(id);
          }
        }
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const resolveConfirmItems = (): MediaAlbumItem[] => {
    const fromVisible = visibleItems.filter((item) => itemMatchesSelection(item, selectedById));
    if (fromVisible.length > 0) {
      return mode === 'single' ? [fromVisible[0]!] : fromVisible;
    }
    const fallback = [...selectedById.values()];
    return mode === 'single' ? fallback.slice(0, 1) : fallback;
  };

  const handleConfirm = () => {
    const selected = resolveConfirmItems();
    if (selected.length === 0) {
      toast.error('Selecciona una imagen de la galería');
      return;
    }
    onConfirmRef.current(selected);
    clearSelection();
    setSearch('');
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      clearSelection();
      setSearch('');
    }
    onOpenChange(next);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: MediaAlbumItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/') && kind === 'image') continue;
        const item = await uploadFileToMediaAlbum(file, readImageFile);
        uploaded.push(item);
      }
      if (uploaded.length === 0) {
        toast.error('No se pudo subir ninguna imagen válida');
        return;
      }
      toast.success(
        uploaded.length === 1 ? 'Imagen subida al álbum' : `${uploaded.length} imágenes subidas`,
      );
      // Guarda el ítem completo: tras invalidate el id en la grilla puede cambiar.
      if (mode === 'single') {
        const first = uploaded[0]!;
        setSelectedById(new Map([[first.id, first]]));
      } else {
        setSelectedById((prev) => {
          const next = new Map(prev);
          for (const item of uploaded) next.set(item.id, item);
          return next;
        });
      }
      void refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaAlbumItem, event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (item.id.startsWith('inventory:')) {
      toast.message('Esta imagen viene del inventario; no se puede borrar desde el álbum.');
      return;
    }

    const label = item.name || 'esta imagen';
    if (!window.confirm(`¿Eliminar "${label}" del álbum?`)) return;

    setDeletingId(item.id);
    try {
      const idsToRemove = item.mergedIds?.length ? item.mergedIds : [item.id];
      for (const id of idsToRemove) {
        if (id.startsWith('inventory:')) continue;
        await remove.mutateAsync(id);
      }
      setSelectedById((prev) => {
        const next = new Map(prev);
        next.delete(item.id);
        for (const id of idsToRemove) next.delete(id);
        return next;
      });
      toast.success('Imagen eliminada del álbum');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la imagen');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent
        className="z-[220] max-h-[90vh] max-w-3xl overflow-hidden p-0"
        overlayClassName="z-[210] bg-black/50"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar en el álbum…"
            className="h-8 min-w-[12rem] flex-1 text-xs"
            aria-label="Buscar imágenes del álbum"
          />
          {allowManage ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple={mode === 'multiple'}
                className="sr-only"
                onChange={(event) => void handleUpload(event.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-3.5" aria-hidden="true" />
                )}
                Subir imagen
              </Button>
            </>
          ) : null}
        </div>

        <div className="max-h-[min(55vh,30rem)] overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" />
              Cargando álbum…
            </div>
          ) : isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center" role="alert">
              <p className="text-sm text-destructive">
                {error instanceof Error
                  ? error.message
                  : 'No se pudo cargar el álbum. Verifica que la API admin esté activa.'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {isFetching ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                Reintentar
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <ImageIcon className="size-8 opacity-60" aria-hidden="true" />
              <p className="text-sm">
                {search.trim()
                  ? 'No hay imágenes que coincidan con la búsqueda.'
                  : 'No hay elementos en el álbum todavía.'}
              </p>
              {allowManage && !search.trim() ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-3.5" aria-hidden="true" />
                  Subir imagen
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visibleItems.map((item) => {
                const selected = itemMatchesSelection(item, selectedById);
                const canDelete = allowManage && !item.id.startsWith('inventory:');
                const isDeleting = deletingId === item.id;
                return (
                  <li key={item.mergedIds?.join(':') ?? item.id}>
                    <div
                      className={cn(
                        'group relative aspect-square w-full overflow-hidden rounded-lg border bg-muted/30 transition-colors',
                        selected
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <button
                        type="button"
                        className="absolute inset-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => toggleItem(item)}
                        onDoubleClick={() => {
                          if (mode === 'single') {
                            onConfirmRef.current([item]);
                            clearSelection();
                            setSearch('');
                            onOpenChange(false);
                          }
                        }}
                        aria-pressed={selected}
                        aria-label={item.name}
                      >
                        <img
                          src={item.url}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                        {selected ? (
                          <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                        ) : null}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-background/85 px-2 py-1 text-[10px] font-medium">
                          {item.name}
                        </span>
                      </button>
                      {canDelete ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute left-1.5 top-1.5 size-7 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          aria-label={`Eliminar ${item.name}`}
                          disabled={isDeleting || remove.isPending}
                          onClick={(event) => void handleDelete(item, event)}
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selectedCount === 0}>
            Usar selección ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
