import { Headphones, ShieldCheck, Truck } from 'lucide-react';

import { STOREFRONT_PURCHASE_TRUST_ITEMS } from '@/data/storefront-trust';
import { cn } from '@/lib/utils';

interface ProductDetailPurchaseCardTrustProps {
  className?: string;
}

const TRUST_ICONS = {
  garantia: ShieldCheck,
  soporte: Headphones,
  entrega: Truck,
} as const;

export function ProductDetailPurchaseCardTrust({ className }: ProductDetailPurchaseCardTrustProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center',
        className,
      )}
      aria-label="Beneficios de compra"
    >
      {STOREFRONT_PURCHASE_TRUST_ITEMS.map((item) => {
        const Icon = TRUST_ICONS[item.id as keyof typeof TRUST_ICONS] ?? ShieldCheck;
        return (
          <li key={item.id} className="flex min-w-0 flex-col items-center gap-1">
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="text-pretty text-[0.625rem] font-medium leading-tight text-muted-foreground sm:text-[0.6875rem]">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
