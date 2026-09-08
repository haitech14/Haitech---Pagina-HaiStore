import { ServicesCatalogCard } from '@/components/services-storefront/services-catalog-card';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { SERVICES_CATALOG_ID, SERVICES_CATALOG_ITEMS } from '@/data/services-catalog';
import type { StorefrontChannelBannerId } from '@/data/storefront-channel-banners';
import { cn } from '@/lib/utils';

const TITLES: Record<StorefrontChannelBannerId, { eyebrow: string; title: string }> = {
  alquiler: { eyebrow: 'Catálogo', title: 'Equipos en alquiler' },
  'servicio-tecnico': { eyebrow: 'Catálogo', title: 'Servicios técnicos' },
};

interface ServicesChannelCardsGridProps {
  channel: StorefrontChannelBannerId;
  className?: string;
}

/** Grilla de servicios al estilo de la vitrina de Comprar (sin sidebar de filtros). */
export function ServicesChannelCardsGrid({ channel, className }: ServicesChannelCardsGridProps) {
  const items = SERVICES_CATALOG_ITEMS.filter((item) => item.categoryId === channel);
  const copy = TITLES[channel];

  if (items.length === 0) return null;

  return (
    <section
      id={SERVICES_CATALOG_ID}
      aria-labelledby={`${channel}-channel-catalog-title`}
      className={cn('w-full bg-white px-3 pb-8 pt-4 sm:px-4 sm:pb-10 lg:px-5', className)}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E30613]">
            {copy.eyebrow}
          </p>
          <h2
            id={`${channel}-channel-catalog-title`}
            className="mt-1 font-[family-name:var(--font-infobox)] text-[22px] font-bold tracking-tight text-[#111] sm:text-[26px]"
          >
            {copy.title}
          </h2>
        </header>

        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.slug} className="min-w-0">
              <ServicesCatalogCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
