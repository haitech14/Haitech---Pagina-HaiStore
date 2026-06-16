import { FileDown, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroActionsProps {
  onQuoteClick: () => void;
  technicalSheetUrl: string | null;
  className?: string;
  fullWidth?: boolean;
}

const actionClassName =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#0f1f3d]/25 bg-background px-3 text-xs font-medium text-[#0f1f3d] transition-colors hover:border-[#0f1f3d]/45 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1f3d] sm:text-sm';

export function ProductDetailHeroActions({
  onQuoteClick,
  technicalSheetUrl,
  className,
  fullWidth = false,
}: ProductDetailHeroActionsProps) {
  const itemClassName = cn(actionClassName, fullWidth && 'min-h-10 w-full flex-1 sm:w-auto');

  return (
    <div
      className={cn(
        'flex flex-wrap items-stretch gap-2',
        fullWidth ? 'w-full flex-col sm:flex-row' : 'shrink-0 justify-end',
        className,
      )}
    >
      <button type="button" onClick={onQuoteClick} className={itemClassName}>
        <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
        Generar Cotización
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
