import { MapPin, Briefcase } from 'lucide-react';

import { QTC, QTC_TOPBAR_BRANDS } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

export function QtcTopBar({ className }: { className?: string }) {
  return (
    <div
      className={cn('w-full text-white', className)}
      style={{ backgroundColor: QTC.purple, height: 40 }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between gap-3 px-4 text-[11px] leading-none xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <div className="flex shrink-0 items-center gap-0">
          {QTC_TOPBAR_BRANDS.map((brand, index) => (
            <div key={brand} className="flex items-center">
              {index > 0 ? (
                <span className="mx-2 h-3.5 w-px bg-white/35" aria-hidden="true" />
              ) : null}
              <span className="font-semibold tracking-wide text-white/95">{brand}</span>
            </div>
          ))}
        </div>

        <p className="hidden min-w-0 flex-1 truncate text-center text-white/95 lg:block">
          Envío gratis desde S/299* - Válido para Lima Metropolitana y Callao, en zonas autorizadas.{' '}
          <a href="#tyc" className="underline underline-offset-2 hover:text-white">
            Ver T&amp;C
          </a>
        </p>

        <div className="flex shrink-0 items-center gap-0 text-white">
          <a
            href="#tiendas"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-opacity hover:opacity-90"
          >
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden font-medium sm:inline">Nuestras Tiendas</span>
          </a>
          <span className="h-3.5 w-px bg-white/35" aria-hidden="true" />
          <a
            href="#corporativa"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-opacity hover:opacity-90"
          >
            <Briefcase className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden font-medium sm:inline">Venta Corporativa</span>
          </a>
        </div>
      </div>
    </div>
  );
}
