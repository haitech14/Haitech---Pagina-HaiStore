import { Award, ChevronRight, FileText, ShieldCheck, ShoppingCart, Users, type LucideIcon } from 'lucide-react';

import { StorePrefetchLink } from '@/components/store-prefetch-link';
import { Button } from '@/components/ui/button';
import { categoryLandingPath } from '@/lib/category-path';
import { HOME_LANDING_HERO_HEIGHT_CLASS } from '@/lib/home-landing-layout';
import { cn } from '@/lib/utils';

export { HOME_LANDING_HERO_HEIGHT_CLASS };

/** Escena de oficina + equipos (WebP alineado al preload de index.html). */
const HERO_BACKGROUND = '/hero/home-hero-scene.webp';
const HERO_BUY_EQUIPMENT_HREF = categoryLandingPath('multifuncionales');
const HERO_QUOTE_CAMPAIGN = 'home-landing-hero';

const HERO_TRUST_ITEMS: {
  id: string;
  label: string;
  ariaLabel: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'empresas',
    label: '+1200 empresas',
    ariaLabel: 'Más de 1.200 empresas atendidas',
    icon: Users,
  },
  {
    id: 'garantia',
    label: 'Garantía incluida',
    ariaLabel: 'Garantía incluida',
    icon: ShieldCheck,
  },
  {
    id: 'ricoh',
    label: 'Partner Ricoh',
    ariaLabel: 'Distribuidor autorizado Ricoh',
    icon: Award,
  },
];

/** @deprecated Usar HOME_LANDING_HERO_HEIGHT_CLASS */
export const HOME_LANDING_HERO_MIN_HEIGHT_CLASS = HOME_LANDING_HERO_HEIGHT_CLASS;

type HomeLandingHeroSlideContentProps = {
  headingId?: string;
  /** Abre el formulario flotante de cotización → WhatsApp. */
  onQuoteClick?: (campaign?: string) => void;
};

export function HomeLandingHeroSlideContent({
  headingId = 'hero-titulo',
  onQuoteClick,
}: HomeLandingHeroSlideContentProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#F8F9FA]',
        HOME_LANDING_HERO_HEIGHT_CLASS,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={HERO_BACKGROUND}
          alt=""
          width={2726}
          height={577}
          className="absolute inset-0 size-full origin-center scale-[1.7] object-cover object-[86%_28%] sm:scale-[1.55] sm:object-[78%_30%] lg:scale-[1.45] lg:object-[70%_32%] -translate-x-[4%] -translate-y-[14%] sm:-translate-x-[5%] sm:-translate-y-[16%] lg:-translate-x-[6%] lg:-translate-y-[18%]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.92)_24%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0.28)_58%,transparent_74%)] lg:bg-[linear-gradient(to_right,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.93)_22%,rgba(255,255,255,0.7)_40%,rgba(255,255,255,0.22)_56%,transparent_72%)]" />
      </div>

      <div className="container relative z-10 flex h-full items-center">
        <div className="grid w-full items-center lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-4 xl:gap-6">
          <div className="flex flex-col justify-center py-5 sm:py-6 lg:max-w-[42rem] lg:py-8">
            <div className="flex flex-col">
              <h1
                id={headingId}
                className="text-pretty font-hero text-[1.85rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#111111] sm:text-[2.75rem] lg:text-[3.1rem] xl:text-[3.35rem]"
              >
                Tu empresa no se detiene, tu{' '}
                <span className="text-[#E30613]">impresión</span> tampoco
              </h1>

              <p className="mt-2 max-w-[38rem] text-pretty text-sm leading-[1.45] text-[#666666] sm:mt-2.5 sm:text-base lg:text-[1.0625rem]">
                Compra fotocopiadoras e impresoras Ricoh con stock, garantía e instalación en Lima y
                provincias. ¿Prefieres no invertir? También alquilamos equipos.
              </p>

              <div className="mt-4 flex w-full flex-col gap-2.5 max-sm:w-full sm:mt-5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  asChild
                  className="min-h-12 w-full gap-1.5 rounded-lg bg-[#E30613] px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(227,6,19,0.2)] hover:bg-[#c90511] sm:min-h-11 sm:w-auto sm:text-[0.9375rem]"
                >
                  <StorePrefetchLink to={HERO_BUY_EQUIPMENT_HREF}>
                    <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Comprar equipos</span>
                    <ChevronRight className="ml-0.5 size-3.5 shrink-0 opacity-90" aria-hidden="true" />
                  </StorePrefetchLink>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-12 w-full gap-1.5 rounded-lg border-[#111111]/15 bg-white px-6 text-sm font-medium text-[#111111] shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:bg-[#F3F4F6] sm:min-h-11 sm:w-auto sm:text-[0.9375rem]"
                  onClick={() => onQuoteClick?.(HERO_QUOTE_CAMPAIGN)}
                >
                  <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Solicitar cotización</span>
                </Button>
              </div>

              <ul
                className={cn(
                  'mt-3 flex flex-nowrap items-center overflow-x-auto sm:mt-3.5',
                  'pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  'sm:overflow-visible',
                )}
                aria-label="Beneficios de confianza"
              >
                {HERO_TRUST_ITEMS.map(({ id, label, ariaLabel, icon: TrustIcon }, index) => (
                  <li key={id} className="flex shrink-0 items-center" aria-label={ariaLabel}>
                    {index > 0 ? (
                      <span
                        className="mx-2 h-3.5 w-px shrink-0 bg-[#DDDDDD] sm:mx-2.5"
                        aria-hidden="true"
                      />
                    ) : null}
                    <TrustIcon
                      className="size-3.5 shrink-0 text-[#666666] sm:size-4"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="ml-1.5 whitespace-nowrap text-xs font-normal leading-none text-[#666666] sm:text-[0.8125rem]">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
