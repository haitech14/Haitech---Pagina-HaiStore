import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import {
  HOME_LANDING_PROMO_BADGE_LABELS,
  type HomeLandingPromoBadgeId,
} from '@/lib/home-landing-product-badges';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';
import { cn } from '@/lib/utils';

const BADGE_BASE_CLASS =
  'inline-flex shrink-0 rounded px-1 py-px text-[0.5rem] font-semibold uppercase leading-tight tracking-wide sm:text-[0.5625rem]';

const GENERIC_ESTADO_BADGE_CLASS =
  'bg-neutral-200 font-semibold normal-case tracking-normal text-neutral-700';

const PROMO_BADGE_STYLES: Record<HomeLandingPromoBadgeId, string> = {
  'free-shipping': 'bg-[#16A34A] text-white',
  'best-seller': 'bg-[#FF9500] text-white',
};

const EQUIPMENT_CONDITION_LABELS = new Set<string>(['Nueva', 'Seminueva', 'Remanufacturada']);

function isEquipmentConditionLabel(label: string): label is ProductEquipmentConditionLabel {
  return EQUIPMENT_CONDITION_LABELS.has(label);
}

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
      {trimmedEstado ? (
        isEquipmentConditionLabel(trimmedEstado) ? (
          <ProductConditionBadge label={trimmedEstado} size="card" />
        ) : (
          <span className={cn(BADGE_BASE_CLASS, GENERIC_ESTADO_BADGE_CLASS)}>{trimmedEstado}</span>
        )
      ) : null}
      {badges.map((badgeId) => (
        <span key={badgeId} className={cn(BADGE_BASE_CLASS, PROMO_BADGE_STYLES[badgeId])}>
          {HOME_LANDING_PROMO_BADGE_LABELS[badgeId]}
        </span>
      ))}
    </div>
  );
}
