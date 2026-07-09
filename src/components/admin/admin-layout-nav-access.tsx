import { useState } from 'react';
import { ChevronRight, Menu } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

export function AdminLayoutNavAccess() {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'fixed left-3 top-3 z-40 size-9 border-border/80 bg-card shadow-sm lg:hidden',
            )}
            aria-label="Abrir menú del panel"
          >
            <Menu className="size-4" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100vw-2rem,16rem)] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú administrativo</SheetTitle>
          </SheetHeader>
          <AdminSidebar mobile onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {!sidebarOpen ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="fixed left-3 top-3 z-40 hidden size-9 border-border/80 bg-card shadow-sm lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Mostrar barra lateral"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
    </>
  );
}
