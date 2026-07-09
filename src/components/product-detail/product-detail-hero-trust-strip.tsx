import { Gift, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

import { DEFAULT_TRUST_WARRANTY_LABEL } from '@/lib/build-product-detail';
import { GIFT_TRUST_SUBTITLE, GIFT_TRUST_TITLE } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';

interface ProductDetailHeroTrustStripProps {
  warrantyLabel?: string;
  giftSubtitle?: string;
  className?: string;
}

interface TrustItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

function buildTrustItems(warrantyLabel: string, giftSubtitle: string): TrustItem[] {
  return [
    {
      id: 'garantia',
      icon: ShieldCheck,
      title: 'Garantía',
      subtitle: warrantyLabel,
    },
    {
      id: 'envio',
      icon: Truck,
      title: 'Envío gratis',
      subtitle: 'a Lima',
    },
    {
      id: 'regalo',
      icon: Gift,
      title: GIFT_TRUST_TITLE,
      subtitle: giftSubtitle,
    },
  ];
}

export function ProductDetailHeroTrustStrip({
  warrantyLabel = DEFAULT_TRUST_WARRANTY_LABEL,
  giftSubtitle = GIFT_TRUST_SUBTITLE,
  className,
}: ProductDetailHeroTrustStripProps) {
  const items = buildTrustItems(warrantyLabel, giftSubtitle);

  return (
    <section
      aria-label="Beneficios de compra"
      className={cn(
        'flex justify-center rounded-lg bg-white px-2.5 py-3 sm:px-3 sm:py-3.5',
        className,
      )}
    >
      <ul className="flex flex-row items-center justify-center gap-x-5 sm:gap-x-7">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <Icon
                className="size-5 shrink-0 text-red-600 sm:size-6"
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-[#0f1f3d]">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="text-[10px] leading-tight text-neutral-500 sm:text-[11px]">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
