import type { ReactNode } from 'react';

import {
  HAITECH_WATERMARK_SRC,
  PRODUCT_IMAGE_WATERMARK_OVERLAY_CLASS,
  PRODUCT_IMAGE_WATERMARK_OVERLAY_OPACITY,
  shouldShowProductImageWatermarkOverlay,
} from '@/lib/product-image-watermark';
import { cn } from '@/lib/utils';

interface ProductImageWatermarkOverlayProps {
  src: string;
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function ProductImageWatermarkOverlay({
  src,
  children,
  className,
  enabled = true,
}: ProductImageWatermarkOverlayProps) {
  if (!enabled || !shouldShowProductImageWatermarkOverlay(src)) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <img
        src={HAITECH_WATERMARK_SRC}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={PRODUCT_IMAGE_WATERMARK_OVERLAY_CLASS}
        style={{ opacity: PRODUCT_IMAGE_WATERMARK_OVERLAY_OPACITY }}
      />
    </div>
  );
}
