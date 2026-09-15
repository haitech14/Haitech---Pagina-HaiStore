import { ChevronRight, Home } from 'lucide-react';
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
    <nav aria-label="Migas de pan" className={cn('text-xs leading-none text-neutral-400', className)}>
      <ol className="flex flex-nowrap items-center overflow-hidden">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          const isHome = index === 0 && (crumb.href === '/' || crumb.label.toLowerCase() === 'inicio');

          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex max-w-full items-center">
              {index > 0 ? (
                <ChevronRight className="mx-0.5 size-3 shrink-0 text-neutral-300" aria-hidden="true" />
              ) : null}

              {crumb.href && !isLast ? (
                <Link
                  to={crumb.href}
                  className="inline-flex max-w-full items-center gap-1.5 truncate transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]"
                >
                  {isHome ? <Home className="size-3 shrink-0" aria-hidden="true" /> : null}
                  <span className="truncate">{crumb.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'line-clamp-1 text-pretty',
                    isLast ? 'font-medium text-neutral-700' : 'text-neutral-400',
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
