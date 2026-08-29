import {
  ChevronRight,
  Cog,
  Printer,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  HAITECH_HOME_SERVICES_GRID,
  HAITECH_HOME_SERVICES_HEADER,
} from '@/data/haitech-home-services-grid';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<(typeof HAITECH_HOME_SERVICES_GRID)[number]['icon'], LucideIcon> = {
  cart: ShoppingCart,
  printer: Printer,
  wrench: Wrench,
  cog: Cog,
};

function ServiceCard({
  title,
  description,
  href,
  image,
  imageAlt,
  icon,
}: (typeof HAITECH_HOME_SERVICES_GRID)[number]) {
  const Icon = SERVICE_ICONS[icon];

  return (
    <Link
      to={href}
      className={cn(
        'group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl sm:min-h-[300px] lg:min-h-[320px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        decoding="async"
      />
      <span
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 size-[72px] sm:size-[80px]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 80 80" className="size-full">
          <path d="M80 0 V80 H0 Z" className="fill-[#E30613]" />
        </svg>
      </span>

      <div className="relative z-[1] flex flex-col items-start px-4 pb-5 pt-16 sm:px-5 sm:pb-6">
        <span className="mb-3 flex size-10 items-center justify-center rounded-md bg-[#E30613] sm:size-11">
          <Icon className="size-5 text-white sm:size-[22px]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="text-[17px] font-bold leading-tight text-white sm:text-[18px] lg:text-[19px]">
          {title}
        </h3>
        <p className="mt-2 max-w-[17rem] text-[12px] leading-snug text-white/90 sm:text-[13px]">
          {description}
        </p>
        <span
          className={cn(
            'mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-white/90 bg-transparent px-3',
            'text-[10px] font-bold uppercase tracking-[0.08em] text-white',
            'transition-colors group-hover:border-white group-hover:bg-white/10 sm:h-9 sm:px-3.5 sm:text-[11px]',
          )}
        >
          Ver más
          <span className="flex size-4 items-center justify-center rounded-full bg-[#E30613]">
            <ChevronRight className="size-3 text-white" strokeWidth={2.5} aria-hidden="true" />
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Sección «Nuestros Servicios» — header + 4 tarjetas + barra de confianza (mockup). */
export function HaitechHomeServicesSection({ className }: { className?: string }) {
  const header = HAITECH_HOME_SERVICES_HEADER;

  return (
    <section
      className={cn('w-full bg-white px-3 py-10 sm:px-4 sm:py-12 lg:px-5 lg:py-14', className)}
      aria-labelledby="haitech-services-grid-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-7 flex flex-col gap-5 sm:mb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
            <div className="shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E30613] sm:text-[12px]">
                {header.eyebrow}
              </p>
              <h2
                id="haitech-services-grid-title"
                className="mt-1 font-[family-name:var(--font-infobox)] text-[28px] font-bold leading-none tracking-tight text-[#111] sm:text-[34px] lg:text-[40px]"
              >
                {header.titleBefore}
                <span className="text-[#E30613]">{header.titleAccent}</span>
              </h2>
            </div>

            <span
              className="hidden h-14 w-px shrink-0 bg-[#D4D4D4] sm:block"
              aria-hidden="true"
            />

            <p className="max-w-md text-[13px] leading-relaxed text-[#555] sm:text-[14px] lg:text-[15px]">
              {header.description}
            </p>
          </div>

          <div className="shrink-0 lg:pb-1 lg:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#333] sm:text-[11px]">
              {header.tagline}
            </p>
            <span
              className="mt-1.5 block h-[3px] w-12 rounded-sm bg-[#E30613] lg:ml-auto"
              aria-hidden="true"
            />
          </div>
        </header>

        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
          {HAITECH_HOME_SERVICES_GRID.map((item) => (
            <li key={item.id} className="min-w-0">
              <ServiceCard {...item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
