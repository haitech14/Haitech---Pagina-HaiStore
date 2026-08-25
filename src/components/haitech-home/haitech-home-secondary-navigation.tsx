import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_SECONDARY_NAV } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

export function HaitechHomeSecondaryNavigation({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Accesos rápidos"
      className={cn('w-full text-[12px] text-white/90', className)}
      style={{ backgroundColor: HAITECH_HOME.brand, height: 37 }}
    >
      <div
        className="mx-auto flex h-full items-center justify-center gap-0 overflow-x-auto px-3"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        {HAITECH_SECONDARY_NAV.map((item, index) => (
          <div key={item.id} className="flex h-full shrink-0 items-center">
            {index > 0 ? (
              <span className="mx-1 h-[14px] w-px bg-white/20" aria-hidden="true" />
            ) : null}
            <Link
              to={item.to}
              className="inline-flex h-full items-center gap-1.5 px-2.5 font-medium transition-opacity duration-200 hover:opacity-90"
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
              {item.hasMenu ? (
                <ChevronDown className="size-3 opacity-80" strokeWidth={2} aria-hidden="true" />
              ) : null}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
