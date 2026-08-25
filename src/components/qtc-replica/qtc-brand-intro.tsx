import { ShoppingBag } from 'lucide-react';

import { QTC } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

export function QtcBrandIntro({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} style={{ minHeight: 90 }}>
      <div
        className="mx-auto flex min-h-[90px] items-center justify-center gap-3 px-4 py-5"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <ShoppingBag
          className="size-8 shrink-0 sm:size-9"
          style={{ color: QTC.orange }}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h2
          className="text-center text-[20px] font-bold leading-snug sm:text-[23px]"
          style={{ color: QTC.text }}
        >
          QTC Perú | Lo mejor de DJI, Xiaomi, HONOR, OPPO y más
        </h2>
      </div>
    </section>
  );
}
