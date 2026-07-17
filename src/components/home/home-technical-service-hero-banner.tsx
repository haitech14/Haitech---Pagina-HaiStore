import { Link } from 'react-router-dom';

import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

const BANNER_IMAGE = '/promo-cards/technician-service.webp';
const BANNER_HREF = `${HOME_LANDING_LINKS.allProducts}?q=ricoh`;

/**
 * Banner hero estilo franja promocional: Distribuidor Autorizado RICOH.
 */
export function HomeTechnicalServiceHeroBanner({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-ricoh-distributor-hero-title"
      className={cn('bg-white py-4 sm:py-5', className)}
    >
      <div className="container">
        <Link
          to={BANNER_HREF}
          className={cn(
            'group relative flex min-h-[8.5rem] overflow-hidden rounded-xl sm:min-h-[9.5rem] lg:min-h-[10.5rem]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label="Distribuidor Autorizado RICOH. Ver equipos"
        >
          {/* Fondo rojo + patrón low-poly */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundColor: '#C40510',
              backgroundImage: [
                'linear-gradient(135deg, #E30613 0%, #B80510 42%, #8F040C 100%)',
                'linear-gradient(28deg, transparent 40%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.06) 55%, transparent 55%)',
                'linear-gradient(152deg, transparent 35%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.12) 52%, transparent 52%)',
                'linear-gradient(72deg, transparent 60%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.05) 78%, transparent 78%)',
              ].join(', '),
            }}
          />

          {/* Circuito decorativo (esquina inferior derecha) */}
          <svg
            className="pointer-events-none absolute -bottom-1 right-2 h-[55%] w-[38%] opacity-70 sm:right-4 sm:w-[32%] lg:w-[28%]"
            viewBox="0 0 320 160"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 140 H90 V90 H150 V50 H220 V20 H300"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M90 140 V110 H180 V70 H260"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="90" cy="140" r="3.5" fill="rgba(255,255,255,0.85)" />
            <circle cx="150" cy="90" r="3" fill="rgba(255,255,255,0.7)" />
            <circle cx="220" cy="50" r="3" fill="rgba(255,255,255,0.75)" />
            <circle cx="180" cy="110" r="2.5" fill="rgba(255,255,255,0.55)" />
            <circle cx="260" cy="70" r="2.5" fill="rgba(255,255,255,0.55)" />
            <circle cx="300" cy="20" r="3.5" fill="rgba(255,255,255,0.9)" />
          </svg>

          <div className="relative z-[1] grid w-full grid-cols-1 items-center gap-3 px-4 py-4 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_auto] sm:gap-4 sm:px-6 sm:py-5 lg:gap-6 lg:px-8">
            <div className="flex justify-center sm:justify-start">
              <img
                src={BANNER_IMAGE}
                alt=""
                width={420}
                height={280}
                className={cn(
                  'max-h-[7.5rem] w-auto object-contain object-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]',
                  'transition-transform duration-300 group-hover:scale-[1.03] sm:max-h-[8.5rem] lg:max-h-[9.5rem]',
                )}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="min-w-0 text-center text-white sm:text-left">
              <h2
                id="home-ricoh-distributor-hero-title"
                className="text-2xl font-extrabold uppercase tracking-[0.04em] sm:text-3xl lg:text-[2.15rem] lg:leading-none"
              >
                Distribuidor Autorizado RICOH
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-snug text-white/95 sm:text-[0.9375rem]">
                Equipos originales, garantía oficial y soporte certificado.
              </p>
              <p className="mt-0.5 text-xs leading-snug text-white/80 sm:text-sm">
                Multifuncionales · Impresoras · Plotters · Consumibles
              </p>
            </div>

            <div className="flex justify-center sm:justify-end">
              <span
                className={cn(
                  'inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-bold uppercase tracking-wide text-white',
                  'bg-[#E83A42] shadow-[0_6px_18px_rgba(0,0,0,0.22)] ring-1 ring-white/25',
                  'transition-[filter,transform] duration-200 group-hover:brightness-110 group-hover:scale-[1.02]',
                )}
              >
                Ver más
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
