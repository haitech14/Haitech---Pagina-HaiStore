import { useEffect, useState } from 'react';

import { getNextFlashOfferEnd } from '@/data/ricoh-flash-offers';
import { cn } from '@/lib/utils';

function padTwo(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}

function remainingUntilNextCycle(now = Date.now()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const end = Date.parse(getNextFlashOfferEnd(now));
  const totalMs = Math.max(0, end - now);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, totalMs };
}

interface OfferCountdownProps {
  className?: string;
}

export function OfferCountdown({ className }: OfferCountdownProps) {
  const [parts, setParts] = useState(() => remainingUntilNextCycle());

  useEffect(() => {
    const tick = () => setParts(remainingUntilNextCycle());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    { value: padTwo(parts.days), label: 'DÍAS' },
    { value: padTwo(parts.hours), label: 'HRS' },
    { value: padTwo(parts.minutes), label: 'MIN' },
    { value: padTwo(parts.seconds), label: 'SEG' },
  ] as const;

  return (
    <div
      className={cn(
        'rounded-xl border border-white/16 bg-[rgba(130,0,10,0.22)] p-2.5',
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Oferta termina en ${parts.days} días, ${parts.hours} horas, ${parts.minutes} minutos y ${parts.seconds} segundos`}
    >
      <div className="flex items-center justify-between gap-0.5 sm:gap-1">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex min-w-0 flex-1 items-center">
            {index > 0 ? (
              <span
                className="mx-0.5 shrink-0 text-[16px] font-bold leading-none text-white sm:text-[18px]"
                aria-hidden="true"
              >
                :
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-10 w-full min-w-[40px] max-w-[52px] items-center justify-center rounded-lg',
                  'border border-white/12 bg-[rgba(180,0,15,0.25)]',
                  'font-[family-name:var(--font-infobox)] text-[20px] font-bold tabular-nums text-white',
                  'sm:h-12 sm:min-w-[52px] sm:text-[24px]',
                )}
              >
                {unit.value}
              </span>
              <span className="font-[family-name:var(--font-infobox)] text-[8px] font-medium uppercase tracking-[0.08em] text-white sm:text-[9px]">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
