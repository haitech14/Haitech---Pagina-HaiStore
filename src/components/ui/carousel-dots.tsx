import { cn } from '@/lib/utils';

interface CarouselDotsProps {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  className?: string;
}

export function CarouselDots({
  count,
  selectedIndex,
  onSelect,
  ariaLabel,
  className,
}: CarouselDotsProps) {
  if (count <= 1) return null;

  return (
    <div
      className={cn('flex items-center justify-center gap-0.5', className)}
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
          className="flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              'size-2 rounded-full transition-colors',
              selectedIndex === index ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
