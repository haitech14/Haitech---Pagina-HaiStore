import type { ReactNode } from 'react';

import {
  HAITECH_WATERMARK_SRC,
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
        className="pointer-events-none absolute bottom-1 right-1 z-[1] w-[22%] min-w-[2.75rem] max-w-[5rem] select-none opacity-[0.14] sm:bottom-1.5 sm:right-1.5 sm:max-w-[5.5rem]"
      />
    </div>
  );
}
