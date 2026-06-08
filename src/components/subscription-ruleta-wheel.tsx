import { useMemo, type TransitionEvent } from 'react';

import {
  getRuletaConicGradient,
  getRuletaSegmentMidAngleDeg,
  SUBSCRIPTION_RULETA_PREMIOS,
} from '@/config/subscription-ruleta-premios';
import { cn } from '@/lib/utils';

const BULB_COUNT = 24;
const SPIN_DURATION_MS = 5200;
/** Pausa con el premio bajo el puntero antes del cuadro de felicidades. */
const REVEAL_DELAY_MS = 1600;
/** Radio de las bombillas en el borde exterior de la ruleta (% del contenedor). */
const BULB_RADIUS_PERCENT = 50;
/** Diámetro del hub «Ruleta del Color» respecto al disco interior (%). Origen polar = centro del disco. */
const HUB_DIAMETER_PERCENT = 31;
/** Borde interior del anillo de color (justo fuera del hub). */
const SEGMENT_RING_INNER_PERCENT = HUB_DIAMETER_PERCENT / 2 + 2;
/** Borde exterior del anillo de color (antes del marco dorado interior). */
const SEGMENT_RING_OUTER_PERCENT = 48.5;
/** Centro del anillo de color: todos los iconos en la misma circunferencia. */
const SEGMENT_ICON_RADIUS_PERCENT =
  (SEGMENT_RING_INNER_PERCENT + SEGMENT_RING_OUTER_PERCENT) / 2;
const WHEEL_CENTER_PERCENT = 50;
/** Desplazamiento del anillo de iconos (negativo = ligeramente a la izquierda). */
const ICON_RING_OFFSET_DEG = -8;

const SPIN_TRANSITION =
  'transition-transform duration-[5200ms] ease-[cubic-bezier(0.08,0.82,0.12,1)] motion-reduce:transition-none motion-reduce:duration-0';

interface SubscriptionRuletaWheelProps {
  diskRotation: number;
  isSpinAnimating: boolean;
  /** Índice del sector ganador (resalta al detenerse). */
  highlightIndex?: number | null;
  onSpinComplete?: () => void;
  className?: string;
}

/** Posición % desde el centro de la ruleta (= centro del hub «Ruleta del Color»). */
function polarPositionFromWheelCenter(angleDeg: number, radiusPercent: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${WHEEL_CENTER_PERCENT + radiusPercent * Math.cos(rad)}%`,
    top: `${WHEEL_CENTER_PERCENT + radiusPercent * Math.sin(rad)}%`,
  };
}

/** Mismo eje que el hub: centro geométrico de la ruleta. */
const WHEEL_PIVOT_TRANSFORM = 'translate(-50%, -50%)';

export function SubscriptionRuletaWheel({
  diskRotation,
  isSpinAnimating,
  highlightIndex = null,
  onSpinComplete,
  className,
}: SubscriptionRuletaWheelProps) {
  const gradient = useMemo(() => getRuletaConicGradient(), []);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || !isSpinAnimating) return;
    onSpinComplete?.();
  };

  return (
    <div className={cn('relative mx-auto w-full max-w-[430px] px-1 pb-6 pt-1', className)}>
      <div className="relative mx-auto aspect-square w-full max-w-[392px]">
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

        {/* Bombillas en el borde exterior (sobre el aro dorado) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 rounded-full"
        >
          {Array.from({ length: BULB_COUNT }).map((_, index) => {
            const angle = (index / BULB_COUNT) * 360 - 90;
            const { left, top } = polarPositionFromWheelCenter(angle, BULB_RADIUS_PERCENT);
            return (
              <span
                key={`bulb-${index}`}
                className="absolute block size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-50 shadow-[0_0_10px_4px_rgba(255,255,255,0.98),0_0_20px_8px_rgba(250,204,21,0.75)]"
                style={{ left, top }}
              />
            );
          })}
        </div>

        {/* Marco dorado exterior */}
        <div
          className={cn(
            'absolute inset-0 rounded-full p-[11px]',
            'bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700',
            'shadow-[0_0_28px_8px_rgba(251,191,36,0.35),0_0_52px_14px_rgba(251,191,36,0.28),inset_0_2px_4px_rgba(255,255,255,0.35)]',
          )}
        >
          <div className="relative size-full rounded-full bg-gradient-to-b from-amber-300/80 to-amber-800/90 p-[4px]">
            <div className="relative size-full overflow-hidden rounded-full shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]">
              {/* Disco giratorio: eje de rotación = centro del hub «Ruleta del Color» */}
              <div
                className={cn(
                  'pointer-events-none absolute left-1/2 top-1/2 size-full origin-center rounded-full',
                  isSpinAnimating ? SPIN_TRANSITION : 'transition-none',
                )}
                style={{
                  transform: `${WHEEL_PIVOT_TRANSFORM} rotate(${diskRotation}deg)`,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: gradient }}
                />

                {SUBSCRIPTION_RULETA_PREMIOS.map((premio, index) => {
                  const isWinner = highlightIndex === index;
                  const midAngle =
                    getRuletaSegmentMidAngleDeg(index) +
                    (premio.angleOffsetDeg ?? 0) +
                    ICON_RING_OFFSET_DEG;
                  const radius =
                    SEGMENT_ICON_RADIUS_PERCENT + (premio.radiusOffsetPercent ?? 0);
                  const { left, top } = polarPositionFromWheelCenter(midAngle, radius);
                  const Icon = premio.icon;

                  return (
                    <div
                      key={premio.id}
                      aria-hidden="true"
                      className={cn(
                        'absolute flex w-[4.1rem] flex-col items-center justify-center sm:w-[4.35rem]',
                        isWinner && 'z-20 scale-110 transition-transform duration-500',
                      )}
                      style={{
                        left,
                        top,
                        transform: `${WHEEL_PIVOT_TRANSFORM} rotate(${midAngle + 90}deg)`,
                      }}
                    >
                      <Icon
                        className={cn(
                          'size-6 shrink-0 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] sm:size-7',
                          isWinner &&
                            'drop-shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(251,191,36,0.85)]',
                        )}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="mt-0.5 w-full text-center leading-[1.05] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65),0_0_6px_rgba(0,0,0,0.35)]">
                        <span className="block text-[0.52rem] font-extrabold uppercase tracking-tight sm:text-[0.58rem]">
                          {premio.label}
                        </span>
                        <span className="mt-0.5 block text-[0.46rem] font-bold uppercase sm:text-[0.52rem]">
                          {premio.sublabel}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Centro fijo — eje de la ruleta (no gira con el disco) */}
              <div
                className="absolute left-1/2 top-1/2 z-10 flex aspect-square flex-col items-center justify-center gap-1.5 rounded-full border-[3px] border-amber-400 bg-white px-2.5 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:px-3 sm:py-3"
                style={{
                  width: `${HUB_DIAMETER_PERCENT}%`,
                  height: `${HUB_DIAMETER_PERCENT}%`,
                  transform: WHEEL_PIVOT_TRANSFORM,
                }}
              >
                <p className="text-center text-[0.62rem] font-bold uppercase leading-[1.08] tracking-wide text-black sm:text-[0.74rem]">
                  <span className="block">Ruleta</span>
                  <span className="block">del Color</span>
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

export { REVEAL_DELAY_MS, SPIN_DURATION_MS };
