import { useCallback, useState } from 'react';
import { Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_HOME_FEATURED_CATEGORY_CHIPS,
  type HaitechHomeFeaturedCategoryChip,
} from '@/data/haitech-home-featured-section';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

function CategoryChipCard({
  chip,
  imgErrors,
  onImgError,
}: {
  chip: HaitechHomeFeaturedCategoryChip;
  imgErrors: Record<string, boolean>;
  onImgError: (id: string) => void;
}) {
  const showImage = Boolean(chip.image) && !imgErrors[chip.id];
  const isOfertas = chip.id === 'ofertas';

  return (
    <Link
      to={chip.href}
      className={cn(
        'group/chip flex min-h-[132px] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-1 py-2 transition-colors sm:min-h-[152px] sm:gap-2 sm:py-2.5 lg:min-h-[168px] xl:min-h-[180px]',
        'hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 focus-visible:ring-offset-2',
      )}
      aria-label={chip.label}
    >
      <span className="flex size-[6.25rem] items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F7] sm:size-[7.25rem] md:size-[7.75rem] lg:size-[8.5rem] xl:size-[9.25rem]">
        {isOfertas ? (
          <Tag className="size-12 text-[#E30613] sm:size-14 lg:size-16" strokeWidth={1.75} aria-hidden="true" />
        ) : showImage ? (
          <img
            src={chip.image}
            alt=""
            width={148}
            height={148}
            className="size-full object-contain transition-transform duration-300 group-hover/chip:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => onImgError(chip.id)}
          />
        ) : (
          <span className="text-3xl font-bold text-[#B0B0B0] sm:text-4xl" aria-hidden="true">
            {chip.label.charAt(0)}
          </span>
        )}
      </span>
      <span className="line-clamp-2 px-0.5 text-center text-[11px] font-semibold leading-tight text-[#333333] sm:text-[12px] lg:text-[13px]">
        {chip.label}
      </span>
    </Link>
  );
}

/** Grilla de categorías — 6 por fila en desktop, iconos grandes sin borde. */
export function HaitechHomeCategoryChipsCarousel({ className }: { className?: string }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = useCallback((id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <ul
        className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-2.5 lg:gap-3"
        role="list"
        aria-label="Categorías de productos"
      >
        {HAITECH_HOME_FEATURED_CATEGORY_CHIPS.map((chip) => (
          <li key={chip.id}>
            <CategoryChipCard chip={chip} imgErrors={imgErrors} onImgError={handleImgError} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Bloque completo: categorías encima de «Productos Destacados». */
export function HaitechHomeCategoryChipsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white px-3 pb-1 pt-2 sm:px-4 sm:pb-2 sm:pt-3 lg:px-5', className)}
      aria-label="Explorar categorías"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <HaitechHomeCategoryChipsCarousel />
      </div>
    </section>
  );
}
