import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export type HomeCategoryChipLayout = 'horizontal' | 'vertical';
export type HomeCategoryChipSize = 'default' | 'compact' | 'sm' | 'xs' | 'lg' | 'xl';

type HomeCategoryChipStyleOptions = {
  layout?: HomeCategoryChipLayout;
  size?: HomeCategoryChipSize;
  isActive?: boolean;
  wide?: boolean;
};

export function homeCategoryChipClassName({
  layout = 'horizontal',
  size = 'default',
  isActive,
  wide,
}: HomeCategoryChipStyleOptions = {}): string {
  const isVertical = layout === 'vertical';

  return cn(
    'inline-flex shrink-0 flex-[0_0_auto] border font-semibold leading-tight transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
    isVertical
      ? size === 'xl'
        ? wide
          ? 'min-w-0 w-full flex-col items-center gap-3 rounded-xl px-3 py-4 text-center text-[0.6875rem] leading-snug sm:gap-3.5 sm:px-3.5 sm:py-5 sm:text-xs'
          : 'min-w-0 w-full flex-col items-center gap-2.5 rounded-xl px-2.5 py-3.5 text-center text-[0.6875rem] leading-snug sm:gap-3 sm:px-3 sm:py-4 sm:text-xs'
        : size === 'lg'
        ? 'min-w-[8.5rem] flex-col items-center gap-2.5 rounded-xl px-4 py-3.5 text-center text-[0.6875rem] sm:min-w-[10.5rem] sm:gap-3 sm:px-4 sm:py-4 sm:text-xs'
        : size === 'xs'
          ? 'min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-center text-[0.6875rem] sm:min-w-[4.25rem] sm:px-2 sm:py-2'
          : wide
            ? 'min-w-[7.25rem] flex-col items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-center text-[0.6875rem] sm:min-w-[8.75rem] sm:gap-2 sm:px-3 sm:py-3 sm:text-xs'
            : 'min-w-[4.75rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-[0.6875rem] sm:min-w-[5.5rem] sm:gap-1.5 sm:px-2.5 sm:py-2.5 sm:text-xs'
      : cn(
          'min-w-0 flex-row items-center',
          size === 'compact'
            ? 'gap-1.5 rounded-lg px-2 py-1.5 text-xs'
            : size === 'sm'
              ? 'gap-1.5 rounded-lg px-2.5 py-2 text-[0.6875rem] sm:text-xs'
              : 'min-h-11 gap-2 rounded-xl px-4 py-3 text-sm sm:text-base',
        ),
    isActive === undefined
      ? 'border-border/80 bg-white text-[#444444] hover:border-[#E30613]/40 hover:bg-[#FFFAFA]'
      : isActive
        ? 'border-[#E30613] bg-[#FFF5F5] text-[#E30613]'
        : 'border-border/80 bg-white text-[#444444] hover:border-[#E30613]/40 hover:bg-[#FFFAFA]',
  );
}

export function homeCategoryChipIconClassName({
  layout = 'horizontal',
  size = 'default',
  isActive,
}: HomeCategoryChipStyleOptions = {}): string {
  const isVertical = layout === 'vertical';
  const isSmallHorizontal = !isVertical && (size === 'compact' || size === 'sm');

  return cn(
    'shrink-0',
    size === 'lg' && isVertical
      ? 'size-10 sm:size-12'
      : size === 'xl' && isVertical
        ? 'size-8 sm:size-9'
        : size === 'xs' && isVertical
        ? 'size-4'
        : isVertical || !isSmallHorizontal
          ? 'size-5 sm:size-6'
          : 'size-4',
    isActive ? 'text-[#E30613]' : 'text-[#888888]',
  );
}

export function homeCategoryChipImageClassName({
  layout = 'horizontal',
  size = 'default',
  wide,
}: Pick<HomeCategoryChipStyleOptions, 'layout' | 'size' | 'wide'> = {}): string {
  const isVertical = layout === 'vertical';

  if (isVertical && size === 'xl') {
    return wide ? 'size-[5.5rem] sm:size-[7rem]' : 'size-20 sm:size-28';
  }

  if (isVertical && size === 'lg') {
    return 'size-[4.5rem] sm:size-[5.5rem]';
  }

  if (isVertical && size === 'sm' && wide) {
    return 'size-14 sm:size-[4.25rem]';
  }

  if (isVertical && size === 'sm') {
    return 'size-11 sm:size-[3.25rem]';
  }

  if (isVertical && size === 'xs') {
    return 'size-7 sm:size-8';
  }

  return homeCategoryChipIconClassName({ layout, size });
}

export function HomeCategoryChipContent({
  icon: Icon,
  imageSrc,
  label,
  labelLines,
  layout = 'horizontal',
  size = 'default',
  isActive,
  wide,
}: HomeCategoryChipStyleOptions & {
  icon?: LucideIcon;
  imageSrc?: string;
  label: string;
  labelLines?: [string, string];
}) {
  const visualClassName = imageSrc
    ? homeCategoryChipImageClassName({
        layout,
        size,
        ...(wide != null ? { wide } : {}),
      })
    : homeCategoryChipIconClassName(
        isActive !== undefined ? { layout, size, isActive } : { layout, size },
      );

  return (
    <>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          width={88}
          height={88}
          className={cn(visualClassName, 'shrink-0 object-contain')}
          loading="lazy"
          decoding="async"
        />
      ) : Icon ? (
        <Icon className={visualClassName} aria-hidden="true" />
      ) : null}
      {labelLines ? (
        <span className="flex flex-col text-center leading-snug">
          <span>{labelLines[0]}</span>
          <span>{labelLines[1]}</span>
        </span>
      ) : (
        <span
          className={cn(
            'text-pretty',
            layout === 'vertical' ? 'text-center leading-snug' : 'whitespace-nowrap',
          )}
        >
          {label}
        </span>
      )}
    </>
  );
}
