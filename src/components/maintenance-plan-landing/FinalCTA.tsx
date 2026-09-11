import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MAINTENANCE_PLAN_CALCULATOR_ID } from '@/data/maintenance-plan';
import { cn } from '@/lib/utils';

function scrollToCalculator() {
  document.getElementById(MAINTENANCE_PLAN_CALCULATOR_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function FinalCTA({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="maintenance-final-cta-title"
      className={cn('bg-white py-12 sm:py-16', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-[#E30613]/20 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#2a0a0c] px-6 py-10 text-center shadow-[0_24px_48px_-28px_rgba(15,23,42,0.55)] sm:px-10 sm:py-14">
          <h2
            id="maintenance-final-cta-title"
            className="mx-auto max-w-2xl text-balance text-2xl font-black tracking-tight text-white sm:text-3xl"
          >
            Enfócate en tu negocio, nosotros cuidamos tus equipos.
          </h2>
          <div className="mt-7 flex justify-center">
            <Button
              type="button"
              className="h-12 gap-1.5 bg-[#E30613] px-6 text-sm font-bold text-white hover:bg-[#c40511]"
              onClick={scrollToCalculator}
            >
              Solicitar mi plan
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
