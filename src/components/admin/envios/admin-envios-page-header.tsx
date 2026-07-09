import { Bell, ChevronDown, CircleHelp, LayoutPanelLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminEnviosPageHeaderProps {
  className?: string;
  incidentCount?: number;
  onNewShipment: () => void;
}

export function AdminEnviosPageHeader({
  className,
  incidentCount = 0,
  onNewShipment,
}: AdminEnviosPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();

  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
          Envíos
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Gestiona el despacho, tracking y entregas de tus pedidos.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 bg-card text-xs"
          onClick={toggleSidebar}
        >
          <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
          {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
        </Button>

        {incidentCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative size-8 bg-card"
            aria-label={`${incidentCount} envíos con incidencias`}
          >
            <Bell className="size-3.5" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex size-[1.125rem] items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white ring-2 ring-background">
              {incidentCount > 99 ? '99+' : incidentCount}
            </span>
          </Button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 bg-card"
          aria-label="Ayuda de envíos"
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
              Nuevo envío
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onNewShipment}>Registrar envío</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`${ADMIN_ROUTES.SHIPPING}?vista=config`}>Zonas y tarifas</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
