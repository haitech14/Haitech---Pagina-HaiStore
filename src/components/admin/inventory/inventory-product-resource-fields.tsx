import type { ChangeEvent } from 'react';
import { useId, useRef, useState } from 'react';
import {
  BookOpen,
  CloudUpload,
  ExternalLink,
  FileText,
  HardDriveDownload,
  Video,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  readAttachmentFile,
  upsertProductAttachment,
} from '@/lib/inventory-attachments';
import {
  getProductVideoUrl,
  readVideoFile,
  setProductVideoUrl,
} from '@/lib/inventory-product';
import { PRODUCT_ATTACHMENT_UPLOAD_HINT, PRODUCT_VIDEO_UPLOAD_HINT } from '@/lib/product-media-upload-limits';
import {
  isYoutubeMediaUrl,
  normalizeYoutubeMediaUrl,
  parseYoutubeVideoId,
  youtubeThumbnailUrl,
} from '@/lib/product-media';
import { cn } from '@/lib/utils';
import type { InventoryProduct, ProductAttachment, ProductAttachmentKind } from '@/types/product';

const FORM_ATTACHMENT_SLOTS = [
  {
    kind: 'technical_sheet' as const,
    label: 'Ficha técnica',
    shortHint: 'PDF o imagen',
    hint: `PDF o imagen. ${PRODUCT_ATTACHMENT_UPLOAD_HINT}.`,
    accept: '.pdf,.doc,.docx,application/pdf,image/*',
    icon: FileText,
  },
  {
    kind: 'printer_driver' as const,
    label: 'Driver',
    shortHint: 'ZIP, EXE o PDF',
    hint: `ZIP, EXE o PDF. ${PRODUCT_ATTACHMENT_UPLOAD_HINT}.`,
    accept: '.pdf,.zip,.exe,.msi,application/pdf,application/zip,application/octet-stream',
    icon: HardDriveDownload,
  },
  {
    kind: 'manual' as const,
    label: 'Manual',
    shortHint: 'PDF o Word',
    hint: `PDF o Word. ${PRODUCT_ATTACHMENT_UPLOAD_HINT}.`,
    accept: '.pdf,.doc,.docx,application/pdf',
    icon: BookOpen,
  },
] as const;

interface InventoryProductResourceFieldsProps {
  form: InventoryProduct;
  onAttachmentsChange: (attachments: ProductAttachment[]) => void;
  onVideoChange: (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => void;
  onError?: ((message: string) => void) | undefined;
  /** Compact 4-tile strip matching the mockup. */
  compact?: boolean;
}

function findAttachment(
  attachments: ProductAttachment[] | undefined,
  kind: ProductAttachmentKind,
): ProductAttachment | undefined {
  return attachments?.find((attachment) => attachment.kind === kind);
}

interface ResourceSlotProps {
  label: string;
  hint: string;
  shortHint?: string;
  accept: string;
  icon: typeof FileText;
  attachment?: ProductAttachment | undefined;
  onFile: (file: File) => void | Promise<void>;
  onRemove: () => void;
  compact?: boolean;
}

function ResourceSlot({
  label,
  hint,
  shortHint,
  accept,
  icon: Icon,
  attachment,
  onFile,
  onRemove,
  compact = false,
}: ResourceSlotProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void onFile(file);
  };

