import { ArrowRight, Calculator, FileText, Share2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroActionsProps {
  onTechnicalSheetClick?: () => void;
  onQuoteClick?: () => void;
  onShareClick?: () => void;
  className?: string;
}

const actionButtonClass =
  'inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3.5 text-xs font-semibold text-[#0f1f3d] transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

export function ProductDetailHeroActions({
  onTechnicalSheetClick,
  onQuoteClick,
  onShareClick,
  className,
}: ProductDetailHeroActionsProps) {
  if (!onTechnicalSheetClick && !onQuoteClick && !onShareClick) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {onTechnicalSheetClick ? (
        <button type="button" onClick={onTechnicalSheetClick} className={actionButtonClass}>
          <FileText className="size-3.5 shrink-0" aria-hidden="true" />
          Ficha Técnica
        </button>
      ) : null}
      {onQuoteClick ? (
        <button type="button" onClick={onQuoteClick} className={actionButtonClass}>
          <Calculator className="size-3.5 shrink-0" aria-hidden="true" />
          Crear cotización
          <ArrowRight className="size-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
        </button>
      ) : null}
      {onShareClick ? (
        <button type="button" onClick={onShareClick} className={actionButtonClass}>
          <Share2 className="size-3.5 shrink-0" aria-hidden="true" />
          Compartir
        </button>
      ) : null}
    </div>
  );
}
