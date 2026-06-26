import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/hooks/use-checkout-flow';

/** Pasos 2–3: formulario + resumen lateral compacto. */
export const CHECKOUT_TOTAL_COLUMN_CLASS =
  'lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] xl:grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_28rem]';

/** Paso 1: carrito + total + upsells (columna derecha más ancha). */
export const CHECKOUT_CART_STEP_GRID_CLASS =
  'lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(26rem,1fr)] 2xl:grid-cols-[minmax(0,1fr)_min(100%,38rem)]';

export const CHECKOUT_TOTALS_PRICE_CLASS =
  'min-w-0 shrink text-right tabular-nums leading-snug';
const STEPS: Array<{ step: CheckoutStep; label: string }> = [
  { step: 1, label: 'Carrito' },
  { step: 2, label: 'Envío' },
  { step: 3, label: 'Pago' },
];

interface CheckoutProgressBarProps {
  currentStep: CheckoutStep;
}

export function CheckoutProgressBar({ currentStep }: CheckoutProgressBarProps) {
  return (
    <nav aria-label="Progreso del checkout" className="mb-6">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map(({ step, label }, index) => {
          const active = step === currentStep;
          const done = step < currentStep;
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  done || active
                    ? 'bg-red-600 text-white'
                    : 'border border-border bg-muted text-muted-foreground',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {step}
              </span>
              <span
                className={cn(
                  'hidden truncate text-sm font-medium sm:inline',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    'ml-auto hidden h-0.5 flex-1 sm:block',
                    done ? 'bg-red-600' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface CheckoutLayoutProps {
  currentStep: CheckoutStep;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function CheckoutLayout({ currentStep, children, sidebar }: CheckoutLayoutProps) {
  return (
    <div className="container px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-[88rem]">
        <header className="mb-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Finalizar compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa los pasos para confirmar tu pedido.
          </p>
        </header>
        <CheckoutProgressBar currentStep={currentStep} />
        <div
          className={cn(
            'grid gap-6 lg:items-start',
            sidebar ? CHECKOUT_TOTAL_COLUMN_CLASS : 'grid-cols-1',
          )}
        >
          <div>{children}</div>
          {sidebar ? <aside className="min-w-0 lg:sticky lg:top-24">{sidebar}</aside> : null}
        </div>
      </div>
    </div>
  );
}
