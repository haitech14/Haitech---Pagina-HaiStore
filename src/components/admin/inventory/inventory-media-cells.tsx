import { useRef, useState } from 'react';
import {
  BookOpen,
  Cpu,
  FileText,
  ImageIcon,
  Loader2,
  Play,
  Plus,
  Printer,
  Video,
} from 'lucide-react';

import { PRODUCT_ATTACHMENT_LABELS } from '@/lib/inventory-attachments';
import {
  formatUploadBytes,
  MAX_PRODUCT_IMAGE_UPLOAD_BYTES,
  PRODUCT_VIDEO_UPLOAD_HINT,
} from '@/lib/product-media-upload-limits';
import { getProductMediaUrls } from '@/lib/inventory-product';
import { isImageMediaUrl, mediaPreviewUrl } from '@/lib/product-media';
import { ProductCardImage } from '@/components/product/product-card-image';
import { cn } from '@/lib/utils';
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
import type { InventoryProduct, ProductAttachmentKind } from '@/types/product';

const DOCUMENT_ATTACHMENT_KINDS = [
  'technical_sheet',
  'printer_driver',
  'manual',
  'firmware',
] as const satisfies readonly ProductAttachmentKind[];

const ATTACHMENT_ACCEPT =
  '.pdf,.doc,.docx,.zip,.exe,.bin,application/pdf,application/zip,application/octet-stream';

function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        'size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted',
        className,
      )}
    >
      <ProductCardImage src={src} alt={alt} className="size-full object-cover" />
    </div>
  );
}

const slotButtonClass =
  'flex size-11 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

interface InventoryMediaCellProps {
  product: InventoryProduct;
  onPreview?: () => void;
  /** Sube la foto principal (primer archivo). */
  onUploadMain?: (files: FileList) => void | Promise<void>;
  /** Añade imágenes a la galería. */
  onAddGallery?: (files: FileList) => void | Promise<void>;
  /** Añade vídeos MP4 a la galería. */
  onAddVideo?: (files: FileList) => void | Promise<void>;
  /** Añade un vídeo de YouTube por URL. */
  onAddYoutube?: (url: string) => void | Promise<void>;
  /** Adjunta ficha técnica, driver, manual o firmware. */
  onAddAttachment?: (kind: ProductAttachmentKind, file: File) => void | Promise<void>;
  isAddingGallery?: boolean;
}

