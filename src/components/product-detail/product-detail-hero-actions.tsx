import { FileDown, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroActionsProps {
  onQuoteClick: () => void;
  technicalSheetUrl: string | null;
  className?: string;
  fullWidth?: boolean;
}

const actionClassName =
  'inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-[#0f1f3d] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1f3d]';

export function ProductDetailHeroActions({
  onQuoteClick,
  technicalSheetUrl,
  className,
  fullWidth = false,
}: ProductDetailHeroActionsProps) {
  const itemClassName = cn(actionClassName, fullWidth && 'min-h-11 w-full');

  return (
    <div
      className={cn(
        fullWidth ? 'grid w-full grid-cols-2 gap-2.5' : 'flex shrink-0 flex-wrap items-stretch justify-end gap-2',
        className,
      )}
    >
      <button type="button" onClick={onQuoteClick} className={itemClassName}>
        <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
        Crear Cotización
      </button>

      {technicalSheetUrl ? (
        <a
          href={technicalSheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClassName}
        >
          <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Ficha Técnica PDF
        </a>
      ) : (
        <button
          type="button"
          disabled
          className={cn(itemClassName, 'cursor-not-allowed opacity-50 hover:bg-background')}
          title="Ficha técnica no disponible"
        >
          <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Ficha Técnica PDF
        </button>
      )}
    </div>
  );
}
