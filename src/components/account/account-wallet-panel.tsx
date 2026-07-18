import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  ShoppingBag,
  Sparkles,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatHaiPoints } from '@/lib/haipoints';

const WALLET_STEPS: ReadonlyArray<{
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}> = [
  {
    id: 'ganar',
    title: 'Gana puntos',
    body: 'Cada compra en HaiStore suma HaiPoints según el monto y las promociones vigentes. También puedes recibir puntos en campañas especiales.',
    icon: ShoppingBag,
  },
  {
    id: 'acumular',
    title: 'Acumula en tu billetera',
    body: 'Tu saldo queda guardado en la cuenta. Consultalo aquí o desde el menú de perfil cuando quieras.',
    icon: Wallet,
  },
  {
    id: 'canjear',
    title: 'Canjea en tu próxima compra',
    body: 'Usa HaiPoints como beneficio al cotizar o comprar toner, equipos y repuestos. El canje se confirma con el equipo comercial.',
    icon: Gift,
  },
];

interface AccountWalletPanelProps {
  balance: number;
  ordersCount: number;
}

export function AccountWalletPanel({ balance, ordersCount }: AccountWalletPanelProps) {
  const stepsId = useId();
  const [activeStep, setActiveStep] = useState(0);
  const step = WALLET_STEPS[activeStep] ?? WALLET_STEPS[0]!;
  const StepIcon = step.icon;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section
        className="rounded-xl border bg-card p-5 sm:p-6 lg:col-span-2"
        aria-labelledby={`${stepsId}-title`}
      >
        <header className="mb-5 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <Sparkles className="size-5 text-amber-700" aria-hidden="true" />
          </span>
          <div>
            <h2 id={`${stepsId}-title`} className="text-lg font-bold text-foreground">
              Cómo funcionan los HaiPoints
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Guía rápida de tu billetera: gana, acumula y canjea en HaiStore.
            </p>
          </div>
        </header>

        <ol className="mb-5 flex flex-col gap-2 sm:flex-row sm:gap-2" aria-label="Pasos de HaiPoints">
          {WALLET_STEPS.map((item, index) => {
            const Icon = item.icon;
            const selected = index === activeStep;
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(index)}
                  aria-pressed={selected}
                  aria-controls={`${stepsId}-detail`}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                    selected
                      ? 'border-amber-300 bg-amber-50 shadow-sm'
                      : 'border-border bg-background hover:bg-muted/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      selected ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Icon className="size-3.5 shrink-0 text-amber-700" aria-hidden="true" />
                      <span className="truncate">{item.title}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div
          id={`${stepsId}-detail`}
          className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-white p-5"
          role="region"
          aria-live="polite"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-amber-200/80">
              <StepIcon className="size-4 text-amber-700" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold text-foreground">
              Paso {activeStep + 1}: {step.title}
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {activeStep > 0 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="inline-flex min-h-10 items-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Anterior
              </button>
            ) : null}
            {activeStep < WALLET_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(WALLET_STEPS.length - 1, prev + 1))}
                className="inline-flex min-h-10 items-center rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Siguiente paso
              </button>
            ) : (
              <Link
                to="/tienda"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <Store className="size-4" aria-hidden="true" />
                Ir a la tienda
              </Link>
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-xl border bg-card p-5" aria-labelledby={`${stepsId}-resumen`}>
        <h2 id={`${stepsId}-resumen`} className="mb-4 text-lg font-bold text-foreground">
          Resumen
        </h2>

        <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/70">
            Saldo disponible
          </p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <Sparkles className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span className="text-3xl font-bold tabular-nums text-amber-950">
              {formatHaiPoints(balance)}
            </span>
          </p>
          <p className="mt-1 text-xs font-medium text-amber-800/80">HaiPoints</p>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">Pedidos que suman</span>
            <strong className="tabular-nums text-foreground">{ordersCount}</strong>
          </li>
          <li className="flex items-center justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">Estado</span>
            <strong className={balance > 0 ? 'text-emerald-700' : 'text-foreground'}>
              {balance > 0 ? 'Listo para canjear' : 'Sin puntos aún'}
            </strong>
          </li>
          <li className="flex items-center justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">Movimientos</span>
            <strong className="text-muted-foreground">Próximamente</strong>
          </li>
        </ul>

        <Link
          to="/tienda"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Seguir comprando
        </Link>
        <Link
          to="/contacto"
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Consultar canje
        </Link>
      </aside>
    </div>
  );
}
