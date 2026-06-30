import { useState } from 'react';
import { Grid3x3, History, Package, Recycle, Sparkles, Tags } from 'lucide-react';

import { ResponsiveStaticImage } from '@/components/ui/responsive-static-image';
import {
  subcategoryInitials,
  subcategoryPalette,
  subcategoryVisualKind,
  type SubcategoryVisualKind,
} from '@/lib/subcategory-visual';
import { cn } from '@/lib/utils';

const KIND_ICONS: Record<SubcategoryVisualKind, typeof Tags> = {
  all: Grid3x3,
  new: Sparkles,
  preowned: History,
  refurbished: Recycle,
  supplies: Package,
  default: Tags,
};

interface SubcategoryAutoImageProps {
  name: string;
  slug: string;
  image?: string | null;
  className?: string;
  compact?: boolean;
}

export function SubcategoryAutoImage({
  name,
  slug,
  image,
  className,
  compact = true,
}: SubcategoryAutoImageProps) {
  const [hasError, setHasError] = useState(false);
  const showPhoto = Boolean(image) && !hasError;
  const palette = subcategoryPalette(slug);
  const kind = subcategoryVisualKind(name);
  const Icon = KIND_ICONS[kind];
  const initials = subcategoryInitials(name);

  if (showPhoto) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-white',
          compact ? 'aspect-[5/4]' : 'aspect-[4/3]',
          className,
        )}
      >
        <ResponsiveStaticImage
          src={image!}
          alt=""
          className="size-full object-contain p-1.5"
          wrapperClassName="size-full"
          variant={image!.startsWith('/categories/') ? 'category' : 'product-card'}
          loading="lazy"
          onError={() => setHasError(true)}
        />
        <span className="sr-only">{name}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        compact ? 'aspect-[5/4]' : 'aspect-[4/3]',
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute -right-3 -top-3 size-14 rounded-full opacity-25"
        style={{ backgroundColor: palette.accent }}
      />
      <div
        className="absolute -bottom-4 -left-2 size-16 rounded-full opacity-20"
        style={{ backgroundColor: palette.accent }}
      />

      <div className="relative flex size-full flex-col items-center justify-center gap-0.5 p-2">
        <Icon className={cn('text-white/70', compact ? 'size-4' : 'size-6')} strokeWidth={1.75} />
        <span
          className={cn(
            'font-bold leading-none tracking-wide text-white',
            compact ? 'text-[0.65rem]' : 'text-xs',
          )}
        >
          {initials}
        </span>
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}
