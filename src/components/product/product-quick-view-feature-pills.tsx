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
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
        {label}
      </span>
    </li>
  );
}
