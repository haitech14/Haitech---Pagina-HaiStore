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
  className,
}: ResponsivePromoBannerImageProps) {
  const mobileObjectClass =
    mobileFocus === 'center'
      ? 'object-[center_28%] sm:object-center'
      : 'object-[left_42%] sm:object-center';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'h-[228px] sm:h-auto',
        className,
      )}
    >
      <picture className="block size-full sm:contents">
        {webp ? <source srcSet={webp} type="image/webp" media="(min-width: 640px)" /> : null}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'block transition-transform duration-500 group-hover:scale-[1.01]',
            'absolute inset-0 h-full object-cover',
            mobileFocus === 'left' && 'w-[255%] max-w-none',
            mobileObjectClass,
            'sm:static sm:h-auto sm:w-full sm:max-w-full sm:object-contain',
          )}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
}
