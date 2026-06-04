import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AdminDashboardToolbarActions } from '@/components/admin/admin-dashboard-toolbar-actions';
import { AdminCrmSubNav } from '@/components/admin/admin-crm-subnav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAdminProductsQuery, useAdminProfiles } from '@/hooks/use-admin-dashboard';
import {
  ADMIN_ROUTES,
  isAdminCatalogPath,
  isAdminCrmPath,
  isAdminSettingsPath,
} from '@/lib/admin-routes';

function resolveAdminTopBarTitle(pathname: string, search: string): string {
  if (isAdminCatalogPath(pathname)) return 'Inventario';
  if (isAdminCrmPath(pathname) || pathname.startsWith(ADMIN_ROUTES.CUSTOMERS)) {
    return 'CRM';
  }
  if (isAdminSettingsPath(pathname)) return 'Configuración';
  if (pathname.startsWith(ADMIN_ROUTES.VENTAS) || pathname.startsWith('/admin/pedidos')) {
    return search.includes('vista=tpv') || search.includes('nuevo=1') ? 'Nueva venta' : 'Ventas';
  }
  if (pathname.startsWith(ADMIN_ROUTES.SHIPPING)) return 'Envíos';
  if (pathname.startsWith(ADMIN_ROUTES.SERVICES)) return 'Servicios';
  if (pathname.startsWith(ADMIN_ROUTES.RENTALS)) return 'Alquileres y planes';
  if (pathname.startsWith(ADMIN_ROUTES.MARKETING)) return 'Marketing';
  if (pathname === ADMIN_ROUTES.DASHBOARD) return 'Dashboard';
  return 'Panel administrativo';
}

export function AdminTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = resolveAdminTopBarTitle(location.pathname, location.search);
  const showCrmTabs =
    isAdminCrmPath(location.pathname) || location.pathname.startsWith(ADMIN_ROUTES.CUSTOMERS);
  const isDashboard = location.pathname === ADMIN_ROUTES.DASHBOARD;
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: products = [] } = useAdminProductsQuery();
  const { data: profiles = [] } = useAdminProfiles();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const goTo = useCallback(
    (path: string) => {
      setCommandOpen(false);
      navigate(path);
    },
    [navigate],
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-12 items-center gap-2 border-b border-[hsl(var(--admin-topbar-border))] bg-[hsl(var(--admin-topbar-bg))] px-4 sm:min-h-14 sm:gap-3 sm:px-6">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menú del panel"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,16rem)] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú administrativo</SheetTitle>
            </SheetHeader>
            <AdminSidebar mobile onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden shrink-0 lg:inline-flex"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
          aria-expanded={sidebarOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        {isDashboard ? (
          <>
            <h1 className="shrink-0 text-lg font-bold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex min-w-0 flex-1 flex-row flex-nowrap items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                className="min-w-0 flex-1 sm:max-w-xl"
                onClick={() => setCommandOpen(true)}
                aria-label="Abrir búsqueda global"
              >
                <div className="relative pointer-events-none">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    readOnly
                    placeholder="Buscar pedidos, productos, clientes…"
                    className="h-8 pl-9 text-sm"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[0.65rem] font-medium text-muted-foreground sm:inline">
                    Ctrl+K
                  </kbd>
                </div>
              </button>
              <AdminDashboardToolbarActions className="shrink-0" />
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              {showCrmTabs ? (
                <>
                  <h1 className="shrink-0 text-lg font-bold tracking-tight text-foreground">CRM</h1>
                  <AdminCrmSubNav variant="inline" />
                </>
              ) : (
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
                </div>
              )}
            </div>

            <div className="hidden max-w-md flex-1 md:block">
              <button
                type="button"
                className="w-full"
                onClick={() => setCommandOpen(true)}
                aria-label="Abrir búsqueda global"
              >
                <div className="relative pointer-events-none">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    readOnly
                    placeholder="Buscar pedidos, productos, clientes…"
                    className="pl-9"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[0.65rem] font-medium text-muted-foreground sm:inline">
                    Ctrl+K
                  </kbd>
                </div>
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative md:hidden"
              aria-label="Buscar"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="size-5" />
            </Button>
          </>
        )}
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Buscar productos o clientes…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Productos">
            {products.slice(0, 8).map((product) => (
              <CommandItem
                key={product.id}
                value={`producto ${product.name}`}
                onSelect={() => goTo(ADMIN_ROUTES.INVENTORY)}
              >
                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Clientes">
            {profiles.slice(0, 8).map((profile) => (
              <CommandItem
                key={profile.id}
                value={`cliente ${profile.email ?? profile.full_name ?? profile.id}`}
                onSelect={() => goTo(ADMIN_ROUTES.CRM_CLIENTES)}
              >
                {profile.full_name ?? profile.email ?? profile.id}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
