import { cn } from '@/lib/utils';

export const PRODUCT_NO_IMAGE_PLACEHOLDER_SRC = '/product/sin-imagen.svg';

type ProductNoImagePlaceholderProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClassName: Record<NonNullable<ProductNoImagePlaceholderProps['size']>, string> = {
  sm: 'w-14 sm:w-16',
  md: 'w-20 sm:w-24',
  lg: 'w-24 sm:w-28',
};

/** Placeholder estándar para productos sin foto cargada (sin mockups de catálogo). */
export function ProductNoImagePlaceholder({
  className,
  size = 'md',
}: ProductNoImagePlaceholderProps) {
  return (
    <img
      src={PRODUCT_NO_IMAGE_PLACEHOLDER_SRC}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={cn('h-auto max-w-full object-contain', sizeClassName[size], className)}
    />
  );
}
