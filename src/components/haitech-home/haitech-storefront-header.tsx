import { HaitechHomeMainHeader } from '@/components/haitech-home/haitech-home-main-header';
import { HaitechHomeSecondaryCategoryNav } from '@/components/haitech-home/haitech-home-secondary-category-nav';
import { HaitechHomeTopBar } from '@/components/haitech-home/haitech-home-top-bar';
import { cn } from '@/lib/utils';

/** Header storefront unificado (home + páginas internas). */
export function HaitechStorefrontHeader({ className }: { className?: string }) {
  return (
    <>
      <div className={cn('w-full overflow-visible bg-white', className)}>
        <HaitechHomeTopBar />
        <HaitechHomeMainHeader />
      </div>
      <HaitechHomeSecondaryCategoryNav />
    </>
  );
}