import { useEffect, useState, type ImgHTMLAttributes } from 'react';

import {
  categoryImageSources,
  productCardImageSources,
  promoCardImageSources,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

type ResponsiveStaticVariant = 'product-card' | 'category' | 'promo';

interface ResponsiveStaticImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt?: string;
  variant?: ResponsiveStaticVariant;
  sizes?: string;
  wrapperClassName?: string;
}

function resolveSources(src: string, variant: ResponsiveStaticVariant) {
  if (!supportsResponsiveProductImage(src)) return null;
  if (variant === 'promo') return promoCardImageSources(src);
  if (variant === 'category') return categoryImageSources(src);
  return productCardImageSources(src);
}

/** Imagen estática con srcset WebP y transición al cargar. */
export function ResponsiveStaticImage({
  src,
  alt = '',
  className,
  wrapperClassName,
  variant = 'product-card',
  sizes,
  loading = 'lazy',
  onLoad,
  onError,
  ...imgProps
}: ResponsiveStaticImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [forcePlain, setForcePlain] = useState(false);
  const sources = !forcePlain ? resolveSources(src, variant) : null;

  useEffect(() => {
    setLoaded(false);
    setForcePlain(false);
  }, [src]);

  const handleLoad: ImgHTMLAttributes<HTMLImageElement>['onLoad'] = (event) => {
    setLoaded(true);
    onLoad?.(event);
  };

  const handleError: ImgHTMLAttributes<HTMLImageElement>['onError'] = (event) => {
    if (sources) {
      setForcePlain(true);
      return;
    }
    onError?.(event);
  };

  const imageClass = cn(
    'block transition-opacity duration-300',
    loaded ? 'opacity-100' : 'opacity-0',
    className,
  );

  return (
    <span
      className={cn(
        'relative flex min-h-0 min-w-0 items-center justify-center bg-muted/60',
        wrapperClassName,
      )}
    >
      {sources ? (
        <picture className="flex size-full items-center justify-center">
          <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes ?? sources.sizes} />
          <img
            {...imgProps}
            src={sources.fallbackSrc}
            alt={alt}
            className={imageClass}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      ) : (
        <img
          {...imgProps}
          src={src}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </span>
  );
}
