import { Link } from 'react-router-dom';
import { Award, ChevronRight, Headphones, KeyRound, ShieldCheck, ShoppingCart, Users, type LucideIcon } from 'lucide-react';

import { HomeHeroPartnerBrands } from '@/components/home/home-hero-partner-brands';
import { StorePrefetchLink } from '@/components/store-prefetch-link';
import { Button } from '@/components/ui/button';
import { heroSingleAssetSources } from '@/lib/responsive-image';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

const HERO_BACKGROUND = '/hero/home-hero-scene.png';
const HERO_SOURCES = heroSingleAssetSources(HERO_BACKGROUND);

const HERO_TRUST_ITEMS: {
  id: string;
  label: string;
  ariaLabel: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'empresas',
    label: '+1200 empresas atendidas',
    ariaLabel: 'Más de 1.200 empresas atendidas',
    icon: Users,
  },
  {
    id: 'garantia',
    label: 'Garantía',
    ariaLabel: 'Garantía incluida',
    icon: ShieldCheck,
  },
  {
    id: 'soporte',
    label: 'Soporte',
    ariaLabel: 'Instalación y soporte técnico',
    icon: Headphones,
  },
  {
    id: 'ricoh',
    label: 'Partner Ricoh',
    ariaLabel: 'Distribuidor autorizado Ricoh',
    icon: Award,
  },
];

export const HOME_LANDING_HERO_MIN_HEIGHT_CLASS =
  'min-h-[min(62vw,20rem)] sm:min-h-[min(48vw,23rem)] lg:min-h-[26rem] xl:min-h-[29rem]';

type HomeLandingHeroSlideContentProps = {
  headingId?: string;
};

export function HomeLandingHeroSlideContent({
  headingId = 'hero-titulo',
}: HomeLandingHeroSlideContentProps) {
  return (
    <div
      className={cn(
        'relative overflow-visible bg-[#F8F9FA]',
        HOME_LANDING_HERO_MIN_HEIGHT_CLASS,
        'pb-5 sm:pb-6 lg:pb-8',
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <picture>
          <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes={HERO_SOURCES.sizes} />
          <img
            src={HERO_SOURCES.fallbackSrc}
            alt=""
            width={1672}
            height={941}
            className="absolute inset-0 size-full origin-[72%_72%] scale-[1.04] object-cover object-[86%_72%] sm:scale-[1.06] sm:object-[84%_72%] lg:origin-[68%_70%] lg:scale-[1.1] lg:object-[80%_70%]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.94)_24%,rgba(255,255,255,0.82)_38%,rgba(255,255,255,0.45)_52%,transparent_68%)] lg:bg-[linear-gradient(to_right,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.95)_22%,rgba(255,255,255,0.84)_36%,rgba(255,255,255,0.42)_50%,transparent_64%)]" />
      </div>

      <div className="container relative z-10">
        <div className="grid items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6 xl:gap-8">
          <div
            className={cn(
              'flex flex-col justify-center py-4 sm:py-5 lg:max-w-[40rem] lg:py-7 xl:py-8',
              HOME_LANDING_HERO_MIN_HEIGHT_CLASS,
            )}
          >
            <div className="flex flex-col">
              <h1
                id={headingId}
                className="text-pretty font-hero text-[2.25rem] font-bold leading-[1.06] tracking-[-0.02em] text-[#111111] sm:text-[2.875rem] lg:text-[3.375rem] xl:text-[3.75rem]"
              >
                Tu empresa no se detiene, tu{' '}
                <span className="text-[#E30613]">impresión</span> tampoco
              </h1>

              <p className="mt-1.5 max-w-[40rem] text-pretty text-sm leading-[1.45] text-[#666666] sm:mt-2 sm:text-[0.875rem] lg:text-[0.9375rem]">
                Compra, alquila o solicita soporte para fotocopiadoras e impresoras con garantía,
                instalación y atención especializada para empresas.
              </p>

              <div className="mt-2 flex w-full flex-col gap-1.5 sm:mt-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2">
                <Button
                  asChild
                  className="min-h-9 gap-1.5 rounded-lg bg-[#E30613] px-4 text-sm font-medium text-white shadow-[0_4px_12px_rgba(227,6,19,0.2)] hover:bg-[#c90511]"
                >
                  <StorePrefetchLink to="/tienda">
                    <ShoppingCart className="size-3 shrink-0" aria-hidden="true" />
                    <span>Comprar</span>
                    <ChevronRight className="ml-0.5 size-3.5 shrink-0 opacity-90" aria-hidden="true" />
                  </StorePrefetchLink>
                </Button>
                <Button
                  asChild
                  className="min-h-9 gap-1.5 rounded-lg bg-[#111111] px-4 text-sm font-medium text-white shadow-[0_4px_12px_rgba(17,17,17,0.18)] hover:bg-[#2a2a2a]"
                >
                  <Link to={serviceHubPath('alquiler')}>
                    <KeyRound className="size-3 shrink-0" aria-hidden="true" />
                    <span>Alquilar</span>
                    <ChevronRight className="ml-0.5 size-3.5 shrink-0 opacity-90" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-9 gap-1.5 rounded-lg border-[#DDDDDD] bg-white px-4 text-sm font-medium text-[#111111] shadow-[0_2px_8px_rgba(17,17,17,0.06)] hover:bg-[#F8F9FA]"
                >
                  <Link to={serviceHubPath('servicio-tecnico')}>
                    <Headphones className="size-3 shrink-0" aria-hidden="true" />
                    <span>Soporte Técnico</span>
                    <ChevronRight className="ml-0.5 size-3.5 shrink-0 opacity-90" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              <ul
                className={cn(
                  'mt-2.5 flex flex-nowrap items-center overflow-x-auto sm:mt-3',
                  'pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  'sm:overflow-visible',
                )}
                aria-label="Beneficios de confianza"
              >
                {HERO_TRUST_ITEMS.map(({ id, label, ariaLabel, icon: TrustIcon }, index) => (
                  <li key={id} className="flex shrink-0 items-center" aria-label={ariaLabel}>
                    {index > 0 ? (
                      <span className="mx-2 h-3.5 w-px shrink-0 bg-[#DDDDDD] sm:mx-2.5" aria-hidden="true" />
                    ) : null}
                    <TrustIcon className="size-3.5 shrink-0 text-[#666666] sm:size-4" strokeWidth={1.75} aria-hidden="true" />
                    <span className="ml-1.5 whitespace-nowrap text-xs font-normal leading-none text-[#666666] sm:text-[0.8125rem]">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <HomeHeroPartnerBrands className="relative z-10 mt-4 sm:mt-5" />
            </div>
          </div>

          <div className="hidden min-h-[26rem] lg:block xl:min-h-[29rem]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
