import { BadgeCheck, ShieldCheck, Store } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailMockupTrustBadgesProps {
  className?: string;
}

const TRUST_ITEMS = [
  { id: 'seller', icon: Store, label: 'Vendido por Haitech' },
  { id: 'original', icon: ShieldCheck, label: 'Producto original' },
  { id: 'warranty', icon: BadgeCheck, label: 'Garantía oficial' },
] as const;

export function ProductDetailMockupTrustBadges({ className }: ProductDetailMockupTrustBadgesProps) {
  return (
    <ul
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}
      aria-label="Confianza del producto"
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
            <Icon className="size-3.5 shrink-0 text-neutral-400" strokeWidth={1.75} aria-hidden="true" />
            <span className="font-medium">{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
