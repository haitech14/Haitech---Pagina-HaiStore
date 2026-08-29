import { HaitechHomeCategoryNavigation } from '@/components/haitech-home/haitech-home-category-navigation';
import { HaitechHomeMainHeader } from '@/components/haitech-home/haitech-home-main-header';
import { HaitechHomeTopBar } from '@/components/haitech-home/haitech-home-top-bar';
import { cn } from '@/lib/utils';

/** Header storefront unificado (home + páginas internas). */
export function HaitechStorefrontHeader({ className }: { className?: string }) {
  return (
    <>
      {/* Top + main fuera del sticky para que la nav pueda fijarse en todo el scroll */}
      <div className={cn('w-full overflow-visible bg-white', className)}>
        <HaitechHomeTopBar />
        <HaitechHomeMainHeader />
      </div>
      <HaitechHomeCategoryNavigation />
    </>
  );
}
