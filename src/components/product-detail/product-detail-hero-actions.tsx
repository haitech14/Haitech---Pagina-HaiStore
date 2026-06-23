import { useState } from 'react';
import { FileDown, FileText, Scale } from 'lucide-react';

import { AttachmentPdfViewer } from '@/components/product-detail/attachment-pdf-viewer';
import {
  downloadProductAttachment,
  isPdfAttachment,
} from '@/lib/inventory-attachments';
import { cn } from '@/lib/utils';

interface ProductDetailHeroActionsProps {
  technicalSheetUrl: string | null;
  technicalSheetFileName?: string | null;
  technicalSheetMimeType?: string | null;
  onCompareClick?: () => void;
  onQuoteClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const actionClassName =
  'inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-[#0f1f3d] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

export function ProductDetailHeroActions({
  technicalSheetUrl,
  technicalSheetFileName,
  technicalSheetMimeType,
  onCompareClick,
  onQuoteClick,
  className,
  fullWidth = false,
}: ProductDetailHeroActionsProps) {
  const [technicalSheetOpen, setTechnicalSheetOpen] = useState(false);
  const itemClassName = cn(actionClassName, fullWidth && 'w-full');
  const columnCount = 2 + (onQuoteClick ? 1 : 0);
  const downloadFileName = technicalSheetFileName?.trim() || 'ficha-tecnica.pdf';
  const canPreviewPdf =
    Boolean(technicalSheetUrl) &&
    isPdfAttachment(technicalSheetUrl ?? '', technicalSheetMimeType, downloadFileName);

  const handleTechnicalSheetClick = () => {
    if (!technicalSheetUrl) return;
    if (canPreviewPdf) {
      setTechnicalSheetOpen(true);
      return;
    }
    downloadProductAttachment(technicalSheetUrl, downloadFileName);
  };

  return (
    <>
      <div
        className={cn(
          fullWidth
            ? cn('grid w-full gap-2.5', columnCount === 3 ? 'grid-cols-3' : 'grid-cols-2')
            : 'flex shrink-0 flex-wrap items-stretch justify-end gap-2',
          className,
        )}
      >
        {technicalSheetUrl ? (
          <button type="button" onClick={handleTechnicalSheetClick} className={itemClassName}>
            <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            Ficha técnica
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={cn(itemClassName, 'cursor-not-allowed opacity-50 hover:bg-background')}
            title="Ficha técnica no disponible"
          >
            <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            Ficha técnica
          </button>
        )}

        {onCompareClick ? (
          <button type="button" onClick={onCompareClick} className={itemClassName}>
            <Scale className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            Comparar
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={cn(itemClassName, 'cursor-not-allowed opacity-50 hover:bg-background')}
            title="Comparación no disponible para este producto"
          >
            <Scale className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            Comparar
          </button>
        )}

        {onQuoteClick ? (
          <button type="button" onClick={onQuoteClick} className={itemClassName}>
            <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            Cotizar
          </button>
        ) : null}
      </div>

      {technicalSheetUrl && canPreviewPdf ? (
        <AttachmentPdfViewer
          open={technicalSheetOpen}
          onOpenChange={setTechnicalSheetOpen}
          url={technicalSheetUrl}
          filename={downloadFileName}
        />
      ) : null}
    </>
  );
}
