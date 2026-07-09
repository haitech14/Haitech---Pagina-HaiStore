import { Bell, ChevronDown, CircleHelp, LayoutPanelLeft, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

interface AdminServiciosPageHeaderProps {
  className?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onNewService?: () => void;
  onNewPresencial?: () => void;
  onNewRemoto?: () => void;
  onNewPlan?: () => void;
}

export function AdminServiciosPageHeader({
  className,
  search,
  onSearchChange,
  onNewService,
  onNewPresencial,
  onNewRemoto,
  onNewPlan,
}: AdminServiciosPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();

  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
          Servicios
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Administra tu catálogo de servicios, planes, cobertura y disponibilidad.
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
            aria-label="Buscar servicios"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nuevo servicio
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => (onNewPresencial ?? onNewService)?.()}>
              Servicio presencial
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => (onNewRemoto ?? onNewService)?.()}>
              Servicio remoto
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => (onNewPlan ?? onNewService)?.()}>
              Plan mensual
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
