import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';
import { cn } from '@/lib/utils';

const CONDITION_BADGE_CLASS: Record<ProductEquipmentConditionLabel, string> = {
  Nueva: 'bg-red-600 text-white ring-1 ring-inset ring-white/25',
  Seminueva: 'bg-[#e8eef7] text-[#1a3052] ring-1 ring-inset ring-[#c5d4e8]',
  Remanufacturada: 'bg-muted/90 text-muted-foreground ring-1 ring-inset ring-border/70',
};

const CONDITION_BADGE_SIZE_CLASS = {
  default:
    'rounded-full px-2 py-0.5 text-[0.58rem] leading-none sm:text-[0.64rem]',
  overlay:
    'rounded-md px-2.5 py-0.5 text-[0.58rem] leading-none shadow-sm sm:px-3 sm:py-0.5 sm:text-[0.64rem]',
  table: 'rounded-full px-1.5 py-px text-[0.54rem] leading-none sm:text-[0.58rem]',
  card: 'rounded px-1 py-px text-[0.5rem] leading-tight sm:text-[0.5625rem]',
} as const;

const NUEVA_OVERLAY_BADGE_CLASS =
  'inline-flex items-center rounded-[3px] bg-red-600 px-3 py-1 shadow-[0_1px_5px_rgba(185,28,28,0.34)] sm:px-3.5 sm:py-1';

const NUEVA_OVERLAY_TEXT_CLASS =
  'font-myriad text-[0.7rem] font-semibold leading-none text-white sm:text-[0.76rem]';

interface ProductConditionBadgeProps {
  label: ProductEquipmentConditionLabel;
  size?: keyof typeof CONDITION_BADGE_SIZE_CLASS;
  className?: string;
}

export function ProductConditionBadge({
  label,
  size = 'default',
  className,
}: ProductConditionBadgeProps) {
  if (label === 'Nueva' && size === 'overlay') {
    return (
      <span className={cn(NUEVA_OVERLAY_BADGE_CLASS, className)}>
        <span className={NUEVA_OVERLAY_TEXT_CLASS}>Nueva</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'font-myriad inline-flex shrink-0 items-center font-normal tracking-normal',
        CONDITION_BADGE_SIZE_CLASS[size],
        CONDITION_BADGE_CLASS[label],
        className,
      )}
    >
      {label}
    </span>
  );
}
