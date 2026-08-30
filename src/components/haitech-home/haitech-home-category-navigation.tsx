import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { ConsumiblesNavMegaMenu } from '@/components/layout/consumibles-nav-mega-menu';
import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
import { DeferredSiteSearchForm } from '@/components/layout/deferred-site-search-form';
import { haitechWhiteNavLinkClass } from '@/components/layout/main-nav-styles';
import { ServicioTecnicoNavMegaMenu } from '@/components/layout/servicio-tecnico-nav-mega-menu';
import { ServicesNavMegaMenu } from '@/components/layout/services-nav-mega-menu';
import { HAITECH_BLACK_NAV_LINKS, HAITECH_HOME } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { prefetchStoreRouteFromEvent } from '@/lib/prefetch-store-route';
import { serviceHubPath } from '@/lib/service-hub';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import { cn } from '@/lib/utils';

type HaitechNavLinkItem = (typeof HAITECH_BLACK_NAV_LINKS)[number];

function HaitechWhiteNavLink({ item }: { item: HaitechNavLinkItem }) {
  const location = useLocation();

  return (
    <NavLink
      to={item.to}
      end={'end' in item && item.end === true}
      className={({ isActive }) => {
        const routeActive =
          'matchActive' in item && item.matchActive
            ? item.matchActive(location)
            : isActive;
        return haitechWhiteNavLinkClass(Boolean(routeActive));
      }}
    >
      {item.label}
    </NavLink>
  );
}

export function HaitechHomeCategoryNavigation({ className }: { className?: string }) {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="hidden h-px w-full sm:block" aria-hidden="true" />

      <nav
        aria-label="Navegación principal"
        className={cn(
          'sticky top-0 z-50 hidden w-full bg-white sm:block',
          'border-b transition-shadow duration-200',
          isSticky
            ? 'border-black/[0.06] shadow-[0_10px_28px_-8px_rgba(15,23,42,0.28)]'
            : 'border-black/[0.05] shadow-none',
          className,
        )}
      >
        <div
          className="mx-auto flex h-[42px] items-center gap-2 px-3 sm:px-4 xl:px-6"
          style={{ maxWidth: HAITECH_HOME.maxWidth }}
        >
          <ul className="flex min-w-0 flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li className="flex shrink-0 items-stretch">
              <NavLink
                to="/"
                end
                className={({ isActive }) => haitechWhiteNavLinkClass(isActive)}
              >
                Inicio
              </NavLink>
            </li>

            <li className="flex shrink-0 items-stretch">
              <NavLink
                to="/tienda"
                end
                onMouseEnter={prefetchStoreRouteFromEvent}
                onFocus={prefetchStoreRouteFromEvent}
                className={({ isActive }) => haitechWhiteNavLinkClass(isActive)}
              >
                Tienda
              </NavLink>
            </li>

            <li className="flex shrink-0 items-stretch">
              <DeferredCategoriesMegaMenu
                triggerVariant="nav"
                navRow="haitech-white"
                label="Equipos"
                showIcon={false}
                eager
                triggerHref={storeShowcasePath({ categoryId: 'multifuncionales' })}
              />
            </li>

            <li className="flex shrink-0 items-stretch">
              <ConsumiblesNavMegaMenu
                navRow="haitech-white"
                showIcon={false}
                label="Consumibles"
                triggerHref={storeShowcasePath({ categoryId: 'toner' })}
              />
            </li>

            <li className="flex shrink-0 items-stretch">
              <ServicioTecnicoNavMegaMenu
                navRow="haitech-white"
                showIcon={false}
                triggerHref={serviceHubPath('servicio-tecnico')}
              />
            </li>

            <li className="flex shrink-0 items-stretch">
              <ServicesNavMegaMenu
                navRow="haitech-white"
                showIcon={false}
                label="Alquiler"
                triggerHref={serviceHubPath('alquiler')}
              />
            </li>

            {HAITECH_BLACK_NAV_LINKS.filter(
              (item) => item.id !== 'servicio-tecnico' && item.id !== 'alquiler',
            ).map((item) => (
              <li key={item.id} className="flex shrink-0 items-stretch">
                <HaitechWhiteNavLink item={item} />
              </li>
            ))}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-2 self-center">
            <div
              className={cn(
                'overflow-hidden transition-[width,opacity] duration-300 ease-out',
                isSticky
                  ? 'w-[200px] opacity-100 lg:w-[240px] xl:w-[280px]'
                  : 'pointer-events-none w-0 opacity-0',
              )}
              aria-hidden={!isSticky}
            >
              <DeferredSiteSearchForm
                className={cn(
                  'w-[200px] lg:w-[240px] xl:w-[280px]',
                  '[&_form]:h-8 [&_form]:rounded-lg [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
                  '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
                  '[&_input]:h-8 [&_input]:pl-8 [&_input]:pr-2 [&_input]:text-[12px] [&_input]:placeholder:text-[#9A9A9A]',
                  '[&_button]:!size-8 [&_form>svg]:left-2 [&_form>svg]:size-3.5 [&_form>svg]:text-[#888]',
                  '[&_button_svg]:!size-3.5 [&_button_svg]:!text-white',
                  '[&_button]:!rounded-r-lg [&_button]:!bg-[#E30613]',
                )}
                variant="segmented"
                size="dense"
                showSearchIcons
                showCategoryFilter={false}
              />
            </div>

            <button
              type="button"
              onClick={() => requestQuote({ campaign: 'nav-solicitar-cotizacion' })}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-2 rounded-lg bg-[#E30613] px-3.5 text-[12px] font-semibold text-white',
                'transition-colors hover:bg-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
              )}
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Solicitar cotización</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
