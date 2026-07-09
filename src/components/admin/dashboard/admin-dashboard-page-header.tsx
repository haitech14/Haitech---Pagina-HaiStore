import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CircleHelp, LayoutPanelLeft, Plus, Search } from 'lucide-react';

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
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAdminProductsQuery, useAdminProfiles } from '@/hooks/use-admin-dashboard';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminDashboardPageHeaderProps {
  className?: string;
}

export function AdminDashboardPageHeader({ className }: AdminDashboardPageHeaderProps) {
  const navigate = useNavigate();
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [commandOpen, setCommandOpen] = useState(false);
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
      <header
        className={cn(
          'flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between',
          className,
        )}
      >
        <div className="min-w-0 shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Resumen general de la operación ecommerce
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center xl:max-w-2xl xl:justify-end">
          <button
            type="button"
            className="min-w-0 flex-1 sm:max-w-sm"
            onClick={() => setCommandOpen(true)}
            aria-label="Buscar en el sistema"
          >
            <div className="relative pointer-events-none">
              <Search
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                readOnly
                placeholder="Buscar en el sistema…"
                className="h-8 rounded-md border-border/80 bg-card pl-8 pr-14 text-xs shadow-sm"
                aria-hidden="true"
                tabIndex={-1}
              />
              <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1 py-0.5 text-[0.5625rem] font-medium text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-8 bg-card lg:inline-flex"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}
            >
              <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative size-8 bg-card"
              aria-label="Notificaciones, 3 sin leer"
            >
              <Bell className="size-3.5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--admin-accent))] text-[0.5625rem] font-bold text-white ring-2 ring-background">
                3
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 bg-card"
              aria-label="Ayuda"
            >
              <CircleHelp className="size-3.5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] px-3 text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
              onClick={() => goTo(ADMIN_ROUTES.INVENTORY)}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nuevo
            </Button>
          </div>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Buscar productos, clientes, pedidos…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Productos">
            {products.slice(0, 8).map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.sku ?? ''}`}
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
                value={`${profile.full_name ?? ''} ${profile.email ?? ''}`}
                onSelect={() => goTo(ADMIN_ROUTES.CRM_CLIENTES)}
              >
                {profile.full_name ?? profile.email}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
