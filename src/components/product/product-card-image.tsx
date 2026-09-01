import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  /** Override del atributo `sizes` en variantes responsive (p. ej. miniaturas compactas). */
  responsiveSizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  imageVersion?: string | null;
  /** Evita overlay duplicado cuando la marca va en el contenedor padre. */
  disableWatermark?: boolean;
  onError?: () => void;
}

function withImageVersion(url: string, imageVersion?: string | null): string {
  if (!imageVersion) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(imageVersion)}`;
}

function isImageAlreadyLoaded(img: HTMLImageElement | null): boolean {
  return Boolean(img && img.complete && img.naturalWidth > 0);
}

/** Imagen de tarjeta con variantes WebP 256/512 cuando existen. */
export function ProductCardImage({
  src,
  alt = '',
  className,
  overlayClassName,
  watermarkClassName,
  responsiveSizes,
  loading = 'lazy',
  fetchPriority,
  imageVersion = null,
  disableWatermark = false,
  onError,
}: ProductCardImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const responsive = supportsResponsiveProductImage(src)
    ? {
        ...productCardImageSources(src),
        ...(responsiveSizes ? { sizes: responsiveSizes } : {}),
      }
    : null;
  const overlayWrapperClass = cn(
    'relative flex min-h-0 min-w-0 items-center justify-center bg-muted/60',
    overlayClassName ?? 'h-full w-full',
  );

  useEffect(() => {
    if (isImageAlreadyLoaded(imgRef.current)) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
  }, [src, imageVersion]);

  const imageClass = cn(
    'block transition-opacity duration-150',
    loaded ? 'opacity-100' : 'opacity-0',
    className,
  );

  const handleLoad = () => setLoaded(true);

  const wrapWithWatermark = (content: ReactNode) => {
    if (disableWatermark) {
      return <div className={overlayWrapperClass}>{content}</div>;
    }

    return (
      <ProductImageWatermarkOverlay
        src={withImageVersion(responsive?.fallbackSrc ?? src, imageVersion)}
        className={overlayWrapperClass}
        {...(watermarkClassName ? { watermarkClassName } : {})}
      >
        {content}
      </ProductImageWatermarkOverlay>
    );
  };

  if (responsive) {
    const webpSrcSet = responsive.webpSrcSet
      .split(', ')
      .map((entry) => {
        const [url, width] = entry.split(' ');
        return `${withImageVersion(url, imageVersion)} ${width}`;
      })
      .join(', ');

    return wrapWithWatermark(
      <picture>
        <source type="image/webp" srcSet={webpSrcSet} sizes={responsive.sizes} />
        <img
          ref={imgRef}
          src={withImageVersion(responsive.fallbackSrc, imageVersion)}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding="async"
          {...(fetchPriority ? { fetchPriority } : {})}
          onLoad={handleLoad}
          onError={onError}
        />
      </picture>,
    );
  }

  return wrapWithWatermark(
    <img
      ref={imgRef}
      src={withImageVersion(src, imageVersion)}
      alt={alt}
      className={imageClass}
      loading={loading}
      decoding="async"
      {...(fetchPriority ? { fetchPriority } : {})}
      onLoad={handleLoad}
      onError={onError}
    />,
  );
}
