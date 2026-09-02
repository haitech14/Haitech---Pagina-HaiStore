import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategorySeoIntroProps {
  title: string;
  intro: string;
  className?: string;
}

/** Bloque de contenido SEO visible en landings de categoría (keywords + contexto para crawlers). */
export function CategorySeoIntro({ title, intro, className }: CategorySeoIntroProps) {
  const [expanded, setExpanded] = useState(false);
  const previewLength = 220;
  const needsExpand = intro.length > previewLength;
  const preview = needsExpand ? `${intro.slice(0, previewLength).trim()}…` : intro;

  return (
    <section
      aria-labelledby="category-seo-intro-heading"
      className={cn(
        'rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:py-4',
        className,
      )}
    >
      <h2 id="category-seo-intro-heading" className="text-pretty text-sm font-semibold text-foreground sm:text-base">
        {title}
      </h2>
      <p className="mt-2 text-pretty">{expanded || !needsExpand ? intro : preview}</p>
      {needsExpand ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-auto gap-1 px-0 text-xs font-medium text-red-600 hover:bg-transparent hover:text-red-700"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? 'Ver menos' : 'Leer más'}
          <ChevronDown
            className={cn('size-3.5 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </Button>
      ) : null}
    </section>
  );
}
