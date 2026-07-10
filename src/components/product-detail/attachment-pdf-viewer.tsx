import { Download, FileText } from 'lucide-react';

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

export function AttachmentPdfViewer({
  open,
  onOpenChange,
  url,
  filename,
  title = 'Especificaciones técnicas',
  description = 'Vista previa del documento. Puede descargarlo cuando lo necesite.',
}: AttachmentPdfViewerProps) {
  const handleDownload = () => {
    downloadProductAttachment(url, filename);
  };

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

        <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-3 py-3 sm:px-4">
          <iframe
            src={url}
            title={`Vista previa ${filename}`}
            className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white shadow-sm"
          />
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
              Descargar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
