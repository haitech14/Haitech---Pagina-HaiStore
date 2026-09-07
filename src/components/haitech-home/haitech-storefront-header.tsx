import { HaitechHomeMainHeader } from '@/components/haitech-home/haitech-home-main-header';
import { HaitechHomeTopBar } from '@/components/haitech-home/haitech-home-top-bar';
import { MegaMenuBackdropProvider } from '@/components/layout/mega-menu-backdrop';
import { cn } from '@/lib/utils';

/** Header storefront unificado (home + páginas internas). */
export function HaitechStorefrontHeader({ className }: { className?: string }) {
  return (
    <MegaMenuBackdropProvider>
      <div className={cn('relative z-50 w-full overflow-visible bg-white', className)}>
        <HaitechHomeTopBar />
        <HaitechHomeMainHeader />
      </div>
    </MegaMenuBackdropProvider>
  );
}