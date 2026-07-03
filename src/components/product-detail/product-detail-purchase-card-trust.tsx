import { Headphones, ShieldCheck, Truck } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailPurchaseCardTrustProps {
  className?: string;
}

const TRUST_ITEMS = [
  { id: 'garantia', icon: ShieldCheck, label: 'Garantía 1 año' },
  { id: 'soporte', icon: Headphones, label: 'Soporte especializado' },
  { id: 'entrega', icon: Truck, label: 'Entrega rápida' },
] as const;

export function ProductDetailPurchaseCardTrust({ className }: ProductDetailPurchaseCardTrustProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center',
        className,
      )}
      aria-label="Beneficios de compra"
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="flex min-w-0 flex-col items-center gap-1">
            <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-pretty text-[0.625rem] font-medium leading-tight text-muted-foreground sm:text-[0.6875rem]">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
