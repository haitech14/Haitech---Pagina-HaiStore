import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import type { HeaderNavSubmenuConfig } from '@/data/header-nav-submenus';
import { cn } from '@/lib/utils';

type HeaderNavMobileAccordionProps = {
  config: HeaderNavSubmenuConfig;
  onNavigate?: () => void;
};

export function HeaderNavMobileAccordion({ config, onNavigate }: HeaderNavMobileAccordionProps) {
  const [open, setOpen] = useState(false);
  const Icon = config.icon;

  const closeAll = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-normal text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {config.label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-white/70 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul className="border-t border-white/10 py-1">
          {config.items.map((item) => (
            <li key={item.label}>
              {item.external || item.href.startsWith('http') || item.href.startsWith('mailto:') || item.href.startsWith('tel:') ? (
                <a
                  href={item.href}
                  target={item.external || item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.external || item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={closeAll}
                  className="block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.href}
                  onClick={closeAll}
                  className="block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
