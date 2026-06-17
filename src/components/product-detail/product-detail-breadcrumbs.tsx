import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { ProductBreadcrumb } from '@/types/product-detail';

interface ProductDetailBreadcrumbsProps {
  items: ProductBreadcrumb[];
  className?: string;
}

export function ProductDetailBreadcrumbs({ items, className }: ProductDetailBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Migas de pan" className={cn('mb-5 text-xs sm:text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-y-1 sm:flex-nowrap">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex max-w-full items-center">
              {index > 0 ? (
                <span className="mx-1.5 shrink-0 text-muted-foreground/70" aria-hidden="true">
                  &gt;
                </span>
              ) : null}

              {crumb.href && !isLast ? (
                <Link
                  to={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'line-clamp-1 text-pretty',
                    isLast ? 'font-medium text-muted-foreground' : 'text-muted-foreground',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
