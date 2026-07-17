import { cn } from '@/lib/utils';

/** `light` = puntos claros sobre fondo oscuro; `dark` = puntos oscuros sobre fondo claro. */
export type CarouselDotsTheme = 'light' | 'dark';

const DOT_THEME_CLASSES: Record<
  CarouselDotsTheme,
  { inactive: string; active: string; ringOffset: string }
> = {
  light: {
    inactive: 'border-white/80 bg-transparent hover:border-white',
    active: 'border-red-600 bg-red-600',
    ringOffset: 'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  },
  dark: {
    inactive: 'border-neutral-400/90 bg-transparent hover:border-neutral-500',
    active: 'border-red-600 bg-red-600',
    ringOffset: 'focus-visible:ring-offset-2 focus-visible:ring-offset-white/80',
  },
};

const DOT_SIZE_CLASSES = {
  default: {
    button: 'size-5',
    /** Mismo tamaño activo/inactivo para alinear el centro óptico. */
    dot: 'size-2.5',
  },
  lg: {
    button: 'size-6',
    dot: 'size-3',
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
      className={cn('flex items-center justify-center gap-0.5', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = selectedIndex === index;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Ir a la página ${index + 1} de ${count}`}
            onClick={() => onSelect(index)}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              sizeClasses.button,
              themeClasses.ringOffset,
            )}
          >
            <span
              className={cn(
                'box-border block shrink-0 rounded-full border-2 transition-colors duration-200',
                sizeClasses.dot,
                isActive
                  ? (activeClassName ?? themeClasses.active)
                  : (inactiveClassName ?? themeClasses.inactive),
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
