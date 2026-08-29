import { cn } from '@/lib/utils';

import { HaitechHomeShowcaseSection } from '@/components/haitech-home/landing/haitech-home-showcase-section';

/** Bloque landing B2B: beneficios. */
export function HaitechHomeLandingSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full bg-white', className)}>
      <HaitechHomeShowcaseSection />
    </div>
  );
}
