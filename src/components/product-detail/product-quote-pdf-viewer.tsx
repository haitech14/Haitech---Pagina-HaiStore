import { useEffect, useMemo, useRef } from 'react';
import { Download, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadQuotePdf } from '@/lib/generate-product-quote-pdf';

export interface QuotePdfPreview {
  url: string;
  filename: string;
  blob: Blob;
  quoteNumber?: string;
}

interface ProductQuotePdfViewerProps {
  preview: QuotePdfPreview | null;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  downloadLabel?: string;
  /** Descarga el PDF al abrir el visor (p. ej. tras generar cotización). */
  autoDownload?: boolean;
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 640px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function ProductQuotePdfViewer({
  preview,
  onOpenChange,
  title = 'Vista previa de cotización',
  description,
  downloadLabel = 'Descargar PDF',
  autoDownload = false,
}: ProductQuotePdfViewerProps) {
  const autoDownloadedKeyRef = useRef<string | null>(null);
  const mobile = useMemo(() => isMobileViewport(), [preview?.url]);

  useEffect(() => {
    if (!preview || !autoDownload) return;
    const key = `${preview.filename}:${preview.quoteNumber ?? preview.url}`;
    if (autoDownloadedKeyRef.current === key) return;
    autoDownloadedKeyRef.current = key;
    downloadQuotePdf(preview.blob, preview.filename);
  }, [autoDownload, preview]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      autoDownloadedKeyRef.current = null;
    }
    onOpenChange(open);
  };

  const handleDownload = () => {
    if (!preview) return;
    downloadQuotePdf(preview.blob, preview.filename);
  };

  return (
    <Dialog open={Boolean(preview)} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,1280px)] max-w-[min(98vw,1280px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="shrink-0 border-b px-4 py-3 pr-14 sm:px-6 sm:py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-red-600" aria-hidden="true" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {description ??
                (preview?.quoteNumber
                  ? `Cotización ${preview.quoteNumber}. Revise el documento antes de descargarlo.`
                  : 'Revise el PDF generado antes de descargarlo o compartirlo con el cliente.')}
            </DialogDescription>
          </DialogHeader>
          {preview && mobile ? (
            <Button
              type="button"
              onClick={handleDownload}
              className="mt-3 w-full gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
            >
              <Download className="size-4" aria-hidden="true" />
              {downloadLabel}
            </Button>
          ) : null}
        </div>

        {preview && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
              {mobile ? (
                <div className="flex size-full min-h-[42vh] flex-col items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-white px-6 py-8 text-center">
                  <FileText className="size-10 text-red-600" aria-hidden="true" />
                  <p className="max-w-sm text-sm text-neutral-600">
                    En el celular, descarga el PDF para abrirlo o compartirlo.
                  </p>
                  <Button
                    type="button"
                    onClick={handleDownload}
                    className="w-full max-w-xs gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    {downloadLabel}
                  </Button>
                </div>
              ) : (
                <iframe
                  src={preview.url}
                  title={`Vista previa ${preview.filename}`}
                  className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white"
                />
              )}
            </div>

            <div className="sticky bottom-0 z-10 flex shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="sm:min-w-32"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600 sm:min-w-44"
              >
                <Download className="size-4" aria-hidden="true" />
                {downloadLabel}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
