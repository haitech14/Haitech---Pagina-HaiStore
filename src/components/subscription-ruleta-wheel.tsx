import { useLayoutEffect, useMemo, useRef } from 'react';
import { RotateCw } from 'lucide-react';

import {
  getRuletaConicGradient,
  getRuletaSegmentMidAngleDeg,
  RULETA_ICON_RING_OFFSET_DEG,
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

const SPIN_EASING = 'cubic-bezier(0.08, 0.82, 0.12, 1)';

interface SubscriptionRuletaWheelProps {
  diskRotation: number;
  isSpinAnimating: boolean;
  /** Grados a sumar en el giro actual (null = sin giro programado). */
  spinDeltaDeg?: number | null;
  /** Incrementa en cada giro para disparar la animación una sola vez. */
  spinToken?: number;
  /** Índice del sector ganador (resalta al detenerse). */
  highlightIndex?: number | null;
  onSpinComplete?: (finalRotationDeg: number) => void;
  className?: string;
  isSpinning?: boolean;
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
const WHEEL_PIVOT_TRANSFORM = 'translate3d(-50%, -50%, 0)';

const SEGMENT_LABEL_SHADOW =
  '0 1px 0 rgba(0,0,0,0.85), 1px 0 0 rgba(0,0,0,0.55), -1px 0 0 rgba(0,0,0,0.55)';

export function SubscriptionRuletaWheel({
  diskRotation,
  isSpinAnimating,
  spinDeltaDeg = null,
  spinToken = 0,
  highlightIndex = null,
  onSpinComplete,
  className,
  isSpinning = false,
}: SubscriptionRuletaWheelProps) {
  const gradient = useMemo(() => getRuletaConicGradient(), []);
  const diskRef = useRef<HTMLDivElement>(null);
  const spinAnimationRef = useRef<Animation | null>(null);
  const activeSpinTokenRef = useRef(0);
  const onSpinCompleteRef = useRef(onSpinComplete);

  useLayoutEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  useLayoutEffect(() => {
    if (!isSpinAnimating || spinDeltaDeg == null || spinDeltaDeg === 0) return;

    const disk = diskRef.current;
    if (!disk) return;

    activeSpinTokenRef.current = spinToken;
    spinAnimationRef.current?.cancel();

    const fromDeg = diskRotation;
    const toDeg = fromDeg + spinDeltaDeg;
    const fromTransform = `${WHEEL_PIVOT_TRANSFORM} rotate(${fromDeg}deg)`;
    const toTransform = `${WHEEL_PIVOT_TRANSFORM} rotate(${toDeg}deg)`;

    disk.style.transform = fromTransform;

    const animation = disk.animate(
      [{ transform: fromTransform }, { transform: toTransform }],
      {
        duration: SPIN_DURATION_MS,
        easing: SPIN_EASING,
        fill: 'forwards',
      },
    );

    spinAnimationRef.current = animation;

    const finish = () => {
      if (activeSpinTokenRef.current !== spinToken) return;
      disk.style.transform = toTransform;
      onSpinCompleteRef.current?.(toDeg);
    };

    animation.onfinish = finish;
    animation.oncancel = () => {
      spinAnimationRef.current = null;
    };

    return () => {
      animation.cancel();
      spinAnimationRef.current = null;
    };
    // diskRotation: valor al iniciar el giro (cuando cambia spinToken).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo reaccionar al token de giro
  }, [isSpinAnimating, spinDeltaDeg, spinToken]);

  return (
    <div className={cn('relative mx-auto w-full max-w-[360px]', className)}>
      <div className="relative mx-auto aspect-square w-full">
        {/* Puntero rojo fijo */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1"
        >
          <div className="relative flex flex-col items-center">
            <div className="size-0 border-x-[11px] border-b-[20px] border-x-transparent border-b-red-600 drop-shadow-[0_2px_6px_rgba(220,38,38,0.55)]" />
            <div className="absolute top-[2px] size-0 border-x-[7px] border-b-[13px] border-x-transparent border-b-red-400" />
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
            'absolute inset-0 rounded-full p-[10px]',
            'bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700',
            'shadow-[0_0_32px_10px_rgba(251,191,36,0.4),0_0_60px_16px_rgba(251,191,36,0.22),inset_0_2px_4px_rgba(255,255,255,0.35)]',
          )}
        >
          <div className="relative size-full rounded-full bg-gradient-to-b from-amber-300/80 to-amber-800/90 p-[4px]">
            <div className="relative size-full overflow-hidden rounded-full shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]">
              {/* Disco giratorio: eje de rotación = centro del hub «Ruleta del Color» */}
              <div
                ref={diskRef}
                className="pointer-events-none absolute left-1/2 top-1/2 size-full origin-center rounded-full will-change-transform"
                style={
                  isSpinAnimating
                    ? undefined
                    : {
                        transform: `${WHEEL_PIVOT_TRANSFORM} rotate(${diskRotation}deg)`,
                      }
                }
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
                    RULETA_ICON_RING_OFFSET_DEG;
                  const radius =
                    SEGMENT_ICON_RADIUS_PERCENT + (premio.radiusOffsetPercent ?? 0);
                  const { left, top } = polarPositionFromWheelCenter(midAngle, radius);
                  const Icon = premio.icon;

                  return (
                    <div
                      key={premio.id}
                      aria-hidden="true"
                      className={cn(
                        'absolute flex w-[4.75rem] flex-col items-center justify-center sm:w-[5.25rem]',
                        isWinner && 'z-20 scale-105 transition-transform duration-500',
                      )}
                      style={{
                        left,
                        top,
                        transform: `${WHEEL_PIVOT_TRANSFORM} rotate(${Math.round(midAngle + 90)}deg)`,
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      <Icon
                        className={cn(
                          'size-7 shrink-0 text-white sm:size-8',
                          isWinner && 'brightness-110',
                        )}
                        strokeWidth={2}
                        aria-hidden="true"
                        style={{
                          filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.75))',
                        }}
                      />
                      <span
                        className="mt-0.5 w-full text-center leading-[1.1] text-white"
                        style={{ textShadow: SEGMENT_LABEL_SHADOW }}
                      >
                        <span className="block text-[0.62rem] font-bold uppercase tracking-wide sm:text-[0.7rem]">
                          {premio.label}
                        </span>
                        <span className="mt-0.5 block text-[0.56rem] font-semibold uppercase sm:text-[0.64rem]">
                          {premio.sublabel}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Centro fijo — decorativo «Girar ahora» */}
              <div
                className="absolute left-1/2 top-1/2 z-10 flex aspect-square flex-col items-center justify-center gap-1 rounded-full border-[3px] border-amber-400 bg-white px-2 py-2 shadow-[0_4px_18px_rgba(0,0,0,0.3)] sm:px-2.5 sm:py-2.5"
                style={{
                  width: `${HUB_DIAMETER_PERCENT}%`,
                  height: `${HUB_DIAMETER_PERCENT}%`,
                  transform: WHEEL_PIVOT_TRANSFORM,
                }}
              >
                <p className="text-center text-[0.58rem] font-extrabold uppercase leading-[1.05] tracking-wide text-neutral-900 sm:text-[0.68rem]">
                  <span className="block">{isSpinning ? 'Girando' : 'Girar'}</span>
                  <span className="block">{isSpinning ? '…' : 'ahora'}</span>
                </p>
                <RotateCw
                  className={cn(
                    'size-5 text-red-600 sm:size-6',
                    isSpinning && 'animate-spin',
                  )}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { REVEAL_DELAY_MS, SPIN_DURATION_MS };
