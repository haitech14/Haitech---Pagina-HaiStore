import { useEffect, useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadProductAttachment } from '@/lib/inventory-attachments';

interface AttachmentPdfViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  filename: string;
  title?: string;
  description?: string;
}

function withPdfToolbar(src: string): string {
  if (!src || src.startsWith('data:') || src.includes('#')) return src;
  return `${src}#toolbar=1&navpanes=0`;
}

function ensurePdfBlob(blob: Blob): Blob {
  return blob.type.toLowerCase().includes('pdf')
    ? blob
    : new Blob([blob], { type: 'application/pdf' });
}

function decodeDataUrlToPdfBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('URL de datos inválida');
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(header)) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  }
  return new Blob([decodeURIComponent(payload)], { type: 'application/pdf' });
}

async function toPdfPreviewBlob(sourceUrl: string): Promise<Blob> {
  if (sourceUrl.startsWith('data:')) {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return ensurePdfBlob(await response.blob());
    } catch {
      return decodeDataUrlToPdfBlob(sourceUrl);
    }
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ensurePdfBlob(await response.blob());
}

export function AttachmentPdfViewer({
  open,
  onOpenChange,
  url,
  filename,
  title = 'Ficha técnica',
  description = 'Revise el PDF en el visor o descárguelo cuando lo necesite.',
}: AttachmentPdfViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !url) {
      setPreviewUrl(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const resolvePreview = async () => {
      if (url.startsWith('blob:')) {
        if (!cancelled) {
          setPreviewUrl(url);
          setError(false);
          setLoading(false);
        }
        return;
      }

      // Drive /preview y embeds similares: cargar directo en el iframe (sin fetch/blob).
      if (/drive\.google\.com\/file\/d\/[^/]+\/preview/i.test(url)) {
        if (!cancelled) {
          setPreviewUrl(url);
          setError(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const pdfBlob = await toPdfPreviewBlob(url);
        objectUrl = URL.createObjectURL(pdfBlob);
        if (!cancelled) setPreviewUrl(objectUrl);
      } catch {
        // Si el fetch falla (CORS), intentar incrustar la URL original.
        if (!cancelled) {
          setPreviewUrl(url);
          setError(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void resolvePreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, url]);

  const handleDownload = () => {
    void downloadProductAttachment(url, filename);
  };

  const iframeSrc = previewUrl ? withPdfToolbar(previewUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,1280px)] max-w-[min(98vw,1280px)] flex-col gap-0 overflow-hidden border-neutral-200 p-0 shadow-2xl sm:rounded-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-3.5 pr-14 sm:px-6 sm:py-4">
          <DialogHeader className="min-w-0 flex-1 space-y-1 text-left">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="size-5 shrink-0 text-red-600" aria-hidden="true" />
              <span className="truncate">{title}</span>
            </DialogTitle>
            <DialogDescription className="text-left">{description}</DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            onClick={handleDownload}
            className="mt-0.5 hidden h-9 shrink-0 gap-2 bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:inline-flex"
          >
            <Download className="size-4" aria-hidden="true" />
            Descargar
          </Button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-neutral-100 px-3 py-3 sm:px-4">
          {loading ? (
            <div className="flex size-full min-h-[72vh] items-center justify-center rounded-lg border border-neutral-200 bg-white">
              <p className="inline-flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Cargando PDF…
              </p>
            </div>
          ) : error || !iframeSrc ? (
            <div className="flex size-full min-h-[72vh] flex-col items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-6 text-center">
              <p className="text-sm text-neutral-600">
                No se pudo mostrar el PDF en el visor. Puede descargarlo para abrirlo.
              </p>
              <Button
                type="button"
                onClick={handleDownload}
                className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar PDF
              </Button>
            </div>
          ) : (
            <iframe
              src={iframeSrc}
              title={`Vista previa ${filename}`}
              className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white shadow-sm"
            />
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-neutral-200 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="truncate text-xs text-neutral-500" title={filename}>
            {filename}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:min-w-28"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600 sm:min-w-36"
            >
              <Download className="size-4" aria-hidden="true" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
