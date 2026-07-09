import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutPanelLeft,
  Plus,
  Search,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';
import type { AdminVariantesView } from '@/types/admin-variantes';

interface AdminVariantesPageHeaderProps {
  className?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onNewVariant?: () => void;
  onNewOption?: () => void;
}

function resolveView(searchParams: URLSearchParams): AdminVariantesView {
  return searchParams.get('vista') === 'opciones' ? 'opciones' : 'variantes';
}

export function AdminVariantesPageHeader({
  className,
  search,
  onSearchChange,
  onNewVariant,
  onNewOption,
}: AdminVariantesPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [searchParams] = useSearchParams();
  const view = resolveView(searchParams);

  return (
    <header className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
            Variantes
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Gestiona las combinaciones de productos, stock, precios y opciones de compra de tu
            catálogo.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <div className="relative hidden md:block">
            <Search
              className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar en el sistema…"
              className="h-8 w-[13.5rem] bg-card pl-8 pr-14 text-xs lg:w-[15rem]"
              aria-label="Buscar variantes u opciones"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground lg:inline">
              Ctrl+K
            </kbd>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1.5 bg-card text-xs"
            onClick={toggleSidebar}
          >
            <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
            {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 bg-card"
            aria-label="Notificaciones"
          >
            <Bell className="size-3.5" aria-hidden="true" />
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

          {view === 'variantes' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Nueva variante
                  <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onNewVariant?.()}>
                  Variante manual
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onNewVariant?.()}>
                  Generar desde atributos
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onNewVariant?.()}>
                  Importar desde Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
              onClick={() => onNewOption?.()}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nueva opción
            </Button>
          )}
        </div>
      </div>

      <nav aria-label="Secciones de variantes" className="flex flex-wrap gap-1">
        <Link
          to={ADMIN_ROUTES.VARIANTS}
          className={cn(
            'inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors',
            view === 'variantes'
              ? 'bg-[hsl(var(--admin-accent))] text-white'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
          aria-current={view === 'variantes' ? 'page' : undefined}
        >
          Variantes
        </Link>
        <Link
          to={`${ADMIN_ROUTES.VARIANTS}?vista=opciones`}
          className={cn(
            'inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors',
            view === 'opciones'
              ? 'bg-[hsl(var(--admin-accent))] text-white'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
          aria-current={view === 'opciones' ? 'page' : undefined}
        >
          Opciones de producto
        </Link>
      </nav>
    </header>
  );
}
