import { useEffect, useState } from 'react';

import {
  productDetailMainImageSources,
  productDetailThumbnailSources,
  productQuickViewMainImageSources,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

export type ProductGalleryResponsiveVariant = 'main' | 'thumb' | 'quickView';

interface ProductGalleryResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  variant?: ProductGalleryResponsiveVariant;
  onError?: () => void;
}

function resolveSources(src: string, variant: ProductGalleryResponsiveVariant) {
  if (variant === 'thumb') return productDetailThumbnailSources(src);
  if (variant === 'quickView') return productQuickViewMainImageSources(src);
  return productDetailMainImageSources(src);
}

export function ProductGalleryResponsiveImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes,
  variant = 'main',
  onError,
}: ProductGalleryResponsiveImageProps) {
  const [forcePlain, setForcePlain] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const responsive = supportsResponsiveProductImage(src) && !forcePlain;
  const sources = responsive ? resolveSources(src, variant) : null;

  useEffect(() => {
    setForcePlain(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    if (responsive) {
      setForcePlain(true);
      return;
    }
    onError?.();
  };

  const imageClass = cn(
    className,
    'transition-opacity duration-300',
    loaded ? 'opacity-100' : 'opacity-0',
  );

  if (sources) {
    return (
      <picture className="flex size-full items-center justify-center bg-muted/40">
        <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes ?? sources.sizes} />
        <img
          src={sources.fallbackSrc}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(imageClass, 'bg-muted/40')}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
    />
  );
}
