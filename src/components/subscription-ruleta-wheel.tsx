import { useMemo } from 'react';

import {
  getRuletaConicGradient,
  RULETA_SEGMENT_ANGLE,
  SUBSCRIPTION_RULETA_PREMIOS,
} from '@/config/subscription-ruleta-premios';
import { cn } from '@/lib/utils';

const BULB_COUNT = 24;
const SPIN_DURATION_MS = 4600;
/** Centro del aro dorado (% desde el centro del disco). */
const BULB_RADIUS_PERCENT = 49;
const ICON_RADIUS_PERCENT = 27;
const TEXT_RADIUS_PERCENT = 34;

const SPIN_TRANSITION =
  'transition-transform duration-[4600ms] ease-[cubic-bezier(0.12,0.75,0.22,1)] motion-reduce:transition-none motion-reduce:duration-0';

interface SubscriptionRuletaWheelProps {
  idleDiskRotation: number;
  spinRotation: number;
  isSpinning: boolean;
  className?: string;
}

/** Convierte ángulo (0° = derecha, -90° = arriba) a posición % en el disco. */
function polarPosition(angleDeg: number, radiusPercent: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPercent * Math.cos(rad)}%`,
    top: `${50 + radiusPercent * Math.sin(rad)}%`,
  };
}

export function SubscriptionRuletaWheel({
  idleDiskRotation,
  spinRotation,
  isSpinning,
  className,
}: SubscriptionRuletaWheelProps) {
  const gradient = useMemo(() => getRuletaConicGradient(), []);

  const diskRotation = isSpinning ? spinRotation : idleDiskRotation;

  return (
    <div className={cn('relative mx-auto w-full max-w-[400px] px-1 pb-6 pt-1', className)}>
      <div className="relative mx-auto aspect-square w-full max-w-[360px]">
        {/* Puntero dorado fijo */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-2px] z-30 -translate-x-1/2"
        >
          <div className="relative flex flex-col items-center">
            <div className="size-0 border-x-[14px] border-b-[24px] border-x-transparent border-b-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
            <div className="absolute top-[2px] size-0 border-x-[9px] border-b-[16px] border-x-transparent border-b-amber-200" />
          </div>
        </div>

        {/* Marco dorado exterior */}
        <div
          className={cn(
            'absolute inset-0 rounded-full p-[9px]',
            'bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700',
            'shadow-[0_0_35px_rgba(251,191,36,0.45),inset_0_2px_4px_rgba(255,255,255,0.35)]',
          )}
        >
          {/* Bombillas distribuidas sobre el borde dorado */}
          {Array.from({ length: BULB_COUNT }).map((_, index) => {
            const angle = (index / BULB_COUNT) * 360 - 90;
            const { left, top } = polarPosition(angle, BULB_RADIUS_PERCENT);
            return (
              <span
                key={`bulb-${index}`}
                aria-hidden="true"
                className="pointer-events-none absolute z-20 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-50 shadow-[0_0_9px_3px_rgba(255,255,255,0.95),0_0_16px_5px_rgba(250,204,21,0.6)]"
                style={{ left, top }}
              />
            );
          })}

          <div className="relative size-full rounded-full bg-gradient-to-b from-amber-300/80 to-amber-800/90 p-[4px]">
            <div className="relative size-full overflow-hidden rounded-full shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]">
              {/* Disco de color + premios por segmento */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 rounded-full',
                  isSpinning ? SPIN_TRANSITION : 'transition-none',
                )}
                style={{ transform: `rotate(${diskRotation}deg)` }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: gradient }}
                />

                {SUBSCRIPTION_RULETA_PREMIOS.map((premio, index) => {
                  const midAngle =
                    index * RULETA_SEGMENT_ANGLE + RULETA_SEGMENT_ANGLE / 2 - 90;
                  const iconPos = polarPosition(midAngle, ICON_RADIUS_PERCENT);
                  const textPos = polarPosition(midAngle, TEXT_RADIUS_PERCENT);
                  const Icon = premio.icon;
                  const upright = -(diskRotation + midAngle);

                  return (
                    <div key={premio.id} aria-hidden="true">
                      <div
                        className="absolute size-0"
                        style={{
                          left: iconPos.left,
                          top: iconPos.top,
                          transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                        }}
                      >
                        <div
                          className={cn(
                            'flex size-7 items-center justify-center sm:size-8',
                            isSpinning ? SPIN_TRANSITION : 'transition-none',
                          )}
                          style={{ transform: `rotate(${upright}deg)` }}
                        >
                          <Icon
                            className="wheel-segment-icon size-[1.1rem] shrink-0 sm:size-5"
                            strokeWidth={1.35}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div
                        className="absolute size-0"
                        style={{
                          left: textPos.left,
                          top: textPos.top,
                          transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                        }}
                      >
                        <div
                          className={cn(
                            'flex w-[4.25rem] flex-col items-center text-center sm:w-[4.5rem]',
                            isSpinning ? SPIN_TRANSITION : 'transition-none',
                          )}
                          style={{ transform: `rotate(${upright}deg)` }}
                        >
                          <span className="leading-[1.06] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65),0_0_6px_rgba(0,0,0,0.35)]">
                            <span className="block text-[0.52rem] font-extrabold uppercase tracking-tight sm:text-[0.58rem]">
                              {premio.label}
                            </span>
                            <span className="mt-0.5 block text-[0.46rem] font-bold uppercase sm:text-[0.52rem]">
                              {premio.sublabel}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centro fijo — texto a la izquierda, puntos finos a la derecha */}
              <div className="absolute left-1/2 top-1/2 z-10 flex size-[24%] min-w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-1 rounded-full border-[3px] border-amber-400 bg-white px-2 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:min-w-[82px] sm:px-2.5">
                <p className="font-black uppercase leading-[1.02] tracking-wide text-black">
                  <span className="block text-[0.44rem] sm:text-[0.5rem]">Gira</span>
                  <span className="block text-[0.44rem] sm:text-[0.5rem]">y gana</span>
                </p>
                <div className="flex shrink-0 flex-col gap-[3px]" aria-hidden="true">
                  <span className="size-1 rounded-full bg-red-500" />
                  <span className="size-1 rounded-full bg-yellow-400" />
                  <span className="size-1 rounded-full bg-green-500" />
                  <span className="size-1 rounded-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SPIN_DURATION_MS };
