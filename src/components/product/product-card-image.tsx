import { useEffect, useState } from 'react';

import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import {
  productCardImageSources,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

interface ProductCardImageProps {
  src: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  watermarkClassName?: string;
  loading?: 'lazy' | 'eager';
  imageVersion?: string | null;
  onError?: () => void;
}

function withImageVersion(url: string, imageVersion?: string | null): string {
  if (!imageVersion) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(imageVersion)}`;
}

/** Imagen de tarjeta con variantes WebP 256/512 cuando existen. */
export function ProductCardImage({
  src,
  alt = '',
  className,
  overlayClassName,
  watermarkClassName,
  loading = 'lazy',
  imageVersion = null,
  onError,
}: ProductCardImageProps) {
  const [loaded, setLoaded] = useState(false);
  const responsive =
    supportsResponsiveProductImage(src) ? productCardImageSources(src) : null;
  const overlayWrapperClass = cn(
    'relative flex min-h-0 min-w-0 items-center justify-center bg-muted/60',
    overlayClassName ?? 'h-full w-full',
  );

  useEffect(() => {
    setLoaded(false);
  }, [src, imageVersion]);

  const imageClass = cn(
    'block transition-opacity duration-300',
    loaded ? 'opacity-100' : 'opacity-0',
    className,
  );

  const handleLoad = () => setLoaded(true);

  if (responsive) {
    const webpSrcSet = responsive.webpSrcSet
      .split(', ')
      .map((entry) => {
        const [url, width] = entry.split(' ');
        return `${withImageVersion(url, imageVersion)} ${width}`;
      })
      .join(', ');

    return (
      <ProductImageWatermarkOverlay
        src={withImageVersion(responsive.fallbackSrc, imageVersion)}
        className={overlayWrapperClass}
        {...(watermarkClassName ? { watermarkClassName } : {})}
      >
        <picture>
          <source type="image/webp" srcSet={webpSrcSet} sizes={responsive.sizes} />
          <img
            src={withImageVersion(responsive.fallbackSrc, imageVersion)}
            alt={alt}
            className={imageClass}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={onError}
          />
        </picture>
      </ProductImageWatermarkOverlay>
    );
  }

  return (
    <ProductImageWatermarkOverlay
      src={withImageVersion(src, imageVersion)}
      className={overlayWrapperClass}
      {...(watermarkClassName ? { watermarkClassName } : {})}
    >
      <img
        src={withImageVersion(src, imageVersion)}
        alt={alt}
        className={imageClass}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={onError}
      />
    </ProductImageWatermarkOverlay>
  );
}
