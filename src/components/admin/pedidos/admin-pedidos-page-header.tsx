import { Bell, ChevronDown, LayoutPanelLeft, Plus } from 'lucide-react';
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

interface AdminPedidosPageHeaderProps {
  className?: string;
  pendingCount?: number;
}

export function AdminPedidosPageHeader({ className, pendingCount = 0 }: AdminPedidosPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();

  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          Pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de pedidos de la tienda online y punto de venta.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 bg-card text-sm"
          onClick={toggleSidebar}
        >
          <LayoutPanelLeft className="size-4" aria-hidden="true" />
          {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
        </Button>

        {pendingCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative size-9 bg-card"
            aria-label={`${pendingCount} pedidos pendientes de pago`}
          >
            <Bell className="size-4" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex size-[1.125rem] items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white ring-2 ring-background">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-9 gap-1.5 bg-[hsl(var(--admin-accent))] text-sm hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo pedido
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ADMIN_ROUTES.TPV}>Cotización / venta (TPV)</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`${ADMIN_ROUTES.VENTAS}?vista=cotizaciones`}>Cotizaciones</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`${ADMIN_ROUTES.VENTAS}?vista=listado`}>Histórico unificado / HaiSales</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
