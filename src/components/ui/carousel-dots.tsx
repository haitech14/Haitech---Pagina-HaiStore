import { cn } from '@/lib/utils';

/** `light` = puntos claros sobre fondo oscuro; `dark` = puntos oscuros sobre fondo claro. */
export type CarouselDotsTheme = 'light' | 'dark';

const DOT_THEME_CLASSES: Record<
  CarouselDotsTheme,
  { inactive: string; active: string; ringOffset: string }
> = {
  light: {
    inactive: 'border border-white/80 bg-transparent hover:border-white',
    active: 'border-red-600 bg-red-600',
    ringOffset: 'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  },
  dark: {
    inactive: 'border border-neutral-400/90 bg-transparent hover:border-neutral-500',
    active: 'border-red-600 bg-red-600',
    ringOffset: 'focus-visible:ring-offset-2 focus-visible:ring-offset-white/80',
  },
};

const DOT_SIZE_CLASSES = {
  default: {
    button: 'size-5',
    active: 'size-2.5',
    inactive: 'size-2',
  },
  lg: {
    button: 'size-6',
    active: 'size-3',
    inactive: 'size-2.5',
  },
} as const;

export type CarouselDotsSize = keyof typeof DOT_SIZE_CLASSES;

interface CarouselDotsProps {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  className?: string;
  theme?: CarouselDotsTheme;
  size?: CarouselDotsSize;
  inactiveClassName?: string;
  activeClassName?: string;
}

export function CarouselDots({
  count,
  selectedIndex,
  onSelect,
  ariaLabel,
  className,
  theme = 'light',
  size = 'default',
  inactiveClassName,
  activeClassName,
}: CarouselDotsProps) {
  if (count <= 1) return null;

  const themeClasses = DOT_THEME_CLASSES[theme];
  const sizeClasses = DOT_SIZE_CLASSES[size];

  return (
    <div
      className={cn('flex items-center justify-center -space-x-0.5', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={selectedIndex === index}
          aria-label={`Ir a la página ${index + 1} de ${count}`}
          onClick={() => onSelect(index)}
          className={cn(
            'flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
            sizeClasses.button,
            themeClasses.ringOffset,
          )}
        >
          <span
            className={cn(
              'rounded-full border-2 transition-colors duration-200',
              selectedIndex === index
                ? cn(sizeClasses.active, activeClassName ?? themeClasses.active)
                : cn(sizeClasses.inactive, inactiveClassName ?? themeClasses.inactive),
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
