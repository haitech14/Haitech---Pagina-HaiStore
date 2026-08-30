import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { HaitechMobileMenuSheetContacts } from '@/components/haitech-home/haitech-mobile-menu-sheet-contacts';
import { HaitechMobileMenuSheetNav } from '@/components/haitech-home/haitech-mobile-menu-sheet-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { HAITECH_OPEN_CATEGORIES_EVENT } from '@/lib/haitech-mobile-nav-events';

/** Sheet móvil global: contactos + navegación principal (Tienda, Equipos, etc.). */
export function HaitechMobileMenuSheet() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onOpenMenu = () => setOpen(true);
    window.addEventListener(HAITECH_OPEN_CATEGORIES_EVENT, onOpenMenu);
    return () => window.removeEventListener(HAITECH_OPEN_CATEGORIES_EVENT, onOpenMenu);
  }, []);

  const handleNavigate = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="haitech-mobile-menu-sheet"
        side="bottom"
        className="flex max-h-[85dvh] flex-col gap-0 p-0 lg:hidden"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-border px-4 py-3 text-left">
          <SheetTitle className="text-base">Menú</SheetTitle>
        </SheetHeader>
        <HaitechMobileMenuSheetContacts onNavigate={handleNavigate} />
        <div className="border-b border-[#E8E8E8] px-4 py-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#888]">Navegación</p>
        </div>
        <HaitechMobileMenuSheetNav onNavigate={handleNavigate} />
      </SheetContent>
    </Sheet>
  );
}
