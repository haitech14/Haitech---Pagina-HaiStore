import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/hooks/use-checkout-flow';

const STEPS: Array<{ step: CheckoutStep; label: string }> = [
  { step: 1, label: 'Resumen' },
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
      <div className="mx-auto max-w-7xl">
        <header className="mb-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Finalizar compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa los pasos para confirmar tu pedido.
          </p>
        </header>
        <CheckoutProgressBar currentStep={currentStep} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:items-start">
          <div>{children}</div>
          {sidebar ? <aside className="lg:sticky lg:top-24">{sidebar}</aside> : null}
        </div>
      </div>
    </div>
  );
}
