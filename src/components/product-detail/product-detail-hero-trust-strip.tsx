import { useMemo } from 'react';
import { Gift, ShieldCheck, type LucideIcon } from 'lucide-react';

import {
  TRUST_GIFT_CHIP_LABEL,
  resolveTrustWarrantyLabel,
} from '@/lib/build-product-detail';
import { GIFT_TRUST_SUBTITLE } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailHeroTrustStripProps {
  product?: Product | null;
  giftSubtitle?: string;
  className?: string;
}

interface TrustItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}

function splitLabeledCopy(text: string): { label: string; description: string } {
  const colonIndex = text.indexOf(':');
  if (colonIndex > 0) {
    return {
      label: text.slice(0, colonIndex).trim(),
      description: text.slice(colonIndex + 1).trim(),
    };
  }
  return { label: text.trim(), description: '' };
}

function buildTrustItems(warrantyLabel: string, giftSubtitle: string): TrustItem[] {
  const giftSource = /regalo\s*:/i.test(giftSubtitle)
    ? giftSubtitle
    : TRUST_GIFT_CHIP_LABEL;
  const giftCopy = splitLabeledCopy(giftSource);

  return [
    {
      id: 'garantia',
      icon: ShieldCheck,
      label: warrantyLabel,
    },
    {
      id: 'regalo',
      icon: Gift,
      label: giftCopy.label || 'Regalo',
      ...(giftCopy.description ? { description: giftCopy.description } : {}),
    },
  ];
}

export function ProductDetailHeroTrustStrip({
  product = null,
  giftSubtitle = GIFT_TRUST_SUBTITLE,
  className,
}: ProductDetailHeroTrustStripProps) {
  const warrantyLabel = useMemo(() => resolveTrustWarrantyLabel(undefined, product), [product]);
  const items = useMemo(
    () => buildTrustItems(warrantyLabel, giftSubtitle),
    [giftSubtitle, warrantyLabel],
  );

  return (
    <section
      aria-label="Beneficios comerciales"
      className={cn('rounded-lg bg-white', className)}
    >
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex flex-row items-center gap-2">
              <Icon
                className="size-3.5 shrink-0 text-red-600"
                strokeWidth={2}
                aria-hidden="true"
              />
              <p className="min-w-0 text-pretty text-[13px] leading-snug text-[#0f1f3d]">
                {item.description ? (
                  <>
                    <span>{item.label}:</span>{' '}
                    <span className="text-xs text-neutral-500">{item.description}</span>
                  </>
                ) : (
                  item.label
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
