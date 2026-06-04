import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface AdminHtmlPreview {
  url: string;
  title: string;
  description?: string;
}

interface AdminHtmlPreviewDialogProps {
  preview: AdminHtmlPreview | null;
  onOpenChange: (open: boolean) => void;
  onPrint?: () => void;
}

export function AdminHtmlPreviewDialog({
  preview,
  onOpenChange,
  onPrint,
}: AdminHtmlPreviewDialogProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    if (!preview) return;
    const frame = document.getElementById('admin-html-preview-frame') as HTMLIFrameElement | null;
    frame?.contentWindow?.print();
  };

  return (
    <Dialog open={Boolean(preview)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,900px)] max-w-[min(98vw,900px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="shrink-0 border-b px-6 py-4 pr-14">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
              Vista previa — {preview?.title ?? 'Documento'}
            </DialogTitle>
            <DialogDescription>
              {preview?.description ?? 'Revise el documento antes de imprimir.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {preview && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
              <iframe
                id="admin-html-preview-frame"
                src={preview.url}
                title={preview.title}
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
                onClick={handlePrint}
                className="gap-2 bg-[hsl(var(--admin-accent))] text-white hover:opacity-90 focus-visible:ring-[hsl(var(--admin-accent))] sm:min-w-44"
              >
                <Printer className="size-4" aria-hidden="true" />
                Imprimir
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
