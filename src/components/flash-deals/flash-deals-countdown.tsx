import { useEffect, useState } from 'react';

import {
  getSecondsUntilLimaMidnight,
  splitCountdown,
} from '@/lib/flash-deals';

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

interface CountdownUnitProps {
  value: string;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className="flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-xl border border-amber-200/80 bg-white px-2 text-2xl font-black tabular-nums text-neutral-900 shadow-[0_4px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(251,191,36,0.25)] sm:min-h-14 sm:min-w-[3.5rem] sm:text-3xl"
        aria-hidden="true"
      >
        {value}
      </span>
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-amber-100/90 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function FlashDealsCountdown() {
  const [remaining, setRemaining] = useState(() => getSecondsUntilLimaMidnight());

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tick = () => setRemaining(getSecondsUntilLimaMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { hours, minutes, seconds } = splitCountdown(remaining);

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-2.5"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Tiempo restante de ofertas: ${hours} horas, ${minutes} minutos y ${seconds} segundos`}
    >
      <CountdownUnit value={padTwo(hours)} label="Hrs" />
      <span className="pb-6 text-2xl font-black text-amber-400/70 sm:pb-7 sm:text-3xl" aria-hidden="true">
        :
      </span>
      <CountdownUnit value={padTwo(minutes)} label="Min" />
      <span className="pb-6 text-2xl font-black text-amber-400/70 sm:pb-7 sm:text-3xl" aria-hidden="true">
        :
      </span>
      <CountdownUnit value={padTwo(seconds)} label="Seg" />
    </div>
  );
}
