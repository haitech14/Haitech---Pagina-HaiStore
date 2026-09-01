import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

type MobileFocus = 'left' | 'center';

type ResponsivePromoBannerImageProps = {
  src: string;
  webp?: string;
  alt: string;
  width: number;
  height: number;
  /** En móvil recorta/zoom hacia la zona del título. */
  mobileFocus?: MobileFocus;
  /** Ancho relativo en móvil (mayor = más zoom). Por defecto 255. */
  mobileWidthPercent?: number;
  /** Escala en desktop/tablet (1 = tamaño natural). */
  desktopScale?: number;
  className?: string;
};

/**
 * Banner promocional: en móvil hace zoom al título; en desktop muestra la imagen completa.
 */
export function ResponsivePromoBannerImage({
  src,
  webp,
  alt,
  width,
  height,
  mobileFocus = 'left',
  mobileWidthPercent = 255,
  desktopScale = 1,
  className,
}: ResponsivePromoBannerImageProps) {
  const mobileObjectClass =
    mobileFocus === 'center'
      ? 'object-[center_28%] sm:object-center'
      : 'object-[left_42%] sm:object-center';

  const scaledDesktop = desktopScale > 0 && desktopScale < 1;

  const imageStyle: CSSProperties = {
    ...(mobileFocus === 'left'
      ? { ['--promo-mobile-width' as string]: `${mobileWidthPercent}%` }
      : {}),
    ...(scaledDesktop ? { ['--promo-desktop-scale' as string]: desktopScale } : {}),
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'h-[228px] sm:h-auto',
        scaledDesktop && 'sm:flex sm:items-center sm:justify-center',
        className,
      )}
    >
      <picture className={cn('block size-full', scaledDesktop ? 'sm:w-full' : 'sm:contents')}>
        {webp ? <source srcSet={webp} type="image/webp" media="(min-width: 640px)" /> : null}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={imageStyle}
          className={cn(
            'block transition-transform duration-500 group-hover:scale-[1.01]',
            'absolute inset-0 h-full object-cover',
            mobileFocus === 'left' && 'max-w-none max-sm:w-[var(--promo-mobile-width,255%)]',
            mobileObjectClass,
            'sm:static sm:h-auto sm:w-full sm:max-w-full sm:object-contain',
            scaledDesktop && 'sm:origin-center sm:scale-[var(--promo-desktop-scale)]',
          )}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
}
