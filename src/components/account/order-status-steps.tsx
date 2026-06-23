import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Home,
  Package,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type OrderState = 'confirmado' | 'preparando' | 'enviado' | 'entregado';

const orderStepConfig: Record<
  OrderState,
  { label: string; icon: LucideIcon; description: string }
> = {
  confirmado: {
    label: 'Confirmado',
    icon: ClipboardCheck,
    description: 'Pedido registrado y validado',
  },
  preparando: {
    label: 'Preparando',
    icon: Package,
    description: 'Preparando productos para envío',
  },
  enviado: {
    label: 'Enviado',
    icon: Truck,
    description: 'En camino a tu dirección',
  },
  entregado: {
    label: 'Entregado',
    icon: Home,
    description: 'Recibido en destino',
  },
};

export const orderSteps: OrderState[] = ['confirmado', 'preparando', 'enviado', 'entregado'];

export const orderStateLabel: Record<OrderState, string> = {
  confirmado: orderStepConfig.confirmado.label,
  preparando: orderStepConfig.preparando.label,
  enviado: orderStepConfig.enviado.label,
  entregado: orderStepConfig.entregado.label,
};

interface OrderStatusStepsProps {
  state: OrderState;
}

export function OrderStatusSteps({ state }: OrderStatusStepsProps) {
  const activeIndex = orderSteps.findIndex((step) => step === state);

  return (
    <div className="rounded-xl border bg-background p-4 sm:p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Trazabilidad del pedido
      </p>
      <ol className="grid gap-4 sm:grid-cols-4" aria-label="Estado de seguimiento del pedido">
        {orderSteps.map((step, index) => {
          const done = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const { label, icon: StepIcon, description } = orderStepConfig[step];
          const isLast = index === orderSteps.length - 1;

          return (
            <li key={step} className="relative flex sm:block">
              {!isLast ? (
                <span
                  className={cn(
                    'absolute left-5 top-10 hidden h-px w-[calc(100%-2.5rem)] translate-x-5 sm:left-[calc(50%+1.25rem)] sm:top-5 sm:block sm:h-0.5 sm:w-[calc(100%-2.5rem)] sm:translate-x-0',
                    done && index < activeIndex ? 'bg-red-600' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <div
                className={cn(
                  'flex w-full flex-col items-start gap-2 rounded-lg border p-3 sm:items-center sm:text-center',
                  done
                    ? 'border-red-600/30 bg-red-600/5'
                    : 'border-border bg-card text-muted-foreground',
                  isCurrent && 'ring-2 ring-red-600/20',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border-2',
                    done
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-border bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done ? (
                    isCurrent ? (
                      <StepIcon className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )
                  ) : (
                    <Circle className="size-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1 sm:w-full">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      done ? 'text-red-700' : 'text-muted-foreground',
                    )}
                  >
                    <span className="sm:hidden">
                      <StepIcon className="mr-1.5 inline size-3.5 align-text-bottom" aria-hidden="true" />
                    </span>
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>

                <span className="sr-only">
                  {done ? (isCurrent ? 'Etapa actual' : 'Completado') : 'Pendiente'}: {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
