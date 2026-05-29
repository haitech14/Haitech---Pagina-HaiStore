import { useMemo } from 'react';

import {
  getWheelGradient,
  wheelPrizes,
  WHEEL_SEGMENT_ANGLE,
} from '@/data/wheel-prizes';
import { cn } from '@/lib/utils';

const BULB_COUNT = 18;

interface ColorWheelProps {
  rotation: number;
  spinning: boolean;
  className?: string;
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
          <div className="relative size-full rounded-full bg-gradient-to-b from-amber-300/80 to-amber-800/90 p-[5px]">
            {/* Bombillas */}
            {Array.from({ length: BULB_COUNT }).map((_, index) => {
              const angle = (index / BULB_COUNT) * 360 - 90;
              return (
                <span
                  key={index}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 z-20 block size-0"
                  style={{ transform: `rotate(${angle}deg) translateY(-175px)` }}
                >
                  <span className="absolute left-0 top-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-100 shadow-[0_0_8px_2px_rgba(254,240,138,0.95),0_0_14px_4px_rgba(250,204,21,0.45)]" />
                </span>
              );
            })}

            {/* Disco giratorio */}
            <div
              className={cn(
                'relative size-full overflow-hidden rounded-full',
                'shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]',
                spinning
                  ? 'transition-transform duration-[4500ms] ease-[cubic-bezier(0.12,0.75,0.22,1)] motion-reduce:transition-none'
                  : 'transition-none',
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: gradient }}
              />

              {/* Separadores entre segmentos */}
              {wheelPrizes.map((_, index) => {
                const angle = index * WHEEL_SEGMENT_ANGLE - 90;
                return (
                  <div
                    key={`divider-${index}`}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-white/30"
                    style={{ transform: `rotate(${angle}deg) translateX(-50%)` }}
                  />
                );
              })}

              {/* Premios */}
              {wheelPrizes.map((prize, index) => {
                const angle = index * WHEEL_SEGMENT_ANGLE + WHEEL_SEGMENT_ANGLE / 2 - 90;
                const Icon = prize.icon;

                return (
                  <div
                    key={prize.id}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 w-1/2 origin-left"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div
                      className="flex w-[108px] -translate-y-1/2 flex-col items-center gap-1 pl-[54%] text-center sm:w-[118px] sm:pl-[56%]"
                      style={{ color: prize.color }}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] sm:size-11">
                        <Icon
                          className="size-5 sm:size-6"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-[0.62rem] font-extrabold uppercase leading-[1.05] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)] sm:text-[0.7rem]">
                        {prize.label}
                      </span>
                      <span className="text-[0.56rem] font-bold capitalize leading-tight sm:text-[0.64rem]">
                        {prize.sublabel}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Centro */}
              <div className="absolute left-1/2 top-1/2 z-10 flex size-[30%] min-w-[80px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-amber-400 bg-white px-2 py-1.5 text-center shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                <p className="font-extrabold uppercase leading-[1.05] tracking-wide text-[#1e3a8a]">
                  <span className="block text-[0.5rem] sm:text-[0.56rem]">Ruleta</span>
                  <span className="block text-[0.5rem] sm:text-[0.56rem]">del Color</span>
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
  );
}

// Re-exportar utilidades para compatibilidad con el modal.
export {
  computeWheelRotation,
  getPrizeByIndex,
  pickRandomPrizeIndex,
} from '@/data/wheel-prizes';
