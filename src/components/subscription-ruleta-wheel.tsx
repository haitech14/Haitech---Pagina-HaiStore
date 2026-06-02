import { useMemo } from 'react';

import {
  getRuletaConicGradient,
  RULETA_SEGMENT_ANGLE,
  SUBSCRIPTION_RULETA_PREMIOS,
} from '@/config/subscription-ruleta-premios';
import { cn } from '@/lib/utils';

const BULB_COUNT = 24;
const SPIN_DURATION_MS = 4600;
/** Mitad del grosor del marco dorado (p-[9px]) para centrar focos en el borde. */
const GOLD_FRAME_PADDING_PX = 9;
const BULB_RADIUS_PERCENT = 50;
/** Radio del bloque icono + texto (% desde el centro; menor = más cerca del hub). */
const SEGMENT_CONTENT_RADIUS_PERCENT = 24;
/** Ajuste fino para centrar iconos en el medio de cada color. */
const SEGMENT_CONTENT_ANGLE_OFFSET_DEG = 0;

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
          {/* Bombillas centradas en el borde dorado */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{ inset: `${GOLD_FRAME_PADDING_PX / 2}px` }}
          >
            {Array.from({ length: BULB_COUNT }).map((_, index) => {
              const angle = (index / BULB_COUNT) * 360 - 90;
              const { left, top } = polarPosition(angle, BULB_RADIUS_PERCENT);
              return (
                <span
                  key={`bulb-${index}`}
                  className="absolute z-20 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-50 shadow-[0_0_9px_3px_rgba(255,255,255,0.95),0_0_16px_5px_rgba(250,204,21,0.6)]"
                  style={{ left, top }}
                />
              );
            })}
          </div>

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
                    index * RULETA_SEGMENT_ANGLE +
                    RULETA_SEGMENT_ANGLE / 2 -
                    90 +
                    SEGMENT_CONTENT_ANGLE_OFFSET_DEG;
                  const contentPos = polarPosition(midAngle, SEGMENT_CONTENT_RADIUS_PERCENT);
                  const Icon = premio.icon;

                  return (
                    <div
                      key={premio.id}
                      aria-hidden="true"
                      className="absolute size-0"
                      style={{
                        left: contentPos.left,
                        top: contentPos.top,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={cn(
                          'flex w-[4rem] flex-col items-center gap-0.5 text-center sm:w-[4.25rem]',
                          isSpinning ? SPIN_TRANSITION : 'transition-none',
                        )}
                        style={{ transform: `rotate(${-diskRotation}deg)` }}
                      >
                        <div className="flex size-8 items-center justify-center sm:size-9">
                          <Icon
                            className="wheel-segment-icon size-5 shrink-0 sm:size-6"
                            strokeWidth={1.25}
                            aria-hidden="true"
                          />
                        </div>
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
                  );
                })}
              </div>

              {/* Centro fijo — «Gira y gana» centrado */}
              <div className="absolute left-1/2 top-1/2 z-10 flex size-[32%] min-w-[96px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-full border-[3px] border-amber-400 bg-white px-2.5 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:min-w-[108px] sm:px-3 sm:py-3">
                <p className="text-center text-[0.72rem] font-bold uppercase leading-[1.08] tracking-wide text-black sm:text-[0.88rem]">
                  <span className="block">Gira</span>
                  <span className="block">y gana</span>
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-1.5 rounded-full bg-red-500" />
                  <span className="size-1.5 rounded-full bg-yellow-400" />
                  <span className="size-1.5 rounded-full bg-green-500" />
                  <span className="size-1.5 rounded-full bg-blue-500" />
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
