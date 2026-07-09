import { useEffect, useState, type ReactNode } from 'react';
import { Clock, Package, Truck, Zap } from 'lucide-react';

const EXPRESS_GREEN = '#008f39';
const EXPRESS_MINT_BG = '#e8f5ec';

function padCountdown(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
  });
}

function buildDeliveryRange(minDays: number, maxDays: number): string {
  const start = new Date();
  start.setDate(start.getDate() + minDays);
  const end = new Date();
  end.setDate(end.getDate() + maxDays);
  return `${formatDeliveryDate(start)} - ${formatDeliveryDate(end)}`;
}

export interface ExpressDeliveryCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Cuenta regresiva hasta medianoche para envío express del mismo día. */
export function useExpressDeliveryCountdown(): ExpressDeliveryCountdown {
  const [remaining, setRemaining] = useState<ExpressDeliveryCountdown>(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const diff = Math.max(0, midnight.getTime() - now.getTime());
    return {
      days: 0,
      hours: Math.floor(diff / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    };
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          hours = 23;
          days = Math.max(0, days);
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return remaining;
}

function ExpressCountdownSegment({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span
        className="text-base font-bold tabular-nums sm:text-lg"
        style={{ color: EXPRESS_GREEN }}
      >
        {padCountdown(value)}
      </span>
      <span
        className="ml-px text-[0.5625rem] font-semibold leading-none sm:text-[0.625rem]"
        style={{ color: EXPRESS_GREEN }}
      >
        {unit}
      </span>
    </span>
  );
}

function ExpressCountdownTimer({ remaining }: { remaining: ExpressDeliveryCountdown }) {
  const separator = (
    <span className="px-0.5 text-sm font-bold sm:text-base" style={{ color: EXPRESS_GREEN }}>
      :
    </span>
  );

  return (
    <div
      className="flex flex-wrap items-baseline gap-x-0.5 tabular-nums"
      aria-live="polite"
      aria-atomic="true"
    >
      <ExpressCountdownSegment value={remaining.days} unit="D" />
      {separator}
      <ExpressCountdownSegment value={remaining.hours} unit="H" />
      {separator}
      <ExpressCountdownSegment value={remaining.minutes} unit="M" />
      {separator}
      <ExpressCountdownSegment value={remaining.seconds} unit="S" />
    </div>
  );
}

function ShippingRowIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-100">
      {children}
    </div>
  );
}

export function ProductDetailExpressDeliveryBox() {
  const countdown = useExpressDeliveryCountdown();

  return (
    <div className="space-y-2">
      <p className="text-left text-[0.6875rem] font-bold uppercase tracking-wide text-neutral-900 sm:text-xs">
        Recíbelo hoy con envío express
      </p>

      <div
        className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
        style={{ borderColor: EXPRESS_GREEN, backgroundColor: EXPRESS_MINT_BG }}
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: EXPRESS_GREEN }}
          aria-hidden="true"
        >
          <span className="relative flex size-4 items-center justify-center">
            <Clock className="size-4 text-white" strokeWidth={2.25} />
            <Zap
              className="absolute -bottom-0.5 -right-1 size-2.5 fill-white text-white"
              strokeWidth={2.5}
            />
          </span>
        </div>

        <ExpressCountdownTimer remaining={countdown} />
      </div>
    </div>
  );
}

export function ProductDetailShippingRows({ variant = 'default' }: { variant?: 'default' | 'mockup' } = {}) {
  if (variant === 'mockup') {
    return (
      <ul className="space-y-3">
        <li className="flex gap-2.5">
          <ShippingRowIcon>
            <Truck className="size-4 text-neutral-500" aria-hidden="true" />
          </ShippingRowIcon>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-snug text-neutral-800 sm:text-[0.8125rem]">
              Envío gratis en Lima Metropolitana
            </p>
            <p className="mt-0.5 text-[0.6875rem] leading-snug text-neutral-500">
              Entrega entre 1 a 2 días hábiles.
            </p>
          </div>
        </li>

        <li className="flex gap-2.5">
          <ShippingRowIcon>
            <Package className="size-4 text-neutral-500" aria-hidden="true" />
          </ShippingRowIcon>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-snug text-neutral-800 sm:text-[0.8125rem]">
              Envíos a provincias
            </p>
            <p className="mt-0.5 text-[0.6875rem] leading-snug text-neutral-500">
              Entrega entre 2 a 4 días hábiles.
            </p>
          </div>
        </li>
      </ul>
    );
  }

  const limaRange = buildDeliveryRange(1, 3);
  const provinciasRange = buildDeliveryRange(2, 4);

  return (
    <ul className="space-y-3">
      <li className="flex gap-2.5">
        <ShippingRowIcon>
          <Truck className="size-4 text-neutral-500" aria-hidden="true" />
        </ShippingRowIcon>
        <div className="min-w-0">
          <p className="text-xs leading-snug sm:text-[0.8125rem]">
            <span className="font-bold" style={{ color: EXPRESS_GREEN }}>
              Envío gratis
            </span>
            <span className="text-neutral-800"> a Lima Metropolitana</span>
          </p>
          <p className="mt-0.5 text-[0.6875rem] leading-snug text-neutral-500">
            Llega entre el {limaRange}
          </p>
        </div>
      </li>

      <li className="flex gap-2.5">
        <ShippingRowIcon>
          <Package className="size-4 text-neutral-500" aria-hidden="true" />
        </ShippingRowIcon>
        <div className="min-w-0">
          <p
            className="text-xs font-bold leading-snug sm:text-[0.8125rem]"
            style={{ color: EXPRESS_GREEN }}
          >
            Envío a provincias: Disponible
          </p>
          <p className="mt-0.5 text-[0.6875rem] leading-snug text-neutral-500">
            Llega entre el {provinciasRange}
          </p>
        </div>
      </li>
    </ul>
  );
}
