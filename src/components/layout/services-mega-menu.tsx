import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { megaMenuServiceLinks } from '@/data/mega-menu';
import { MAIN_NAV_ICON_CLASS, mainNavLinkClass } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

export function ServicesMegaMenu() {
  const location = useLocation();
  const isServicesRoute = location.pathname.startsWith('/servicios');

  const [open, setOpen] = useState(false);
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
    setMenuWidth(Math.max(520, Math.min(720, window.innerWidth - left - rightMargin)));
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
          className={cn(mainNavLinkClass(open || isServicesRoute), 'gap-1')}
        >
          <Settings className={MAIN_NAV_ICON_CLASS} strokeWidth={1.75} aria-hidden="true" />
          Alquiler
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
          'z-50 max-w-none overflow-hidden rounded-lg border border-border/70 p-4 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}
        style={menuWidth ? { width: menuWidth } : undefined}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {megaMenuServiceLinks.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                to={service.href}
                onClick={closeMenu}
                className="group flex gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-red-200 hover:bg-red-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/50 text-red-600 transition-colors group-hover:bg-red-100">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{service.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {service.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
