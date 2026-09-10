import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';

import { HeaderNavChevron } from '@/components/layout/header-nav-chevron';
import { SolutionsMegaMenuPanel } from '@/components/layout/solutions-mega-menu-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  computeMegaMenuDropdownLayout,
  DARK_NAV_ICON_CLASS,
  MAIN_NAV_ICON_CLASS,
  MEGA_MENU_DROPDOWN_CLASS,
  type MegaMenuDropdownLayout,
  megaMenuDropdownStyle,
  haitechBlackSubmenuTriggerClass,
  haitechWhiteSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  mainNavLinkClass,
  darkNavSecondarySubmenuTriggerClass,
  darkNavSubmenuTriggerClass,
  type MainNavRowVariant,
} from '@/components/layout/main-nav-styles';
import {
  solutionsMegaMenuSectionMeta,
  solutionsMegaMenuSidebarIds,
  type SolutionsMegaMenuSectionId,
} from '@/data/solutions-mega-menu';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

function triggerClassForRow(
  navRow: MainNavRowVariant,
  isRouteActive: boolean,
  open: boolean,
): string {
  switch (navRow) {
    case 'haitech-white':
      return haitechWhiteSubmenuTriggerClass(isRouteActive, open);
    case 'haitech-black':
      return haitechBlackSubmenuTriggerClass(isRouteActive, open);
    case 'light':
      return lightNavSubmenuTriggerClass(isRouteActive, open);
    case 'light-compact':
      return lightNavSubmenuTriggerCompactClass(isRouteActive, open);
    case 'secondary':
      return darkNavSecondarySubmenuTriggerClass(isRouteActive, open);
    case 'default':
      return darkNavSubmenuTriggerClass(isRouteActive, open);
    default: {
      const _exhaustive: never = navRow;
      return _exhaustive;
    }
  }
}

export function SolutionsMegaMenu({
  navRow = 'default',
  showIcon = true,
  showChevron = true,
  label = 'Soluciones',
  triggerHref,
}: {
  navRow?: MainNavRowVariant;
  showIcon?: boolean;
  showChevron?: boolean;
  label?: string;
  triggerHref?: string;
} = {}) {
  const location = useLocation();
  const defaultSection = solutionsMegaMenuSidebarIds[0] ?? 'colaboracion';

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SolutionsMegaMenuSectionId>(defaultSection);
  const [menuLayout, setMenuLayout] = useState<MegaMenuDropdownLayout | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const isRouteActive =
    location.pathname.includes('soluciones') || location.pathname.startsWith('/software');

  const updateMenuLayout = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setMenuLayout(computeMegaMenuDropdownLayout(trigger));
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    updateMenuLayout();
    setOpen(true);
  }, [clearCloseTimer, updateMenuLayout]);

  useEffect(() => {
    if (!open) return;
    updateMenuLayout();
    window.addEventListener('resize', updateMenuLayout);
    return () => window.removeEventListener('resize', updateMenuLayout);
  }, [open, updateMenuLayout]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const closeMenu = () => setOpen(false);

  const useWhiteHaitechTrigger = navRow === 'haitech-white' || navRow === 'haitech-black';
  const triggerClass = useWhiteHaitechTrigger
    ? triggerClassForRow(navRow, isRouteActive, open)
    : cn(mainNavLinkClass(open || isRouteActive), 'gap-1');

  const iconClass =
    navRow === 'haitech-black' || navRow === 'default' || navRow === 'secondary'
      ? DARK_NAV_ICON_CLASS
      : MAIN_NAV_ICON_CLASS;

  const triggerContent = (
    <>
      {showIcon ? <Lightbulb className={iconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
      {label}
      {showChevron ? <HeaderNavChevron open={open} navRow={navRow} /> : null}
    </>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {triggerHref ? (
          <Link
            ref={(node) => {
              triggerRef.current = node;
            }}
            to={triggerHref}
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={triggerClass}
          >
            {triggerContent}
          </Link>
        ) : (
          <button
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={triggerClass}
          >
            {triggerContent}
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={MEGA_MENU_DROPDOWN_CLASS}
        style={menuLayout ? megaMenuDropdownStyle(menuLayout) : undefined}
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
