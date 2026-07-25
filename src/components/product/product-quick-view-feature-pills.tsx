import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductQuickViewFeaturePillsProps {
  items: ProductDescriptionHighlight[];
  className?: string;
}

export function ProductQuickViewFeaturePills({
  items,
  className,
}: ProductQuickViewFeaturePillsProps) {
  const visible = items.filter((item) => item.title.trim()).slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <ul
      className={cn(
        'flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Características destacadas"
    >
      {visible.map((item) => (
        <FeaturePill key={`${item.title}-${item.subtitle}`} icon={item.icon} label={item.title} />
      ))}
    </ul>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="shrink-0">
      <span className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-neutral-900">
        <Icon className="size-4 shrink-0 text-red-600" strokeWidth={1.75} aria-hidden="true" />
        {label}
      </span>
    </li>
  );
}
