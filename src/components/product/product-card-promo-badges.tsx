import { ProductCardEstadoBadge } from '@/components/product/product-card-estado-badge';
import {
  HOME_LANDING_PROMO_BADGE_LABELS,
  type HomeLandingPromoBadgeId,
} from '@/lib/home-landing-product-badges';
import { cn } from '@/lib/utils';

const BADGE_BASE_CLASS =
  'inline-flex shrink-0 rounded px-1 py-px text-[0.5rem] font-semibold uppercase leading-tight tracking-wide sm:text-[0.5625rem]';

const PROMO_BADGE_STYLES: Record<HomeLandingPromoBadgeId, string> = {
  'free-shipping': 'bg-[#16A34A] text-white',
  'best-seller': 'bg-[#FF9500] text-white',
};

export function ProductCardPromoBadges({
  badges,
  estadoLabel,
  className,
}: {
  badges: readonly HomeLandingPromoBadgeId[];
  estadoLabel?: string | null;
  className?: string;
}) {
  const trimmedEstado = estadoLabel?.trim();
  if (!trimmedEstado && badges.length === 0) return null;

  return (
    <div
      className={cn(
        'flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {trimmedEstado ? <ProductCardEstadoBadge label={trimmedEstado} /> : null}
      {badges.map((badgeId) => (
        <span key={badgeId} className={cn(BADGE_BASE_CLASS, PROMO_BADGE_STYLES[badgeId])}>
          {HOME_LANDING_PROMO_BADGE_LABELS[badgeId]}
        </span>
      ))}
    </div>
  );
}
