import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

function formatProductCount(count: number): string {
  return `(${count} ${count === 1 ? 'producto' : 'productos'})`;
}

interface CatalogFormatMainHeaderProps {
  title: string;
  count: number;
  className?: string;
}

export function CatalogFormatMainHeader({ title, count, className }: CatalogFormatMainHeaderProps) {
  return (
    <div className={cn('border-b border-border/70 pb-3 sm:pb-3.5', className)}>
      <div className="flex flex-wrap items-end gap-2 border-l-4 border-red-600 pl-3">
        <h2 className="text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl">
          {title}
        </h2>
        <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
          {formatProductCount(count)}
        </span>
      </div>
    </div>
  );
}

interface CatalogFormatSubHeaderProps {
  title: string;
  count: number;
  viewAllHref: string;
  viewAllLabel?: string;
  className?: string;
}

export function CatalogFormatSubHeader({
  title,
  count,
  viewAllHref,
  viewAllLabel = 'Ver todos',
  className,
}: CatalogFormatSubHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-3 border-b border-border/50 pb-3',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-end gap-2">
          <h3 className="text-balance text-sm font-bold text-[#0f1f3d] sm:text-base">{title}</h3>
          <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
            {formatProductCount(count)}
          </span>
        </div>
        <span className="mt-1.5 block h-0.5 w-9 rounded-full bg-red-600" aria-hidden="true" />
      </div>
      <Link
        to={viewAllHref}
        className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border/80 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-600/30 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:text-sm"
      >
        {viewAllLabel}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
