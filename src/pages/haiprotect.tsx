import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';

import {
  HaiProtectHeroBanner,
  HaiProtectPlanCards,
} from '@/components/haiprotect/haiprotect-plan-cards';
import { Button } from '@/components/ui/button';
import { formatPageTitle } from '@/data/site-meta';
import {
  HAIPROTECT_BENEFITS,
  formatHaiProtectPrice,
  getHaiProtectOffering,
  getHaiProtectOfferingPrice,
  haiProtectContactHref,
  type HaiProtectOfferingId,
} from '@/data/haiprotect-plans';

export function HaiProtectPage() {
  const [offeringId, setOfferingId] = useState<HaiProtectOfferingId>('mono-12m');

  useEffect(() => {
    document.title = formatPageTitle('HaiProtect — Garantía extendida');
  }, []);

  const activeOffering = getHaiProtectOffering(offeringId);
  const activePrice = activeOffering ? getHaiProtectOfferingPrice(activeOffering) : 0;

  return (
    <div className="flex flex-col">
      <section aria-labelledby="haiprotect-intro-titulo" className="border-b border-border/60 bg-muted/20">
        <div className="container py-8 sm:py-10">
          <h1 id="haiprotect-intro-titulo" className="sr-only">
            HaiProtect — Garantía extendida
          </h1>
          <HaiProtectHeroBanner />
        </div>
      </section>

      <section aria-labelledby="haiprotect-planes-titulo" className="py-8 sm:py-10">
        <div className="container">
          <header className="mb-5 sm:mb-6">
            <h2 id="haiprotect-planes-titulo" className="text-xl font-bold text-foreground sm:text-2xl">
              Planes de garantía extendida
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona duración y tipo de equipo. Precios en soles peruanos, pago único del plan.
            </p>
          </header>

          <HaiProtectPlanCards value={offeringId} onChange={setOfferingId} />
        </div>
      </section>

      {activeOffering ? (
        <section aria-labelledby="haiprotect-resumen-titulo" className="border-t border-border/60 bg-muted/30 py-8 sm:py-10">
          <div className="container">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_12px_32px_-20px_hsl(var(--foreground)/0.45)]">
              <div className="border-b border-border/60 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-5 py-5 text-white sm:px-6">
                <h2 id="haiprotect-resumen-titulo" className="text-lg font-bold sm:text-xl">
                  Tu selección
                </h2>
                <p className="mt-2 text-pretty text-sm text-white/80">
                  {activeOffering.title} ·{' '}
                  <span className="font-bold text-red-400">{formatHaiProtectPrice(activePrice)}</span>
                </p>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                <ul className="space-y-2.5" aria-label="Beneficios incluidos">
                  {HAIPROTECT_BENEFITS.slice(0, 3).map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="min-h-11 w-full bg-red-600 font-semibold text-white hover:bg-red-500 sm:w-auto sm:px-8"
                >
                  <Link
                    to={haiProtectContactHref(
                      activeOffering.equipmentType,
                      activeOffering.planId,
                    )}
                  >
                    Contratar HaiProtect
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground">
                  Un asesor confirmará modelo, serie y vigencia antes de la contratación final.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="haiprotect-beneficios-titulo" className="border-t border-border/60 py-8 sm:py-10">
        <div className="container">
          <h2 id="haiprotect-beneficios-titulo" className="text-center text-xl font-bold text-foreground sm:text-2xl">
            ¿Por qué contratar HaiProtect?
          </h2>

          <ul className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HAIPROTECT_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 bg-[#0f172a] py-8 text-white sm:py-10">
        <div className="container flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-pretty text-sm text-white/75 sm:text-base">
            ¿Tienes dudas sobre la cobertura? Un especialista HaiTech puede ayudarte a elegir el
            plan ideal para tu flota.
          </p>
          <Button
            asChild
            variant="outline"
            className="min-h-11 border-white/25 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/contacto">Hablar con un asesor</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