  if (compact) {
    return (
      <div className="min-w-0 space-y-1.5">
        {attachment ? (
          <div className="relative flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-md border border-border bg-muted/15 px-2 py-3 text-center">
            <Icon className="size-5 text-slate-500" aria-hidden="true" />
            <p className="line-clamp-1 text-xs font-medium">{label}</p>
            <p className="line-clamp-1 text-[0.65rem] text-muted-foreground">
              {attachment.file_name ?? 'Archivo'}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-7 items-center justify-center rounded-md text-primary hover:bg-muted"
                aria-label={`Abrir ${label}`}
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                aria-label={`Quitar ${label}`}
                onClick={onRemove}
              >
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              'flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1 rounded-md',
              'border border-dashed border-border bg-muted/10 px-2 py-3 text-center',
              'transition-colors hover:border-muted-foreground/40 hover:bg-muted/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onClick={() => inputRef.current?.click()}
          >
            <Icon className="size-5 text-slate-500" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground">{label}</span>
            <span className="text-[0.65rem] leading-snug text-muted-foreground">
              {shortHint ?? hint}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </Label>
      {attachment ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/15 px-3 py-2.5">
          <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{attachment.label}</p>
            <p className="truncate text-xs text-muted-foreground">
              {attachment.file_name ?? 'Archivo adjunto'}
            </p>
          </div>
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Abrir ${label}`}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive hover:text-destructive"
            aria-label={`Quitar ${label}`}
            onClick={onRemove}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            'flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-md',
            'border border-dashed border-border bg-muted/15 px-3 py-5 text-center',
            'transition-colors hover:border-muted-foreground/40 hover:bg-muted/25',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
          onClick={() => inputRef.current?.click()}
        >
          <CloudUpload className="size-7 text-muted-foreground/80" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Subir archivo</span>
          <span className="max-w-[11rem] text-xs leading-snug text-muted-foreground">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}

function VideoResourceSlot({
  videoUrl,
  onFile,
  onYoutube,
  onRemove,
  onError,
  compact = false,
}: {
  videoUrl: string | null;
  onFile: (file: File) => void | Promise<void>;
  onYoutube: (url: string) => void | Promise<void>;
  onRemove: () => void;
  onError?: ((message: string) => void) | undefined;
  compact?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [showYoutube, setShowYoutube] = useState(false);

  const youtubeId = videoUrl && isYoutubeMediaUrl(videoUrl) ? parseYoutubeVideoId(videoUrl) : null;
  const previewSrc = youtubeId ? youtubeThumbnailUrl(youtubeId) : null;

  const handleYoutube = () => {
    const normalized = normalizeYoutubeMediaUrl(youtubeInput);
    if (!normalized) {
      onError?.('URL de YouTube inválida');
      return;
    }
    void onYoutube(normalized);
    setYoutubeInput('');
    setShowYoutube(false);
  };

  if (compact) {
    return (
      <div className="min-w-0 space-y-1.5">
        {videoUrl ? (
          <div className="relative flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-md border border-border bg-muted/15 px-2 py-3 text-center">
            {previewSrc ? (
              <img src={previewSrc} alt="" className="mb-1 h-8 w-12 rounded object-cover" />
            ) : (
              <Video className="size-5 text-slate-500" aria-hidden="true" />
            )}
            <p className="text-xs font-medium">Video</p>
            <p className="line-clamp-1 text-[0.65rem] text-muted-foreground">
              {youtubeId ? `YouTube · ${youtubeId}` : 'MP4'}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              aria-label="Quitar video"
              onClick={onRemove}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              type="button"
              className={cn(
                'flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1 rounded-md',
                'border border-dashed border-border bg-muted/10 px-2 py-3 text-center',
                'transition-colors hover:border-muted-foreground/40 hover:bg-muted/20',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              onClick={() => inputRef.current?.click()}
            >
              <Video className="size-5 text-slate-500" aria-hidden="true" />
              <span className="text-xs font-medium text-foreground">Video</span>
              <span className="text-[0.65rem] leading-snug text-muted-foreground">MP4 o YouTube</span>
            </button>
            <button
              type="button"
              className="w-full text-[0.65rem] text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setShowYoutube((value) => !value)}
            >
              {showYoutube ? 'Ocultar enlace' : 'Pegar YouTube'}
            </button>
            {showYoutube ? (
              <div className="flex gap-1">
                <Input
                  value={youtubeInput}
                  onChange={(event) => setYoutubeInput(event.target.value)}
                  placeholder="URL YouTube"
                  className="h-8 text-[0.65rem]"
                />
                <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={handleYoutube}>
                  OK
                </Button>
              </div>
            ) : null}
          </div>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="video/mp4,.mp4"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void onFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        Video
      </Label>
      {videoUrl ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/15 p-3">
          <div className="relative overflow-hidden rounded-md border bg-background">
            {previewSrc ? (
              <img src={previewSrc} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted/40">
                <Video className="size-8 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 size-8 bg-background/90 text-destructive hover:text-destructive"
              aria-label="Quitar video"
              onClick={onRemove}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {youtubeId ? `YouTube · ${youtubeId}` : 'Vídeo MP4 adjunto'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            className={cn(
              'flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-md',
              'border border-dashed border-border bg-muted/15 px-3 py-5 text-center',
              'transition-colors hover:border-muted-foreground/40 hover:bg-muted/25',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload className="size-7 text-muted-foreground/80" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Subir MP4</span>
            <span className="max-w-[11rem] text-xs leading-snug text-muted-foreground">
              O pega un enlace de YouTube abajo. {PRODUCT_VIDEO_UPLOAD_HINT}.
            </span>
          </button>
          <div className="flex gap-2">
            <Input
              value={youtubeInput}
              onChange={(event) => setYoutubeInput(event.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="h-9 text-xs"
            />
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleYoutube}>
              Añadir
            </Button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="video/mp4,.mp4"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void onFile(file);
        }}
      />
    </div>
  );
}

export function InventoryProductResourceFields({
  form,
  onAttachmentsChange,
  onVideoChange,
  onError,
  compact = false,
}: InventoryProductResourceFieldsProps) {
  const attachments = form.attachments ?? [];
  const videoUrl = getProductVideoUrl(form);

  const setAttachment = (attachment: ProductAttachment) => {
    onAttachmentsChange(upsertProductAttachment(attachments, attachment));
  };

  const removeAttachment = (kind: ProductAttachmentKind) => {
    onAttachmentsChange(attachments.filter((row) => row.kind !== kind));
  };

  const handleAttachmentFile = async (kind: ProductAttachmentKind, file: File) => {
    try {
      const attachment = await readAttachmentFile(file, kind);
      setAttachment(attachment);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'No se pudo adjuntar el archivo.');
    }
  };

  const handleVideoFile = async (file: File) => {
    try {
      const url = await readVideoFile(file);
      onVideoChange(setProductVideoUrl(form, url));
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'No se pudo adjuntar el vídeo.');
    }
  };

  const handleYoutube = async (url: string) => {
    onVideoChange(setProductVideoUrl(form, url));
  };

  const removeVideo = () => {
    onVideoChange(setProductVideoUrl(form, null));
  };

  return (
    <div className={cn(compact ? 'grid grid-cols-2 gap-2 sm:grid-cols-4' : 'grid gap-4 sm:grid-cols-2')}>
      {FORM_ATTACHMENT_SLOTS.map((slot) => (
        <ResourceSlot
          key={slot.kind}
          label={slot.label}
          hint={slot.hint}
          shortHint={slot.shortHint}
          accept={slot.accept}
          icon={slot.icon}
          attachment={findAttachment(attachments, slot.kind)}
          onFile={(file) => handleAttachmentFile(slot.kind, file)}
          onRemove={() => removeAttachment(slot.kind)}
          compact={compact}
        />
      ))}
      <VideoResourceSlot
        videoUrl={videoUrl}
        onFile={handleVideoFile}
        onYoutube={handleYoutube}
        onRemove={removeVideo}
        onError={onError}
        compact={compact}
      />
    </div>
  );
}
