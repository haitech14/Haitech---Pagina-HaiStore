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

export interface AdminPdfPreview {
  url: string;
  filename: string;
  blob: Blob;
  documentNumber: string;
  documentLabel: string;
}

interface AdminPdfPreviewDialogProps {
  preview: AdminPdfPreview | null;
  onOpenChange: (open: boolean) => void;
}

export function AdminPdfPreviewDialog({ preview, onOpenChange }: AdminPdfPreviewDialogProps) {
  const handleDownload = () => {
    if (!preview) return;
    downloadQuotePdf(preview.blob, preview.filename);
  };

  return (
    <Dialog open={Boolean(preview)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,1280px)] max-w-[min(98vw,1280px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="shrink-0 border-b px-6 py-4 pr-14">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
              Vista previa — {preview?.documentLabel ?? 'Documento'}
            </DialogTitle>
            <DialogDescription>
              {preview?.documentNumber
                ? `${preview.documentLabel} ${preview.documentNumber}. Revise antes de descargar o imprimir.`
                : 'Revise el PDF generado.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {preview && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
              <object
                data={preview.url}
                type="application/pdf"
                title={`Vista previa ${preview.filename}`}
                className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white"
              >
                <iframe
                  src={preview.url}
                  title={`Vista previa ${preview.filename}`}
                  className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white"
                />
              </object>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="sm:min-w-32">
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                className="gap-2 bg-[hsl(var(--admin-accent))] text-white hover:opacity-90 focus-visible:ring-[hsl(var(--admin-accent))] sm:min-w-44"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
