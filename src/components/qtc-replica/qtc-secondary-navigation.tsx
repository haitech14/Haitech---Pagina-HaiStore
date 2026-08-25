import { ChevronDown } from 'lucide-react';

import { QTC, QTC_SECONDARY_NAV } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

export function QtcSecondaryNavigation({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Nuestras marcas"
      className={cn('w-full text-[12px] text-white/90', className)}
      style={{ backgroundColor: QTC.blackNav, height: 37 }}
    >
      <div
        className="mx-auto flex h-full items-center justify-center gap-0 overflow-x-auto px-3"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <button
          type="button"
          className="inline-flex h-full shrink-0 items-center gap-1 px-3 font-bold uppercase tracking-wide text-white transition-opacity duration-200 hover:opacity-90"
        >
          Nuestras Marcas
          <ChevronDown className="size-3.5 opacity-80" strokeWidth={2} aria-hidden="true" />
        </button>

        {QTC_SECONDARY_NAV.map((item) => (
          <div key={item.id} className="flex h-full shrink-0 items-center">
            <span className="mx-1 h-[14px] w-px bg-white/20" aria-hidden="true" />
            <button
              type="button"
              className="inline-flex h-full items-center gap-1.5 px-2.5 transition-opacity duration-200 hover:opacity-90"
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="whitespace-nowrap font-medium">{item.label}</span>
              {item.hasMenu ? (
                <ChevronDown className="size-3 opacity-80" strokeWidth={2} aria-hidden="true" />
              ) : null}
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}
