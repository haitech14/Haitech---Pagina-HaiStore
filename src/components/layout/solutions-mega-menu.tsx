import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { SolutionsMegaMenuPanel } from '@/components/layout/solutions-mega-menu-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  solutionsMegaMenuSectionMeta,
  solutionsMegaMenuSidebarIds,
  type SolutionsMegaMenuSectionId,
} from '@/data/solutions-mega-menu';
import { mainNavLinkClass } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

export function SolutionsMegaMenu() {
  const defaultSection = solutionsMegaMenuSidebarIds[0] ?? 'colaboracion';

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SolutionsMegaMenuSectionId>(defaultSection);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateMenuWidth = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const container = trigger.closest('.container');
    const containerRect = container?.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const left = containerRect?.left ?? triggerRect.left;
    const rightMargin = containerRect
      ? Math.max(12, window.innerWidth - containerRect.right)
      : 12;
    setMenuWidth(Math.max(880, window.innerWidth - left - rightMargin));
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    updateMenuWidth();
    setOpen(true);
  }, [clearCloseTimer, updateMenuWidth]);

  useEffect(() => {
    if (!open) return;
    updateMenuWidth();
    window.addEventListener('resize', updateMenuWidth);
    return () => window.removeEventListener('resize', updateMenuWidth);
  }, [open, updateMenuWidth]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const closeMenu = () => setOpen(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          className={cn(mainNavLinkClass(open), 'gap-1')}
        >
          Soluciones
          <ChevronDown
            aria-hidden="true"
            className={cn('size-3 transition-transform', open && 'rotate-180')}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          'z-50 max-w-none overflow-hidden rounded-lg border border-border/70 p-0 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}
        style={menuWidth ? { width: menuWidth, maxHeight: 'min(40rem, 82vh)' } : undefined}
      >
        <SolutionsMegaMenuPanel
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onNavigate={closeMenu}
        />
        <span className="sr-only">{solutionsMegaMenuSectionMeta[activeSection].label}</span>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
