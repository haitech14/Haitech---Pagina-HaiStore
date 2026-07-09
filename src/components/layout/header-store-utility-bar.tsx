import { HeaderMainMenu } from '@/components/layout/header-main-menu';
import { mainNavLinkClass } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

export function HeaderStoreUtilityBar({ className }: { className?: string }) {
  return (
    <div className={cn('hidden border-b border-border/60 bg-white lg:block', className)}>
      <nav
        aria-label="Menú principal"
        className="container flex min-h-11 items-center justify-center py-2.5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
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
