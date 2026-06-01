import { useMemo } from 'react';

import {
  getWheelGradient,
  wheelPrizes,
  WHEEL_SEGMENT_ANGLE,
} from '@/data/wheel-prizes';
import { cn } from '@/lib/utils';

const BULB_COUNT = 18;
const BULB_RADIUS_PERCENT = 49;
/** Iconos más hacia el centro del disco. */
const ICON_RADIUS_PERCENT = 27;
/** Texto un poco más exterior que el icono. */
const TEXT_RADIUS_PERCENT = 34;

const SPIN_TRANSITION =
  'transition-transform duration-[4500ms] ease-[cubic-bezier(0.12,0.75,0.22,1)] motion-reduce:transition-none';

interface ColorWheelProps {
  rotation: number;
  spinning: boolean;
  className?: string;
}

function polarPosition(angleDeg: number, radiusPercent: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPercent * Math.cos(rad)}%`,
    top: `${50 + radiusPercent * Math.sin(rad)}%`,
  };
}

export function ColorWheel({ rotation, spinning, className }: ColorWheelProps) {
  const gradient = useMemo(() => getWheelGradient(), []);

  return (
    <div className={cn('relative mx-auto w-full max-w-[420px] px-2 pb-8 pt-2', className)}>
      {/* Confeti */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { pos: 'left-[4%] top-[8%]', color: 'bg-pink-400', size: 'size-2.5' },
          { pos: 'left-[14%] top-[18%]', color: 'bg-yellow-300', size: 'size-1.5' },
          { pos: 'left-[22%] top-[4%]', color: 'bg-cyan-400', size: 'size-2' },
          { pos: 'right-[8%] top-[10%]', color: 'bg-purple-400', size: 'size-2.5' },
          { pos: 'right-[18%] top-[22%]', color: 'bg-green-400', size: 'size-1.5' },
          { pos: 'right-[4%] top-[32%]', color: 'bg-orange-400', size: 'size-2' },
          { pos: 'left-[6%] bottom-[28%]', color: 'bg-blue-400', size: 'size-2' },
          { pos: 'right-[12%] bottom-[24%]', color: 'bg-rose-400', size: 'size-1.5' },
        ].map((piece) => (
          <span
            key={piece.pos}
            className={cn(
              'absolute rotate-45 rounded-sm opacity-90',
              piece.pos,
              piece.color,
              piece.size,
            )}
          />
        ))}
      </div>

      {/* Escenario / plataforma inferior */}
      <div aria-hidden="true" className="absolute inset-x-[8%] bottom-0 flex flex-col items-center">
        <div className="h-5 w-[88%] rounded-[100%] bg-purple-400/25 blur-md" />
        <div className="h-6 w-full -mt-2 rounded-[100%] bg-gradient-to-b from-violet-500/55 via-purple-600/45 to-indigo-900/60 shadow-[0_0_40px_rgba(139,92,246,0.55)]" />
        <div className="h-3 w-[72%] -mt-1 rounded-[100%] bg-violet-300/20 blur-sm" />
      </div>

      {/* Ruleta */}
      <div className="relative mx-auto aspect-square w-full max-w-[380px]">
        {/* Puntero dorado fijo */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-2px] z-30 -translate-x-1/2"
        >
          <div className="relative flex flex-col items-center">
            <div className="size-0 border-x-[16px] border-b-[26px] border-x-transparent border-b-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
            <div className="absolute top-[2px] size-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-amber-200" />
          </div>
        </div>

        {/* Marco dorado fijo con bombillas */}
        <div
          className={cn(
            'absolute inset-0 rounded-full p-[7px]',
            'bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700',
            'shadow-[0_0_35px_rgba(251,191,36,0.45),inset_0_2px_4px_rgba(255,255,255,0.35)]',
          )}
        >
          {/* Bombillas sobre el borde dorado */}
          {Array.from({ length: BULB_COUNT }).map((_, index) => {
            const angle = (index / BULB_COUNT) * 360 - 90;
            const { left, top } = polarPosition(angle, BULB_RADIUS_PERCENT);
            return (
              <span
                key={index}
                aria-hidden="true"
                className="pointer-events-none absolute z-20 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-100 shadow-[0_0_8px_2px_rgba(254,240,138,0.95),0_0_14px_4px_rgba(250,204,21,0.45)]"
                style={{ left, top }}
              />
            );
          })}

          <div className="relative size-full rounded-full bg-gradient-to-b from-amber-300/80 to-amber-800/90 p-[5px]">
            {/* Disco giratorio */}
            <div
              className={cn(
                'relative size-full overflow-hidden rounded-full',
                'shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]',
                spinning ? SPIN_TRANSITION : 'transition-none',
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: gradient }}
              />

              {/* Premios — uno por segmento de color */}
              {wheelPrizes.map((prize, index) => {
                const midAngle =
                  index * WHEEL_SEGMENT_ANGLE + WHEEL_SEGMENT_ANGLE / 2 - 90;
                const iconPos = polarPosition(midAngle, ICON_RADIUS_PERCENT);
                const textPos = polarPosition(midAngle, TEXT_RADIUS_PERCENT);
                const Icon = prize.icon;
                const upright = -(rotation + midAngle);

                return (
                  <div key={prize.id} aria-hidden="true">
                    {/* Icono centrado en el eje del segmento */}
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
                          'flex size-8 items-center justify-center sm:size-9',
                          spinning ? SPIN_TRANSITION : 'transition-none',
                        )}
                        style={{ transform: `rotate(${upright}deg)` }}
                      >
                        <Icon
                          className="wheel-segment-icon size-5 sm:size-[1.35rem]"
                          strokeWidth={1.35}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    {/* Etiquetas en radio exterior */}
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
                          'flex w-[4.5rem] flex-col items-center text-center sm:w-[5rem]',
                          spinning ? SPIN_TRANSITION : 'transition-none',
                        )}
                        style={{ transform: `rotate(${upright}deg)` }}
                      >
                        <div className="leading-[1.05] text-white">
                          <span className="block text-[0.58rem] font-extrabold uppercase tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-[0.66rem]">
                            {prize.label}
                          </span>
                          <span className="block text-[0.52rem] font-bold capitalize drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-[0.58rem]">
                            {prize.sublabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Centro — contrarrotación para mantener texto legible */}
              <div
                className={cn(
                  'absolute left-1/2 top-1/2 z-10 size-[20%] min-w-[62px]',
                  spinning ? SPIN_TRANSITION : 'transition-none',
                )}
                style={{ transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
              >
                <div className="flex size-full flex-col items-center justify-center rounded-full border-[3px] border-amber-400 bg-white px-2 py-1.5 text-center shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                  <p className="font-extrabold uppercase leading-[1.05] tracking-wide text-[#1e3a8a]">
                    <span className="block text-[0.46rem] sm:text-[0.52rem]">Gira</span>
                    <span className="block text-[0.46rem] sm:text-[0.52rem]">y Gana</span>
                  </p>
                  <div className="mt-1.5 flex gap-1" aria-hidden="true">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="size-2 rounded-full bg-yellow-400" />
                    <span className="size-2 rounded-full bg-green-500" />
                    <span className="size-2 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-exportar utilidades para compatibilidad con el modal.
export {
  computeWheelRotation,
  getPrizeByIndex,
  pickRandomPrizeIndex,
} from '@/data/wheel-prizes';
