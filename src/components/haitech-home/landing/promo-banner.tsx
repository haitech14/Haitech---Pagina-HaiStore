import { Link } from 'react-router-dom';

import { HAITECH_LANDING_COLORS } from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

export function PromoBanner({
  offersHref,
  className,
}: {
  offersHref: string;
  className?: string;
}) {
  return (
    <section
      className={cn('relative overflow-hidden rounded-lg', className)}
      aria-label="Promociones exclusivas"
      style={{
        background: 'linear-gradient(90deg, #e30613 0%, #d0000d 60%, #a90009 100%)',
        minHeight: 168,
      }}
    >
      <div className="relative z-[1] flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <h2 className="max-w-[20rem] text-[20px] font-bold uppercase leading-[1.15] text-white sm:text-[23px]">
          Renueva tu equipo
          <br />
          y lleva tu productividad
          <br />
          al siguiente nivel
        </h2>

        <div className="flex max-w-sm flex-col gap-3 lg:items-start">
          <p className="text-[13px] leading-snug text-white/95 sm:text-[14px]">
            Consulta por nuestras promociones
            <br className="hidden sm:block" /> exclusivas y financiamiento.
          </p>
          <Link
            to={offersHref}
            className={cn(
              'inline-flex h-9 w-fit items-center rounded-md bg-white px-4 text-[12px] font-bold uppercase tracking-wide',
              'transition-opacity hover:opacity-90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e30613]',
            )}
            style={{ color: HAITECH_LANDING_COLORS.primary }}
          >
            Ver ofertas
          </Link>
        </div>

        <div className="pointer-events-none relative mx-auto hidden h-[120px] w-[160px] shrink-0 lg:mx-0 lg:block">
          <img
            src="/promo-cards/discount-percent.png"
            alt=""
            width={160}
            height={120}
            className="absolute inset-0 size-full object-contain opacity-95 drop-shadow-lg"
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
