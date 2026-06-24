import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { cn } from '@/lib/utils';

/** Imagen de tarjeta: ocupa el recuadro y se ve completa (sin recorte). */
export const PRODUCT_CARD_IMAGE_CLASS =
  'h-full w-full object-contain object-center';

interface ProductCardHoverImageProps {
  candidates: string[];
  /** Segunda foto de galería al pasar el cursor sobre la imagen. */
  hoverSrc?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  placeholder?: ReactNode;
}

export function ProductCardHoverImage({
  candidates,
  hoverSrc = null,
  alt = '',
  className = 'size-full',
  imageClassName = PRODUCT_CARD_IMAGE_CLASS,
  placeholder,
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
  }, [candidates.join('|'), hoverSrc]);

  const displayIndex = useMemo(() => {
    for (let index = 0; index < candidates.length; index += 1) {
      if (!failedIndices.has(index)) return index;
    }
    return -1;
  }, [candidates, failedIndices]);

  const fallbackHoverIndex = useMemo(() => {
    if (displayIndex < 0) return -1;
    for (let index = 0; index < candidates.length; index += 1) {
      if (index !== displayIndex && !failedIndices.has(index)) return index;
    }
    return -1;
  }, [candidates, displayIndex, failedIndices]);

  const primarySrc = displayIndex >= 0 ? candidates[displayIndex] : null;
  const resolvedHoverSrc: string | null = hoverCapable
    ? !hoverFailed && hoverSrc && hoverSrc !== primarySrc
      ? hoverSrc
      : fallbackHoverIndex >= 0
        ? candidates[fallbackHoverIndex] ?? null
        : null
    : null;

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
        {placeholder ?? <ImageOff className="size-10 text-muted-foreground/40" aria-hidden="true" />}
      </div>
    );
  }

  const hasHover = hoverCapable && Boolean(resolvedHoverSrc);

  return (
    <div className={cn('group/image relative size-full min-h-0 min-w-0', className)}>
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          hasHover &&
            'transition-opacity duration-300 ease-out group-hover/image:opacity-0 motion-reduce:transition-none motion-reduce:group-hover/image:opacity-100',
        )}
      >
        <ProductCardImage
          src={primarySrc}
          alt={alt}
          className={imageClassName}
          onError={() => markFailed(displayIndex)}
        />
      </div>
      {resolvedHoverSrc ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-out group-hover/image:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
        >
          <ProductCardImage
            src={resolvedHoverSrc}
            alt=""
            aria-hidden="true"
            className={imageClassName}
            onError={() => {
              if (hoverSrc && resolvedHoverSrc === hoverSrc) {
                setHoverFailed(true);
                return;
              }
              markFailed(fallbackHoverIndex);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
