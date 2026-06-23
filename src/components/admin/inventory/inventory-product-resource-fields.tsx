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
    hint: 'PDF o imagen. Máx. 4 MB.',
    accept: '.pdf,.doc,.docx,application/pdf,image/*',
    icon: FileText,
  },
  {
    kind: 'printer_driver' as const,
    label: 'Driver',
    hint: 'ZIP, EXE o PDF. Máx. 4 MB.',
    accept: '.pdf,.zip,.exe,.msi,application/pdf,application/zip,application/octet-stream',
    icon: HardDriveDownload,
  },
  {
    kind: 'manual' as const,
    label: 'Manual de usuario',
    hint: 'PDF o Word. Máx. 4 MB.',
    accept: '.pdf,.doc,.docx,application/pdf',
    icon: BookOpen,
  },
] as const;

interface InventoryProductResourceFieldsProps {
  form: InventoryProduct;
  onAttachmentsChange: (attachments: ProductAttachment[]) => void;
  onVideoChange: (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => void;
  onError?: ((message: string) => void) | undefined;
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
  accept: string;
  icon: typeof FileText;
  attachment?: ProductAttachment | undefined;
  onFile: (file: File) => void | Promise<void>;
  onRemove: () => void;
}

function ResourceSlot({
  label,
  hint,
  accept,
  icon: Icon,
  attachment,
  onFile,
  onRemove,
}: ResourceSlotProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void onFile(file);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </Label>
      {attachment ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/15 px-3 py-2.5">
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
            'flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl',
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
}: {
  videoUrl: string | null;
  onFile: (file: File) => void | Promise<void>;
  onYoutube: (url: string) => void | Promise<void>;
  onRemove: () => void;
  onError?: ((message: string) => void) | undefined;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [youtubeInput, setYoutubeInput] = useState('');

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
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        Video
      </Label>
      {videoUrl ? (
        <div className="space-y-2 rounded-xl border border-border bg-muted/15 p-3">
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
              'flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl',
              'border border-dashed border-border bg-muted/15 px-3 py-5 text-center',
              'transition-colors hover:border-muted-foreground/40 hover:bg-muted/25',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload className="size-7 text-muted-foreground/80" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Subir MP4</span>
            <span className="max-w-[11rem] text-xs leading-snug text-muted-foreground">
              O pega un enlace de YouTube abajo. Máx. 80 MB.
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
    <div className="grid gap-4 sm:grid-cols-2">
      {FORM_ATTACHMENT_SLOTS.map((slot) => (
        <ResourceSlot
          key={slot.kind}
          label={slot.label}
          hint={slot.hint}
          accept={slot.accept}
          icon={slot.icon}
          attachment={findAttachment(attachments, slot.kind)}
          onFile={(file) => handleAttachmentFile(slot.kind, file)}
          onRemove={() => removeAttachment(slot.kind)}
        />
      ))}
      <VideoResourceSlot
        videoUrl={videoUrl}
        onFile={handleVideoFile}
        onYoutube={handleYoutube}
        onRemove={removeVideo}
        onError={onError}
      />
    </div>
  );
}
