import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  appendGalleryImagesToProduct,
  getProductMediaUrls,
  readImageFile,
  removeProductMediaUrl,
  replaceProductMediaUrl,
  setProductMainMediaUrl,
} from '@/lib/inventory-product';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

interface InventoryImagePreviewDialogProps {
  product: InventoryProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string | null;
  onSaveMedia?: (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => Promise<void>;
}

export function InventoryImagePreviewDialog({
  product,
  open,
  onOpenChange,
  initialUrl,
  onSaveMedia,
}: InventoryImagePreviewDialogProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urls = useMemo(
    () => (product ? getProductMediaUrls(product) : []),
    [product?.id, product?.image_url, product?.gallery],
  );
  const current =
    activeUrl && urls.includes(activeUrl)
      ? activeUrl
      : initialUrl && urls.includes(initialUrl)
        ? initialUrl
        : urls[0] ?? null;
  const isMain = Boolean(product && current && product.image_url === current);
  const canEdit = Boolean(product && onSaveMedia);

  useEffect(() => {
    if (!open) {
      setActiveUrl(null);
      setError(null);
    }
  }, [open]);

  const persist = async (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => {
    if (!onSaveMedia) return;
    setBusy(true);
    setError(null);
    try {
      await onSaveMedia(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la imagen.');
    } finally {
      setBusy(false);
    }
  };

  const handleReplaceFile = async (file: File | undefined) => {
    if (!file || !product || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const newUrl = await readImageFile(file);
      const media = replaceProductMediaUrl(product, current, newUrl);
      await persist(media);
      setActiveUrl(newUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.');
      setBusy(false);
    }
  };

  const handleAddFiles = async (files: FileList | null) => {
    if (!files?.length || !product || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const media = await appendGalleryImagesToProduct(product, [...files]);
      await persist(media);
      const nextUrls = getProductMediaUrls({ ...product, ...media });
      setActiveUrl(nextUrls[nextUrls.length - 1] ?? media.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron agregar las imágenes.');
      setBusy(false);
    }
  };

  const handleSetMain = async () => {
    if (!product || !current || !canEdit || isMain) return;
    await persist(setProductMainMediaUrl(product, current));
  };

  const handleRemove = async () => {
    if (!product || !current || !canEdit) return;
    if (!window.confirm('¿Quitar esta imagen del producto?')) return;
    const media = removeProductMediaUrl(product, current);
    await persist(media);
    const nextUrls = getProductMediaUrls({ ...product, ...media });
    setActiveUrl(nextUrls[0] ?? null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setActiveUrl(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-4xl gap-4 overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-balance">{product?.name ?? 'Imagen'}</DialogTitle>
          <DialogDescription>
            {canEdit
              ? 'Haz clic en la imagen grande para reemplazarla. Usa las miniaturas para cambiar de foto.'
              : 'Vista ampliada del producto. Pulsa una miniatura para cambiar de imagen.'}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => void handleReplaceFile(event.target.files?.[0])}
        />
        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => void handleAddFiles(event.target.files)}
        />

        {current ? (
          <button
            type="button"
            disabled={!canEdit || busy}
            className={cn(
              'group relative flex min-h-[12rem] w-full items-center justify-center rounded-lg border bg-muted/30 p-2',
              canEdit &&
                'cursor-pointer transition hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onClick={() => canEdit && replaceInputRef.current?.click()}
            aria-label={
              canEdit
                ? `Cambiar imagen de ${product?.name ?? 'producto'}`
                : `Vista ampliada: ${product?.name ?? 'producto'}`
            }
          >
            <img
              src={current}
              alt={product ? `Vista ampliada: ${product.name}` : 'Vista ampliada'}
              className="max-h-[min(70vh,42rem)] w-full object-contain pointer-events-none"
            />
            {canEdit && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-center text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Clic para cambiar esta imagen
              </span>
            )}
            {busy && (
              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Guardando imagen…</span>
              </span>
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-muted-foreground">Sin imagen disponible.</p>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={busy}
                onClick={() => addInputRef.current?.click()}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Subir imagen
              </Button>
            )}
          </div>
        )}

        {urls.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Galería de imágenes">
            {urls.map((url) => (
              <li key={url} className="relative">
                <button
                  type="button"
                  className={cn(
                    'size-16 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    current === url ? 'border-primary' : 'border-transparent',
                  )}
                  onClick={() => setActiveUrl(url)}
                  aria-label="Ver imagen en tamaño grande"
                  aria-current={current === url}
                >
                  <img src={url} alt="" className="size-full object-cover" loading="lazy" />
                </button>
                {product?.image_url === url && (
                  <span
                    className="pointer-events-none absolute left-1 top-1 rounded bg-primary px-1 py-0.5 text-[0.6rem] font-medium text-primary-foreground"
                    aria-hidden="true"
                  >
                    Principal
                  </span>
                )}
              </li>
            ))}
            {canEdit && (
              <li>
                <button
                  type="button"
                  className="flex size-16 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={busy}
                  onClick={() => addInputRef.current?.click()}
                  aria-label="Agregar imagen a la galería"
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                </button>
              </li>
            )}
          </ul>
        )}

        {canEdit && current && (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={busy}
              onClick={() => replaceInputRef.current?.click()}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              Cambiar imagen
            </Button>
            {!isMain && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={busy}
                onClick={() => void handleSetMain()}
              >
                <Star className="size-4" aria-hidden="true" />
                Hacer principal
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={busy || urls.length <= 1}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Quitar
            </Button>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
