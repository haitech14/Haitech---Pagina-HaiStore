import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, Sun } from 'lucide-react';

import { AdminCrmSubNav } from '@/components/admin/admin-crm-subnav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBarUserMenu } from '@/components/admin/admin-topbar-user-menu';
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
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAdminProductsQuery, useAdminProfiles } from '@/hooks/use-admin-dashboard';
import {
  ADMIN_ROUTES,
  isAdminCatalogPath,
  isAdminCrmPath,
  isAdminSettingsPath,
} from '@/lib/admin-routes';

function resolveAdminTopBarTitle(pathname: string, search: string): string {
  if (isAdminCatalogPath(pathname)) return 'Catálogo';
  if (isAdminCrmPath(pathname) || pathname.startsWith(ADMIN_ROUTES.CUSTOMERS)) return 'CRM';
  if (isAdminSettingsPath(pathname)) return 'Configuración';
  if (pathname.startsWith(ADMIN_ROUTES.PEDIDOS)) return 'Pedidos';
  if (pathname.startsWith(ADMIN_ROUTES.VENTAS)) {
    if (search.includes('vista=tpv') || search.includes('nuevo=1')) return 'Nueva venta';
    if (search.includes('vista=cotizaciones')) return 'Cotizaciones';
    if (search.includes('vista=devoluciones')) return 'Devoluciones';
    if (search.includes('vista=listado') || search.includes('vista=historico')) return 'Histórico de ventas';
    return 'Pedidos';
  }
  if (pathname.startsWith(ADMIN_ROUTES.SHIPPING)) return 'Envíos';
  if (pathname.startsWith(ADMIN_ROUTES.SERVICES)) return 'Servicios';
  if (pathname.startsWith(ADMIN_ROUTES.RENTALS)) return 'Alquileres y planes';
  if (pathname.startsWith(ADMIN_ROUTES.MARKETING)) {
    if (pathname.startsWith(ADMIN_ROUTES.MARKETING_COUPONS)) return 'Cupones';
    return 'Marketing';
  }
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
      <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-[hsl(var(--admin-topbar-border))] bg-[hsl(var(--admin-topbar-bg))] px-4 sm:px-5">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
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

        {!isDashboard && !showCrmTabs ? (
          <h1 className="hidden shrink-0 text-base font-semibold text-foreground sm:block">{title}</h1>
        ) : null}

        {showCrmTabs ? (
          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <h1 className="shrink-0 text-base font-semibold text-foreground">CRM</h1>
            <AdminCrmSubNav variant="inline" />
          </div>
        ) : null}

        <button
          type="button"
          className="min-w-0 flex-1 sm:max-w-md lg:max-w-xl"
          onClick={() => setCommandOpen(true)}
          aria-label="Abrir búsqueda global"
        >
          <div className="relative pointer-events-none">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              readOnly
              placeholder="Buscar en el sistema…"
              className="h-9 rounded-lg border-border/80 bg-muted/40 pl-9 text-sm shadow-none"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
            aria-label="Cambiar tema"
          >
            <Sun className="size-[1.125rem]" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-9 text-muted-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="size-[1.125rem]" aria-hidden="true" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>
          <AdminTopBarUserMenu />
        </div>
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
