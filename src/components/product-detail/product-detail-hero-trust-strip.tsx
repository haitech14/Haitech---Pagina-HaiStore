import { useId, useState } from 'react';
import { Gift, ShieldCheck, type LucideIcon } from 'lucide-react';

import { TRUST_GIFT_CHIP_LABEL, TRUST_WARRANTY_CHIP_LABEL } from '@/lib/build-product-detail';
import { GIFT_TRUST_SUBTITLE } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';

interface ProductDetailHeroTrustStripProps {
  giftSubtitle?: string;
  className?: string;
}

interface TrustItem {
  id: string;
  icon: LucideIcon;
  label: string;
  detail: string;
}

function buildTrustItems(giftSubtitle: string): TrustItem[] {
  return [
    {
      id: 'garantia',
      icon: ShieldCheck,
      label: TRUST_WARRANTY_CHIP_LABEL,
      detail: `${TRUST_WARRANTY_CHIP_LABEL}. Soporte técnico pre y postventa.`,
    },
    {
      id: 'regalo',
      icon: Gift,
      label: TRUST_GIFT_CHIP_LABEL,
      detail: giftSubtitle || TRUST_GIFT_CHIP_LABEL,
    },
  ];
}

function TrustChip({ item }: { item: TrustItem }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const Icon = item.icon;

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className={cn(
          'inline-flex max-w-[11.5rem] items-start gap-1.5 whitespace-normal rounded-full px-0.5 py-0 text-left text-[11px] leading-snug text-[#0f1f3d] sm:max-w-[15rem] sm:text-xs md:max-w-[18rem] lg:max-w-none',
          'hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        )}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon className="mt-0.5 size-3.5 shrink-0 text-red-600" strokeWidth={2} aria-hidden="true" />
        <span>{item.label}</span>
      </button>
      {open ? (
        <p
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[16rem] -translate-x-1/2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[0.6875rem] leading-snug text-neutral-600 shadow-md"
        >
          {item.detail}
        </p>
      ) : null}
    </div>
  );
}

export function ProductDetailHeroTrustStrip({
  giftSubtitle = GIFT_TRUST_SUBTITLE,
  className,
}: ProductDetailHeroTrustStripProps) {
  const items = buildTrustItems(giftSubtitle);

  return (
    <section
      aria-label="Beneficios comerciales"
      className={cn(
        'px-2 py-0 sm:px-3',
        className,
      )}
    >
      <ul className="flex flex-wrap items-start justify-center gap-y-1.5">
        {items.map((item, index) => (
          <li key={item.id} className="flex min-w-0 items-start">
            <TrustChip item={item} />
            {index < items.length - 1 ? (
              <span className="mx-1.5 mt-0.5 shrink-0 text-neutral-300 sm:mx-2" aria-hidden="true">
                |
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
