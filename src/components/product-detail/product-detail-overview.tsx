import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProductDetailFeatureGrid } from '@/components/product-detail/product-detail-feature-grid';
import { cn } from '@/lib/utils';
import type { ProductDescriptionContent } from '@/types/product-detail';

interface ProductDetailOverviewProps {
  content: ProductDescriptionContent;
  className?: string;
}

export function ProductDetailOverview({ content, className }: ProductDetailOverviewProps) {
  const overviewTitle = content.overviewTitle ?? 'Diseñada para la productividad';
  const overviewParagraphs =
    content.overviewParagraphs && content.overviewParagraphs.length > 0
      ? content.overviewParagraphs
      : content.paragraphs.slice(0, 1);
  const featureCards = content.featureCards ?? [];

  return (
    <div
      className={cn(
        'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-8 xl:gap-10',
        className,
      )}
    >
      <div className="flex flex-col space-y-4 lg:max-w-sm lg:pt-1">
        <h2 className="text-balance text-xl font-bold leading-tight text-[#0f1f3d] sm:text-2xl">
          {overviewTitle}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
          {overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {content.overviewLink ? (
          <Link
            to={content.overviewLink.href}
            className="inline-flex w-fit items-center gap-0.5 text-sm font-bold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            {content.overviewLink.label}
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <ProductDetailFeatureGrid cards={featureCards} />
    </div>
  );
}
