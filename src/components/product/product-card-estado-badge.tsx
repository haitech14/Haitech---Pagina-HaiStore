import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';
import { cn } from '@/lib/utils';

const BADGE_BASE_CLASS =
  'inline-flex shrink-0 rounded px-1 py-px text-[0.5rem] font-semibold uppercase leading-tight tracking-wide sm:text-[0.5625rem]';

const GENERIC_ESTADO_BADGE_CLASS =
  'bg-neutral-200 font-semibold normal-case tracking-normal text-neutral-700';

const EQUIPMENT_CONDITION_LABELS = new Set<string>(['Nueva', 'Seminueva', 'Remanufacturada']);

function isEquipmentConditionLabel(label: string): label is ProductEquipmentConditionLabel {
  return EQUIPMENT_CONDITION_LABELS.has(label);
}

interface ProductCardEstadoBadgeProps {
  label: string;
  size?: 'card' | 'default';
  className?: string;
}

/** Badge de condición comercial en tarjetas (equipos y consumibles). */
export function ProductCardEstadoBadge({
  label,
  size = 'card',
  className,
}: ProductCardEstadoBadgeProps) {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (isEquipmentConditionLabel(trimmed)) {
    return (
      <ProductConditionBadge
        label={trimmed}
        size={size === 'card' ? 'card' : 'default'}
        className={className}
      />
    );
  }

  return (
    <span className={cn(BADGE_BASE_CLASS, GENERIC_ESTADO_BADGE_CLASS, className)}>{trimmed}</span>
  );
}
