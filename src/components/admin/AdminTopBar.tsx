import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { AdminExchangeRateControl } from '@/components/admin/admin-exchange-rate-control';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/auth-context';
import { useAdminProductsQuery, useAdminProfiles } from '@/hooks/use-admin-dashboard';
import { ADMIN_ROUTES, isAdminCatalogPath, isAdminSettingsPath } from '@/lib/admin-routes';

function resolveAdminTopBarTitle(pathname: string, search: string): string {
  if (isAdminCatalogPath(pathname)) return 'Inventario';
  if (isAdminSettingsPath(pathname)) return 'Configuración';
  if (pathname.startsWith(ADMIN_ROUTES.CUSTOMERS)) return 'Clientes';
  if (pathname.startsWith(ADMIN_ROUTES.VENTAS) || pathname.startsWith('/admin/pedidos')) {
    return search.includes('vista=tpv') || search.includes('nuevo=1') ? 'Nueva venta' : 'Ventas';
  }
  if (pathname.startsWith(ADMIN_ROUTES.SHIPPING)) return 'Envíos';
  if (pathname.startsWith(ADMIN_ROUTES.MARKETING)) return 'Marketing';
  if (pathname === ADMIN_ROUTES.DASHBOARD) return 'Panel administrativo';
  return 'Panel administrativo';
}

export function AdminTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = resolveAdminTopBarTitle(location.pathname, location.search);
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: products = [] } = useAdminProductsQuery();
  const { data: profiles = [] } = useAdminProfiles();

  const initials = useMemo(() => {
    const source = user?.name ?? user?.email ?? 'A';
    return source.slice(0, 2).toUpperCase();
  }, [user?.email, user?.name]);

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
      <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
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

        <div className="min-w-0 flex-1">
          <h1
            className={
              location.pathname === ADMIN_ROUTES.DASHBOARD
                ? 'truncate text-xl font-bold tracking-tight text-foreground'
                : 'truncate text-lg font-semibold text-foreground'
            }
          >
            {title}
          </h1>
          {location.pathname === ADMIN_ROUTES.DASHBOARD && (
            <p className="truncate text-sm text-muted-foreground">
              Bienvenido al centro de control de Haitech
            </p>
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

        <AdminExchangeRateControl />

        <Button type="button" variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="size-5" />
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-bold text-white">
            0
          </span>
        </Button>

        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="size-9">
            <AvatarFallback className="bg-[hsl(var(--admin-accent))]/10 text-xs font-semibold text-[hsl(var(--admin-accent))]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium text-foreground">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
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
                onSelect={() => goTo(ADMIN_ROUTES.CUSTOMERS)}
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
