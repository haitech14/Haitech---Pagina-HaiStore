import { Bell, ChevronDown, LayoutPanelLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

interface AdminInventarioPageHeaderProps {
  className?: string;
  onNewProduct?: () => void;
}

export function AdminInventarioPageHeader({
  className,
  onNewProduct,
}: AdminInventarioPageHeaderProps) {
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
          Inventario
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control de stock, movimientos y productos
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-9 bg-card"
          aria-label="Notificaciones, 4 sin leer"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 flex size-[1.125rem] items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white ring-2 ring-background">
            4
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-9 gap-1.5 bg-[hsl(var(--admin-accent))] text-sm hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo producto
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                onNewProduct?.();
              }}
            >
              Producto individual
            </DropdownMenuItem>
            <DropdownMenuItem>Importar desde Excel</DropdownMenuItem>
            <DropdownMenuItem>Producto con variantes</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
