import { Bell, ChevronDown, FileUp, LayoutPanelLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

interface AdminClientesPageHeaderProps {
  className?: string;
  onCreateCustomer?: () => void;
  onImportExcel?: () => void;
  isImporting?: boolean;
  newCustomersCount?: number;
}

export function AdminClientesPageHeader({
  className,
  onCreateCustomer,
  onImportExcel,
  isImporting = false,
  newCustomersCount = 0,
}: AdminClientesPageHeaderProps) {
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
          Clientes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de clientes Persona, cuentas de acceso e importación.
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

        {newCustomersCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative size-9 bg-card"
            aria-label={`${newCustomersCount} clientes nuevos en el periodo`}
          >
            <Bell className="size-4" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex size-[1.125rem] items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white ring-2 ring-background">
              {newCustomersCount > 99 ? '99+' : newCustomersCount}
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
              Nuevo cliente
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onCreateCustomer}>Crear cliente manual</DropdownMenuItem>
            <DropdownMenuItem disabled={isImporting} onClick={onImportExcel}>
              <FileUp className="size-4" aria-hidden="true" />
              {isImporting ? 'Importando Excel…' : 'Importar Excel Persona'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
