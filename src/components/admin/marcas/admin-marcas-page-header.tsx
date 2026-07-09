import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, CircleHelp, LayoutPanelLeft, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminMarcasPageHeaderProps {
  className?: string;
  onNewBrand?: () => void;
  brandNames?: string[];
}

export function AdminMarcasPageHeader({
  className,
  onNewBrand,
  brandNames = [],
}: AdminMarcasPageHeaderProps) {
  const navigate = useNavigate();
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [commandOpen, setCommandOpen] = useState(false);
  const { data: products = [] } = useAdminProductsQuery();

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
            Marcas
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Gestiona las marcas y fabricantes de productos en tu catálogo.
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center xl:max-w-2xl xl:justify-end">
          <button
            type="button"
            className="min-w-0 flex-1 sm:max-w-sm"
            onClick={() => setCommandOpen(true)}
            aria-label="Buscar marcas"
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
              className="hidden h-8 gap-1.5 bg-card text-xs lg:inline-flex"
              onClick={toggleSidebar}
            >
              <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
              {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative size-8 bg-card"
              aria-label="Notificaciones, 2 sin leer"
            >
              <Bell className="size-3.5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--admin-accent))] text-[0.5625rem] font-bold text-white ring-2 ring-background">
                2
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-8 gap-1 bg-[hsl(var(--admin-accent))] px-3 text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Nueva marca
                  <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    onNewBrand?.();
                  }}
                >
                  Crear marca manualmente
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Importar desde Excel</DropdownMenuItem>
                <DropdownMenuItem disabled>Sincronizar desde proveedor</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Buscar marcas, países o gestores…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Marcas">
            {brandNames.slice(0, 10).map((brandName) => (
              <CommandItem
                key={brandName}
                value={brandName}
                onSelect={() => goTo(`${ADMIN_ROUTES.CATEGORIES}?vista=marcas`)}
              >
                {brandName}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Productos">
            {products.slice(0, 6).map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.sku ?? ''}`}
                onSelect={() => goTo(ADMIN_ROUTES.INVENTORY)}
              >
                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
