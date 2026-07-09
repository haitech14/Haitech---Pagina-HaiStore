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
    <nav aria-label="Migas de pan" className={cn('text-[0.625rem] font-medium uppercase tracking-wide text-neutral-400 sm:text-[0.6875rem]', className)}>
      <ol className="flex flex-wrap items-center gap-y-1">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex max-w-full items-center">
              {index > 0 ? (
                <span className="mx-1.5 shrink-0 text-neutral-300" aria-hidden="true">
                  /
                </span>
              ) : null}

              {crumb.href && !isLast ? (
                <Link
                  to={crumb.href}
                  className="text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'line-clamp-2 text-pretty',
                    isLast ? 'text-neutral-500' : 'text-neutral-400',
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
