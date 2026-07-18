import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Wrench } from 'lucide-react';

import { SERVICE_HUB_TABS } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

const SERVICE_NAV_ITEMS = SERVICE_HUB_TABS.filter((tab) => tab.slug !== 'alquiler');

interface ServicesMobileAccordionProps {
  onNavigate?: () => void;
}

export function ServicesMobileAccordion({ onNavigate }: ServicesMobileAccordionProps) {
  const [open, setOpen] = useState(false);

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
          <Wrench className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Servicios
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-white/70 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul className="border-t border-white/10 py-1">
          <li>
            <Link
              to="/servicios"
              onClick={closeAll}
              className="block px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
            >
              Ver todos los servicios
            </Link>
          </li>
          {SERVICE_NAV_ITEMS.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/servicios?seccion=${item.slug}`}
                onClick={closeAll}
                className="block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
