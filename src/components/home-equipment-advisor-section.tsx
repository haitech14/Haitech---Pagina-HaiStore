import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Building2, Gauge, Printer, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const ADVISOR_OPTIONS = [
  {
    id: 'oficina-pequena',
    label: 'Para oficina pequeña',
    description: 'Impresoras compactas y eficientes para equipos reducidos.',
    icon: Building2,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para elegir una impresora para oficina pequeña.',
  },
  {
    id: 'alto-volumen',
    label: 'Para alto volumen',
    description: 'Equipos diseñados para grandes cargas de trabajo.',
    icon: Gauge,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para un equipo de alto volumen de impresión.',
  },
  {
    id: 'alquiler',
    label: 'Para alquiler mensual',
    description: 'Soluciones flexibles con todo incluido.',
    icon: Printer,
    message:
      'Hola, vengo desde HaiStore. Me interesa el alquiler mensual de equipos. ¿Me pueden asesorar?',
  },
] as const;

const defaultAdvisorUrl = buildHaitechWhatsAppUrl(
  'Hola, vengo desde HaiStore. Necesito asesoría para elegir el equipo de impresión adecuado para mi negocio.',
);

export function HomeEquipmentAdvisorSection() {
  return (
    <section
      aria-labelledby="equipo-asesor-titulo"
      className="relative overflow-hidden border-y border-border/60 bg-background py-10 sm:py-12 lg:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(220,38,38,0.06),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(220,38,38,0.05),transparent_50%)]"
      />

      <div className="container relative flex flex-col items-center gap-8 text-center sm:gap-10">
        <div className="max-w-2xl space-y-2 sm:space-y-3">
          <h2
            id="equipo-asesor-titulo"
            className="text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl lg:text-[1.75rem]"
          >
            ¿No sabes qué equipo elegir? Te asesoramos gratis.
          </h2>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Cuéntanos tu caso y te orientamos sin compromiso.
          </p>
        </div>

        <ul className="grid w-full max-w-4xl gap-4 sm:grid-cols-3 sm:gap-4">
          {ADVISOR_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <li key={option.id} className="h-full">
                <a
                  href={buildHaitechWhatsAppUrl(option.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-background px-4 py-5 text-center shadow-sm',
                    'transition-colors hover:border-red-600/30 hover:bg-red-50/40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-600/20 bg-red-50 text-red-600"
                    aria-hidden="true"
                  >
                    <OptionIcon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-bold text-[#0f1f3d] sm:text-base">{option.label}</span>
                  <span className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {option.description}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="min-h-12 gap-2.5 rounded-full bg-[#25D366] px-8 text-base font-bold text-white shadow-[0_4px_20px_rgba(37,211,102,0.25)] hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
          >
            <a href={defaultAdvisorUrl} target="_blank" rel="noopener noreferrer">
              <Icon path={mdiWhatsapp} size={1} aria-hidden="true" />
              Hablar con un asesor
            </a>
          </Button>

          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <ShieldCheck className="size-4 shrink-0 text-red-600/70" aria-hidden="true" />
            Asesoría 100% gratuita y personalizada
          </p>
        </div>
      </div>
    </section>
  );
}
