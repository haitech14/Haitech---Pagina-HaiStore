import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, ShieldCheck, Tags } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HOME_LANDING_LINKS, HOME_LANDING_TONER_HIGHLIGHTS } from '@/data/home-landing-sections';

const TONER_BANNER_ICONS = [Droplets, Tags, ShieldCheck] as const;
const TONER_BANNER_BG = '/categories/ChatGPT Image 2 jul 2026, 20_33_28.png';

export function HomeTonerRepuestosBanner() {
  return (
    <section aria-labelledby="home-toner-banner-title" className="home-landing-sans bg-white">
      <div className="container pb-8 sm:pb-10">
        <div className="relative overflow-hidden rounded-xl bg-[#141414]">
          <img
            src={TONER_BANNER_BG}
            alt=""
            className="absolute inset-0 size-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-right"
            loading="lazy"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(12,12,12,0.94)_0%,rgba(12,12,12,0.72)_38%,rgba(12,12,12,0.2)_62%,rgba(12,12,12,0.35)_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-[42%] left-0 right-[35%] bg-[linear-gradient(90deg,transparent_0%,rgba(227,6,19,0.45)_55%,transparent_100%)] blur-2xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-10 lg:py-11">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-red-500 sm:text-xs">
                Calidad que se nota en cada impresión
              </p>
              <h2
                id="home-toner-banner-title"
                className="home-section-title mt-2 text-balance text-xl font-bold uppercase leading-[1.15] text-white sm:text-2xl lg:text-[1.65rem]"
              >
                Tóner y repuestos originales para máxima durabilidad
              </h2>

              <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4">
                {HOME_LANDING_TONER_HIGHLIGHTS.map((label, index) => {
                  const Icon = TONER_BANNER_ICONS[index] ?? Droplets;
                  return (
                    <li key={label} className="flex items-center gap-2 text-xs font-medium text-white sm:text-sm">
                      <Icon className="size-4 shrink-0 text-red-500" strokeWidth={1.75} aria-hidden="true" />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
              <Button
                asChild
                className="h-10 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Link to={HOME_LANDING_LINKS.tonerCatalog}>
                  Ver catálogo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <p className="max-w-xs text-xs leading-relaxed text-white/85 sm:text-sm">
                Calidad, confianza y soporte en cada compra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
