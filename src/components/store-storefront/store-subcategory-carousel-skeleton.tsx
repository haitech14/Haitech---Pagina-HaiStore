import { cn } from '@/lib/utils';

/** Placeholder liviano (sin Embla) mientras carga el carrusel. */
export function StoreSubcategoryCarouselSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('flex gap-2 sm:gap-2.5', className)}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex min-w-[8.5rem] max-w-[11.5rem] flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-white px-2.5 py-2.5 sm:min-w-[12rem] sm:max-w-[14rem] sm:gap-2 sm:px-3.5 sm:py-3.5"
        >
          <div className="size-[5.25rem] animate-pulse rounded-lg bg-neutral-100 sm:size-[8.5rem]" />
          <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
