import { FileText, ShieldCheck, Truck } from 'lucide-react';

import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { DualPrice } from '@/components/product/product-dual-price';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { cn } from '@/lib/utils';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Pago seguro' },
  { icon: FileText, label: 'Factura disponible' },
  { icon: Truck, label: 'Envío a todo Perú' },
] as const;

interface ProductQuickViewPricingBoxProps {
  productId: string;
  priceUsd: number;
  oldPriceUsd?: number;
  discountPercent?: number;
  className?: string;
}

export function ProductQuickViewPricingBox({
  productId,
  priceUsd,
  oldPriceUsd,
  discountPercent,
  className,
}: ProductQuickViewPricingBoxProps) {
  const pricing = resolveProductCardPricing(productId, priceUsd, {
    ...(oldPriceUsd != null ? { oldPrice: oldPriceUsd } : {}),
    ...(discountPercent != null ? { discount: discountPercent } : {}),
  });
  const onRequest = isPriceOnRequest(pricing.currentUsd);

  return (
    <section
      className={cn('rounded-lg border border-border bg-muted/15 px-4 py-3.5 sm:px-5 sm:py-4', className)}
      aria-label="Precio del producto"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {onRequest ? (
          <p className="text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
            {CONSULTAR_PRECIO_LABEL}
          </p>
        ) : (
          <AdminRolePricesTooltip productId={productId} displayUsd={pricing.currentUsd}>
            <p className="text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
              <DualPrice usd={pricing.currentUsd} />
            </p>
          </AdminRolePricesTooltip>
        )}
        {!onRequest ? (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            {pricing.discountPercent}% DSCTO
          </span>
        ) : null}
      </div>

      {!onRequest ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Antes:{' '}
          <DualPrice usd={pricing.compareUsd} strikethrough className="inline" />
        </p>
      ) : null}

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-3">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
