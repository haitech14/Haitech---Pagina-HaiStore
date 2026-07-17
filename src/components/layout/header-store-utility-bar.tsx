import { HeaderMainMenu } from '@/components/layout/header-main-menu';
import { mainNavLinkClass } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

export function HeaderStoreUtilityBar({ className }: { className?: string }) {
  return (
    <div className={cn('hidden border-b border-border/50 bg-white lg:block', className)}>
      <nav
        aria-label="Menú principal"
        className="container flex min-h-9 items-center justify-center py-1"
      >
        <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <HeaderMainMenu
            linkClassName={mainNavLinkClass}
            menuVariant="light"
            showIcons={false}
            className="justify-center"
          />
        </div>
      </nav>
    </div>
  );
}
