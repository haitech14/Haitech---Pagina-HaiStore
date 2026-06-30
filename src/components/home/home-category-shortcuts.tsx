import { Link } from 'react-router-dom';

import { categoryLandingPath, storeMostViewedOffersPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';

const SHORTCUTS = [
  { label: 'Ofertas', href: storeMostViewedOffersPath() },
  { label: 'Multifuncionales', href: categoryLandingPath('multifuncionales') },
  { label: 'Tóner', href: categoryLandingPath('toner-suministros') },
  { label: 'Repuestos', href: categoryLandingPath('repuestos') },
] as const;

export function HomeCategoryShortcuts() {
  return (
    <nav
      aria-label="Atajos de categorías"
      className="container pb-2 pt-1 sm:pb-3 sm:pt-0"
    >
      <ul
        className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {SHORTCUTS.map(({ label, href }) => (
          <li key={href} className="shrink-0">
            <Link
              to={href}
              className={cn(
                'inline-flex min-h-9 items-center rounded-full border border-border/80 bg-white px-3.5 text-xs font-semibold text-foreground shadow-sm',
                'transition-colors hover:border-red-600/40 hover:bg-red-50/50 hover:text-red-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
