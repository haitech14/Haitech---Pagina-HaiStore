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
  title = 'Ficha técnica',
  description = 'Revise el documento antes de descargarlo.',
}: AttachmentPdfViewerProps) {
  const handleDownload = () => {
    downloadProductAttachment(url, filename);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,1280px)] max-w-[min(98vw,1280px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="shrink-0 border-b px-6 py-4 pr-14">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-red-600" aria-hidden="true" />
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
          <iframe
            src={url}
            title={`Vista previa ${filename}`}
            className="size-full min-h-[72vh] rounded-lg border border-neutral-200 bg-white"
          />
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
            Descargar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
