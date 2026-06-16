import { Check, ChevronRight } from 'lucide-react';

import type { ProductComparisonRow } from '@/lib/product-equipment-comparison';
import { cn } from '@/lib/utils';

interface ProductDetailHighlightedSpecsProps {
  rows: ProductComparisonRow[];
  values: Record<string, string | boolean>;
  className?: string;
}

function SpecValue({
  value,
  bold,
}: {
  value: string | boolean | undefined;
  bold?: boolean;
}) {
  if (value === true) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">Sí</span>
      </span>
    );
  }

  return (
    <span className={cn('text-[#0f1f3d]', bold && 'font-bold')}>
      {typeof value === 'string' ? value : '—'}
    </span>
  );
}

export function ProductDetailHighlightedSpecs({
  rows,
  values,
  className,
}: ProductDetailHighlightedSpecsProps) {
  if (rows.length === 0) return null;

  return (
    <ul className={cn('w-full max-w-md space-y-2.5', className)}>
      {rows.map((row) => {
        const value = values[row.id];
        const isVolume = row.id === 'volume';

        return (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-snug text-[#0f1f3d]"
          >
            <ChevronRight className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-medium">{row.label}</span>
            <SpecValue value={value} bold={isVolume} />
          </li>
        );
      })}
    </ul>
  );
}
