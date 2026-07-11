import {
  HOME_LANDING_PROMO_BADGE_LABELS,
  type HomeLandingPromoBadgeId,
} from '@/lib/home-landing-product-badges';
import type { ProductCardPillBadge, ProductCardPillVariant } from '@/lib/product-card-pill-badges';
import { cn } from '@/lib/utils';

export const PRODUCT_CARD_PILL_BASE_CLASS =
  'inline-flex shrink-0 rounded px-1.5 py-px text-[0.5rem] font-semibold leading-tight tracking-wide sm:text-[0.5625rem]';

export const PRODUCT_CARD_PILL_IMAGE_BASE_CLASS =
  'inline-flex shrink-0 rounded px-1.5 py-0.5 text-[0.5625rem] font-semibold leading-tight sm:text-[0.625rem]';

const PILL_VARIANT_CLASS: Record<ProductCardPillVariant, string> = {
  primary: 'bg-[#0f1f3d] text-white',
  secondary: 'bg-[#e8eef7] text-[#1a3052]',
  promo: 'uppercase',
};

const PROMO_PILL_CLASS: Record<HomeLandingPromoBadgeId, string> = {
  'free-shipping': 'bg-[#16A34A] text-white',
  'best-seller': 'bg-[#FF9500] text-white',
};

interface ProductCardPillProps {
  label: string;
  variant: ProductCardPillVariant;
  promoId?: HomeLandingPromoBadgeId;
  size?: 'card' | 'image';
  className?: string;
}

export function ProductCardPill({
  label,
  variant,
  promoId,
  size = 'card',
  className,
}: ProductCardPillProps) {
  const trimmed = label.trim();
  if (!trimmed) return null;

  return (
    <span
      className={cn(
        size === 'image' ? PRODUCT_CARD_PILL_IMAGE_BASE_CLASS : PRODUCT_CARD_PILL_BASE_CLASS,
        PILL_VARIANT_CLASS[variant],
        variant === 'promo' && promoId ? PROMO_PILL_CLASS[promoId] : null,
        className,
      )}
    >
      {trimmed}
    </span>
  );
}

interface ProductCardPillRowProps {
  badges: readonly ProductCardPillBadge[];
  promoBadges?: readonly HomeLandingPromoBadgeId[];
  size?: 'card' | 'image';
  className?: string;
  'aria-label'?: string;
}

export function ProductCardPillRow({
  badges,
  promoBadges = [],
  size = 'card',
  className,
  'aria-label': ariaLabel = 'Características del producto',
}: ProductCardPillRowProps) {
  if (badges.length === 0 && promoBadges.length === 0) return null;

  return (
    <div
      className={cn(
        'flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label={ariaLabel}
    >
      {badges.map((badge) => (
        <ProductCardPill key={badge.id} label={badge.label} variant={badge.variant} size={size} />
      ))}
      {promoBadges.map((promoId) => (
        <ProductCardPill
          key={promoId}
          label={HOME_LANDING_PROMO_BADGE_LABELS[promoId]}
          variant="promo"
          promoId={promoId}
          size={size}
        />
      ))}
    </div>
  );
}
