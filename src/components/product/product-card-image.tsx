import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import { cn } from '@/lib/utils';

interface ProductCardImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

/** Imagen de tarjeta: siempre la URL principal (sin srcset) para evitar variantes obsoletas en caché. */
export function ProductCardImage({
  src,
  alt = '',
  className,
  loading = 'lazy',
  onError,
}: ProductCardImageProps) {
  return (
    <ProductImageWatermarkOverlay
      src={src}
      className="flex h-full w-full min-h-0 min-w-0 items-center justify-center"
    >
      <img
        src={src}
        alt={alt}
        className={cn('block', className)}
        loading={loading}
        decoding="async"
        onError={onError}
      />
    </ProductImageWatermarkOverlay>
  );
}
