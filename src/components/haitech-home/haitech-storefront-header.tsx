import { HaitechHomeCategoryNavigation } from '@/components/haitech-home/haitech-home-category-navigation';
import { HaitechHomeMainHeader } from '@/components/haitech-home/haitech-home-main-header';
import { HaitechHomeTopBar } from '@/components/haitech-home/haitech-home-top-bar';
import { cn } from '@/lib/utils';

/** Header storefront unificado (home + páginas internas). */
export function HaitechStorefrontHeader({ className }: { className?: string }) {
  return (
    <div className={cn('sticky top-0 z-50 w-full bg-white', className)}>
      <HaitechHomeTopBar />
      <HaitechHomeMainHeader />
      <HaitechHomeCategoryNavigation />
    </div>
  );
}
