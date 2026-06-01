import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ResolvedCategoryHero } from '@/data/category-hero';

interface CategoryHeroBannerProps {
  content: ResolvedCategoryHero;
}

export function CategoryHeroBanner({ content }: CategoryHeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
      role="region"
      aria-label={`${content.title}`}
    >
      <div className="relative flex min-h-[220px] flex-col justify-end sm:min-h-[280px] lg:min-h-[320px]">
        <img
          src={content.image}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25 sm:via-black/60 sm:to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex max-w-xl flex-col gap-3 p-5 sm:gap-4 sm:p-8 lg:p-10">
          {content.badge && (
            <span className="inline-flex w-fit rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {content.badge}
            </span>
          )}
          <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {content.title}
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
            {content.subtitle}
          </p>
          {content.ctaLabel && content.ctaHref && (
            <div className="pt-1">
              <Button
                asChild
                className="h-11 gap-2 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <Link to={content.ctaHref}>
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  {content.ctaLabel}
                </Link>
              </Button>
            </div>
          )}
          <span className="sr-only">{content.imageAlt}</span>
        </div>
      </div>
    </div>
  );
}