/** Foto principal, botón de imagen para subir y menú + para galería. */
export function InventoryMediaCell({
  product,
  onPreview,
  onUploadMain,
  onAddGallery,
  onAddVideo,
  onAddYoutube,
  onAddAttachment,
  isAddingGallery = false,
}: InventoryMediaCellProps) {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachmentKind, setPendingAttachmentKind] = useState<ProductAttachmentKind | null>(
    null,
  );
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  const urls = getProductMediaUrls(product);
  const main = urls.find((url) => isImageMediaUrl(url)) ?? urls[0] ?? null;
  const extraCount = Math.max(0, urls.length - (main ? 1 : 0));
  const canUploadMain = Boolean(onUploadMain) && !isAddingGallery;
  const canAddMedia =
    Boolean(onAddGallery || onAddVideo || onAddYoutube || onAddAttachment) && !isAddingGallery;

  const thumbButtonClass =
    'rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  const openMainPicker = () => {
    if (canUploadMain) mainInputRef.current?.click();
  };

  const submitYoutube = async () => {
    if (!onAddYoutube) return;
    setYoutubeError(null);
    try {
      await onAddYoutube(youtubeUrl);
      setYoutubeUrl('');
      setYoutubeOpen(false);
    } catch (error) {
      setYoutubeError(error instanceof Error ? error.message : 'URL de YouTube inválida');
    }
  };

  const mainInput = onUploadMain ? (
    <input
      ref={mainInputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onUploadMain(files);
        event.target.value = '';
      }}
    />
  ) : null;

  const galleryInput = onAddGallery ? (
    <input
      ref={galleryInputRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onAddGallery(files);
        event.target.value = '';
      }}
    />
  ) : null;

  const videoInput = onAddVideo ? (
    <input
      ref={videoInputRef}
      type="file"
      accept="video/mp4,.mp4"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onAddVideo(files);
        event.target.value = '';
      }}
    />
  ) : null;

  const attachmentInput = onAddAttachment ? (
    <input
      ref={attachmentInputRef}
      type="file"
      accept={ATTACHMENT_ACCEPT}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        const kind = pendingAttachmentKind;
        event.target.value = '';
        setPendingAttachmentKind(null);
        if (file && kind) void onAddAttachment(kind, file);
      }}
    />
  ) : null;

  const openAttachmentPicker = (kind: ProductAttachmentKind) => {
    if (!onAddAttachment) return;
    setPendingAttachmentKind(kind);
    window.setTimeout(() => attachmentInputRef.current?.click(), 0);
  };

  const attachmentMenuIcon = (kind: (typeof DOCUMENT_ATTACHMENT_KINDS)[number]) => {
    switch (kind) {
      case 'technical_sheet':
        return FileText;
      case 'printer_driver':
        return Printer;
      case 'manual':
        return BookOpen;
      case 'firmware':
        return Cpu;
      default:
        return FileText;
    }
  };

  const mainImageSlot = main ? (
    <button
      type="button"
      className={cn(thumbButtonClass, 'relative')}
      onClick={onPreview}
      aria-label={`Ampliar medios de ${product.name}`}
    >
      <Thumb src={mediaPreviewUrl(main)} alt={`Foto de ${product.name}`} />
      {extraCount > 0 ? (
        <span className="absolute -bottom-1 -right-1 rounded bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">
          +{extraCount}
        </span>
      ) : null}
    </button>
  ) : null;

  const mainSlot = main ? (
    <div className="flex flex-col items-center gap-0.5">
      {mainImageSlot}
      <p className="max-w-[7.5rem] text-center text-xs leading-none text-muted-foreground">
        *Imagen Referencial
      </p>
    </div>
  ) : (
    <button
      type="button"
      className={slotButtonClass}
      onClick={openMainPicker}
      disabled={!canUploadMain}
      aria-label={`Subir foto principal de ${product.name}`}
    >
      {isAddingGallery ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <ImageIcon className="size-4" aria-hidden="true" />
      )}
    </button>
  );

  const addButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={slotButtonClass}
          disabled={!canAddMedia}
          aria-label={`Agregar medios a la galería de ${product.name}`}
        >
          {isAddingGallery ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {onAddGallery ? (
          <DropdownMenuItem onSelect={() => galleryInputRef.current?.click()}>
            <ImageIcon className="size-4" aria-hidden="true" />
            Añadir imagen
          </DropdownMenuItem>
        ) : null}
        {onAddYoutube ? (
          <DropdownMenuItem
            onSelect={() => {
              setYoutubeError(null);
              setYoutubeOpen(true);
            }}
          >
            <Video className="size-4" aria-hidden="true" />
            Vídeo de YouTube
          </DropdownMenuItem>
        ) : null}
        {onAddVideo ? (
          <DropdownMenuItem onSelect={() => videoInputRef.current?.click()}>
            <Play className="size-4" aria-hidden="true" />
            Subir vídeo MP4
          </DropdownMenuItem>
        ) : null}
        {onAddAttachment
          ? DOCUMENT_ATTACHMENT_KINDS.map((kind) => {
              const Icon = attachmentMenuIcon(kind);
              return (
                <DropdownMenuItem key={kind} onSelect={() => openAttachmentPicker(kind)}>
                  <Icon className="size-4" aria-hidden="true" />
                  {PRODUCT_ATTACHMENT_LABELS[kind]}
                </DropdownMenuItem>
              );
            })
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {mainInput}
      {galleryInput}
      {videoInput}
      {attachmentInput}
      {mainSlot}
      {addButton}
      {canAddMedia ? (
        <p className="max-w-[7.5rem] text-center text-[0.625rem] leading-snug text-muted-foreground">
          máx. {formatUploadBytes(MAX_PRODUCT_IMAGE_UPLOAD_BYTES)}/img
        </p>
      ) : null}

      <Dialog
        open={youtubeOpen}
        onOpenChange={(open) => {
          setYoutubeOpen(open);
          if (!open) {
            setYoutubeError(null);
            setYoutubeUrl('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar vídeo de YouTube</DialogTitle>
            <DialogDescription>
              Pega la URL del vídeo (youtube.com o youtu.be). Se mostrará en la galería del producto.
              {PRODUCT_VIDEO_UPLOAD_HINT ? ` ${PRODUCT_VIDEO_UPLOAD_HINT}.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`youtube-url-${product.id}`}>URL de YouTube</Label>
            <Input
              id={`youtube-url-${product.id}`}
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              autoComplete="off"
            />
            {youtubeError ? (
              <p role="alert" className="text-sm text-destructive">
                {youtubeError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setYoutubeOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!youtubeUrl.trim() || isAddingGallery} onClick={() => void submitYoutube()}>
              Agregar vídeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
