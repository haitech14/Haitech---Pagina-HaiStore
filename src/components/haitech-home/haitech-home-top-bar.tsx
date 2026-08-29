import { useEffect, useRef, useState } from 'react';
import { Briefcase, ChevronDown, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import { SITE_RICOH_PARTNER_BADGE_ARIA_LABEL } from '@/lib/site-logo-asset';
import { cn } from '@/lib/utils';

export function HaitechHomeTopBar({ className }: { className?: string }) {
  const { promo, locations } = HAITECH_HOME_TOPBAR;
  const [sedesOpen, setSedesOpen] = useState(false);
  const sedesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sedesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!sedesRef.current?.contains(event.target as Node)) {
        setSedesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSedesOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [sedesOpen]);

  return (
    <div
      className={cn('relative z-40 w-full text-white', className)}
      style={{ backgroundColor: HAITECH_HOME.blackNav }}
    >
      <div
        className="mx-auto grid min-h-7 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-1 text-[10px] leading-none sm:min-h-7 sm:px-4 sm:py-0.5 sm:text-[10.5px] xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <p className="min-w-0 truncate font-medium text-white/95 sm:font-semibold">
          {SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
        </p>

        <div className="hidden items-center justify-center gap-4 text-white/95 md:flex lg:gap-6">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="size-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {promo}
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="size-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Compra segura y garantizada
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-end justify-self-end">
          <div
            ref={sedesRef}
            className="relative"
            onMouseEnter={() => setSedesOpen(true)}
            onMouseLeave={() => setSedesOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 px-1.5 py-0 transition-opacity hover:opacity-90 sm:px-2"
              aria-haspopup="menu"
              aria-expanded={sedesOpen}
              aria-controls="haitech-sedes-dropdown"
              onClick={() => setSedesOpen((open) => !open)}
            >
              <MapPin className="size-2.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-medium">Nuestras sedes</span>
              <ChevronDown
                className={cn(
                  'size-2.5 shrink-0 opacity-80 transition-transform duration-200',
                  sedesOpen && 'rotate-180',
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>

            {sedesOpen ? (
              <div
                id="haitech-sedes-dropdown"
                role="menu"
                aria-label="Direcciones de nuestras sedes"
                className={cn(
                  'absolute right-0 top-full z-50 mt-1 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-white/15',
                  'bg-[#1A1A1A] py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.45)]',
                )}
              >
                {locations.map((loc) => (
                  <a
                    key={loc.id}
                    href={loc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="flex items-start gap-2 px-3 py-2.5 text-[11px] leading-snug text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setSedesOpen(false)}
                  >
                    <MapPin
                      className="mt-0.5 size-3.5 shrink-0 text-white/80"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-white">{loc.city}</span>
                      <span className="mt-0.5 block text-white/70">{loc.address}</span>
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <span className="hidden h-3 w-px bg-white/35 lg:block" aria-hidden="true" />
          <Link
            to="/contacto"
            className="hidden items-center gap-1 px-2 py-0 transition-opacity hover:opacity-90 lg:inline-flex"
          >
            <Briefcase className="size-2.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="font-medium">Distribuidores</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
