import { useMemo, useState } from 'react';
import { Check, ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMediaAlbum } from '@/hooks/use-media-album';
import { dedupeMediosForDisplay } from '@/lib/admin-medios-utils';
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
}

export function MediaAlbumPickerDialog({
  open,
  onOpenChange,
  mode,
  kind = 'image',
  excludeUrls = [],
  title = 'Elegir del álbum',
  description = 'Selecciona imágenes ya optimizadas para reutilizarlas en productos.',
  onConfirm,
}: MediaAlbumPickerDialogProps) {
  const { data: items = [], isLoading, isError } = useMediaAlbum(kind);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const excluded = useMemo(() => new Set(excludeUrls), [excludeUrls]);

  const visibleItems = useMemo(() => {
    const deduped = dedupeMediosForDisplay(items);
    return deduped.filter((item) => !excluded.has(item.url));
  }, [items, excluded]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      if (mode === 'single') {
        return prev.has(id) ? new Set() : new Set([id]);
      }
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = visibleItems.filter((item) => selectedIds.has(item.id));
    if (selected.length === 0) return;
    onConfirm(selected);
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedIds(new Set());
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60vh,32rem)] overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" />
              Cargando álbum…
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive" role="alert">
              No se pudo cargar el álbum. Verifica que la API admin esté activa.
            </p>
          ) : visibleItems.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ImageIcon className="size-8 opacity-60" aria-hidden="true" />
              <p className="text-sm">No hay elementos en el álbum todavía.</p>
              <p className="text-xs">Sube archivos, sincroniza Google Drive o usa las imágenes ya guardadas en inventario.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visibleItems.map((item) => {
                const selected = selectedIds.has(item.id);
                return (
                  <li key={item.mergedIds?.join(':') ?? item.id}>
                    <button
                      type="button"
                      className={cn(
                        'group relative aspect-square w-full overflow-hidden rounded-lg border bg-muted/30 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
                      )}
                      onClick={() => toggleItem(item.id)}
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
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            Usar selección ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
