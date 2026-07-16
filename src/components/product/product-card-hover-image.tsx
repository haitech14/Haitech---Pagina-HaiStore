import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { cn } from '@/lib/utils';

/** Imagen de tarjeta: ocupa el recuadro y se ve completa (sin recorte). */
export const PRODUCT_CARD_IMAGE_CLASS =
  'h-full w-full object-contain object-center';

interface ProductCardHoverImageProps {
  candidates: string[];
  /** Inventario real (sin stock genérico); invalida estado al cambiar. */
  storedCandidates?: string[];
  /** Segunda foto de galería al pasar el cursor sobre la imagen. */
  hoverSrc?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  watermarkClassName?: string;
  placeholder?: ReactNode;
  /** Eager solo para primeras tarjetas above-the-fold. */
  loading?: 'lazy' | 'eager';
}

export function ProductCardHoverImage({
  candidates,
  storedCandidates,
  hoverSrc = null,
  alt = '',
  className = 'size-full',
  imageClassName = PRODUCT_CARD_IMAGE_CLASS,
  overlayClassName,
  watermarkClassName,
  placeholder,
  loading = 'lazy',
}: ProductCardHoverImageProps) {
  const [failedIndices, setFailedIndices] = useState<Set<number>>(() => new Set());
  const [hoverFailed, setHoverFailed] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover)');
    const sync = () => setHoverCapable(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setFailedIndices(new Set());
    setHoverFailed(false);
  }, [candidates.join('|'), hoverSrc, storedCandidates?.join('|')]);

  const displayIndex = useMemo(() => {
    for (let index = 0; index < candidates.length; index += 1) {
      if (!failedIndices.has(index)) return index;
    }
    return -1;
  }, [candidates, failedIndices]);

  const primarySrc = displayIndex >= 0 ? candidates[displayIndex] : null;

  /** Solo segunda foto de galería explícita; sin fallback a otros candidatos. */
  const resolvedHoverSrc: string | null =
    hoverCapable && !hoverFailed && hoverSrc && hoverSrc !== primarySrc ? hoverSrc : null;

  const markFailed = (index: number) => {
    setFailedIndices((previous) => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  };

  if (!primarySrc) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        {placeholder ?? <ProductNoImagePlaceholder />}
      </div>
    );
  }

  const hasHoverSwap = Boolean(resolvedHoverSrc);
  const hasHoverZoom = hoverCapable && !hasHoverSwap;

  return (
    <div
      className={cn(
        'group/image relative size-full min-h-0 min-w-0',
        hasHoverZoom && 'overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          hasHoverSwap &&
            'transition-opacity duration-300 ease-out group-hover/image:opacity-0 motion-reduce:transition-none motion-reduce:group-hover/image:opacity-100',
        )}
      >
        <ProductCardImage
          src={primarySrc}
          alt={alt}
          loading={loading}
          className={cn(
            imageClassName,
            hasHoverZoom &&
              'transition-transform duration-300 ease-out group-hover/image:scale-105 motion-reduce:transition-none motion-reduce:transform-none',
          )}
          {...(overlayClassName ? { overlayClassName } : {})}
          {...(watermarkClassName ? { watermarkClassName } : {})}
          onError={() => markFailed(displayIndex)}
        />
      </div>
      {resolvedHoverSrc ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-out group-hover/image:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/image:opacity-100',
          )}
        >
          <ProductCardImage
            src={resolvedHoverSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={imageClassName}
            {...(overlayClassName ? { overlayClassName } : {})}
            {...(watermarkClassName ? { watermarkClassName } : {})}
            onError={() => {
              if (hoverSrc && resolvedHoverSrc === hoverSrc) {
                setHoverFailed(true);
                return;
              }
              const failedIndex = candidates.indexOf(resolvedHoverSrc ?? '');
              if (failedIndex >= 0) markFailed(failedIndex);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
