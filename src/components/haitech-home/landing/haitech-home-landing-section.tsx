import { cn } from '@/lib/utils';

import { HaitechHomeShowcaseSection } from '@/components/haitech-home/landing/haitech-home-showcase-section';
import { TrustedBrands } from '@/components/haitech-home/landing/trusted-brands';
import { HAITECH_SHOWCASE_MAX_WIDTH } from '@/data/haitech-home-showcase';

/** Bloque landing B2B: beneficios → marcas. */
export function HaitechHomeLandingSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full bg-white', className)}>
      <HaitechHomeShowcaseSection />

      <div
        className="mx-auto px-3 sm:px-4 lg:px-6"
        style={{ maxWidth: HAITECH_SHOWCASE_MAX_WIDTH }}
      >
        <TrustedBrands />
      </div>
    </div>
  );
}
