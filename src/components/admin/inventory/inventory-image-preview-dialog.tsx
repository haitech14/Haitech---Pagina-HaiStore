import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, Play, Star, Trash2, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  appendGalleryImagesToProduct,
  appendGalleryVideosToProduct,
  appendYoutubeToProduct,
  getProductMediaUrls,
  readImageFile,
  removeProductMediaUrl,
  replaceProductMediaUrl,
  setProductMainMediaUrl,
} from '@/lib/inventory-product';
import {
  isImageMediaUrl,
  isVideoMediaUrl,
  isYoutubeMediaUrl,
  mediaPreviewUrl,
  youtubeEmbedUrl,
} from '@/lib/product-media';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

interface InventoryImagePreviewDialogProps {
  product: InventoryProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string | null;
  onSaveMedia?: (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => Promise<void>;
}

function MediaPreview({
  url,
  productName,
}: {
  url: string;
  productName: string;
}) {
  if (isYoutubeMediaUrl(url)) {
    const youtubeId = url.slice(8);
    return (
      <iframe
        title={`Vídeo de ${productName}`}
        src={youtubeEmbedUrl(youtubeId)}
        className="aspect-video w-full max-h-[min(70vh,42rem)] rounded-md border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isVideoMediaUrl(url)) {
    return (
      <video
        src={url}
        controls
        className="max-h-[min(70vh,42rem)] w-full rounded-md bg-black object-contain"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <img
      src={url}
      alt={productName ? `Vista ampliada: ${productName}` : 'Vista ampliada'}
      className="max-h-[min(70vh,42rem)] w-full object-contain pointer-events-none"
    />
  );
}

export function InventoryImagePreviewDialog({
  product,
  open,
  onOpenChange,
  initialUrl,
  onSaveMedia,
}: InventoryImagePreviewDialogProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const addVideoInputRef = useRef<HTMLInputElement>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

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
  const currentIsImage = Boolean(current && isImageMediaUrl(current));

  useEffect(() => {
    if (!open) {
      setActiveUrl(null);
      setError(null);
      setYoutubeOpen(false);
      setYoutubeUrl('');
    }
  }, [open]);

  const persist = async (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => {
    if (!onSaveMedia) return;
    setBusy(true);
    setError(null);
    try {
      await onSaveMedia(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el medio.');
    } finally {
      setBusy(false);
    }
  };

  const handleReplaceFile = async (file: File | undefined) => {
    if (!file || !product || !canEdit || !current) return;
    if (!isImageMediaUrl(current)) {
      setError('Solo puedes reemplazar imágenes. Elimina el vídeo y agrega uno nuevo.');
      return;
    }
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

  const handleAddImages = async (files: FileList | null) => {
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

  const handleAddVideos = async (files: FileList | null) => {
    if (!files?.length || !product || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const media = await appendGalleryVideosToProduct(product, [...files]);
      await persist(media);
      const nextUrls = getProductMediaUrls({ ...product, ...media });
      setActiveUrl(nextUrls[nextUrls.length - 1] ?? media.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron agregar los vídeos.');
      setBusy(false);
    }
  };

  const handleAddYoutube = async () => {
    if (!product || !canEdit || !youtubeUrl.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const media = appendYoutubeToProduct(product, youtubeUrl);
      await persist(media);
      const nextUrls = getProductMediaUrls({ ...product, ...media });
      setActiveUrl(nextUrls[nextUrls.length - 1] ?? media.image_url);
      setYoutubeUrl('');
      setYoutubeOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'URL de YouTube inválida.');
      setBusy(false);
    }
  };

  const handleSetMain = async () => {
    if (!product || !current || !canEdit || isMain || !currentIsImage) return;
    await persist(setProductMainMediaUrl(product, current));
  };

  const handleRemove = async () => {
    if (!product || !current || !canEdit) return;
    if (!window.confirm('¿Quitar este medio del producto?')) return;
    const media = removeProductMediaUrl(product, current);
    await persist(media);
    const nextUrls = getProductMediaUrls({ ...product, ...media });
    setActiveUrl(nextUrls[0] ?? null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setActiveUrl(null);
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl gap-4 overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-balance">{product?.name ?? 'Galería'}</DialogTitle>
            <DialogDescription>
              {canEdit
                ? 'Gestiona imágenes y vídeos del producto. Haz clic en una imagen para reemplazarla.'
                : 'Vista ampliada de los medios del producto.'}
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
            ref={addImageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => void handleAddImages(event.target.files)}
          />
          <input
            ref={addVideoInputRef}
            type="file"
            accept="video/mp4,.mp4"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => void handleAddVideos(event.target.files)}
          />

          {current ? (
            <div
              className={cn(
                'group relative flex min-h-[12rem] w-full items-center justify-center rounded-lg border bg-muted/30 p-2',
                currentIsImage &&
                  canEdit &&
                  'cursor-pointer transition hover:border-primary/40 hover:bg-muted/50',
              )}
              onClick={() => currentIsImage && canEdit && replaceInputRef.current?.click()}
              onKeyDown={(event) => {
                if (!currentIsImage || !canEdit) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  replaceInputRef.current?.click();
                }
              }}
              role={currentIsImage && canEdit ? 'button' : undefined}
              tabIndex={currentIsImage && canEdit ? 0 : undefined}
              aria-label={
                currentIsImage && canEdit
                  ? `Cambiar imagen de ${product?.name ?? 'producto'}`
                  : undefined
              }
            >
              <MediaPreview url={current} productName={product?.name ?? 'producto'} />
              {currentIsImage && canEdit && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-center text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  Clic para cambiar esta imagen
                </span>
              )}
              {busy && (
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Guardando medio…</span>
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm text-muted-foreground">Sin medios disponibles.</p>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  disabled={busy}
                  onClick={() => addImageInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Subir imagen
                </Button>
              )}
            </div>
          )}

          {urls.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Galería de medios">
              {urls.map((url) => (
                <li key={url} className="relative">
                  <button
                    type="button"
                    className={cn(
                      'relative size-16 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      current === url ? 'border-primary' : 'border-transparent',
                    )}
                    onClick={() => setActiveUrl(url)}
                    aria-label="Ver medio en tamaño grande"
                    aria-current={current === url}
                  >
                    <img
                      src={mediaPreviewUrl(url)}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                    />
                    {!isImageMediaUrl(url) ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <Play className="size-5 text-white" aria-hidden="true" />
                      </span>
                    ) : null}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex size-16 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={busy}
                        aria-label="Agregar medio a la galería"
                      >
                        <ImagePlus className="size-5" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onSelect={() => addImageInputRef.current?.click()}>
                        <ImagePlus className="size-4" aria-hidden="true" />
                        Añadir imagen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setYoutubeOpen(true);
                        }}
                      >
                        <Video className="size-4" aria-hidden="true" />
                        Vídeo de YouTube
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addVideoInputRef.current?.click()}>
                        <Play className="size-4" aria-hidden="true" />
                        Subir vídeo MP4
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              )}
            </ul>
          )}

          {canEdit && current && (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {currentIsImage && (
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
              )}
              {currentIsImage && !isMain && (
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
                disabled={busy}
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

      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar vídeo de YouTube</DialogTitle>
            <DialogDescription>Pega la URL del vídeo para añadirlo a la galería.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="preview-youtube-url">URL de YouTube</Label>
            <Input
              id="preview-youtube-url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setYoutubeOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!youtubeUrl.trim() || busy} onClick={() => void handleAddYoutube()}>
              Agregar vídeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
