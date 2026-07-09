import { ChevronDown, LayoutPanelLeft, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminUtilityPanel } from '@/context/admin-utility-panel-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminInventarioPageHeaderProps {
  className?: string;
  onNewProduct?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function AdminInventarioPageHeader({
  className,
  onNewProduct,
  onSync,
  isSyncing = false,
}: AdminInventarioPageHeaderProps) {
  const { open: utilityPanelOpen, toggle: toggleUtilityPanel } = useAdminUtilityPanel();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
          Productos
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Catálogo sincronizado con la tienda web
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 bg-card text-xs"
          onClick={toggleUtilityPanel}
        >
          <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
          {utilityPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 bg-card text-xs"
          onClick={onSync}
          disabled={isSyncing}
        >
          <RefreshCw className={cn('size-3.5', isSyncing && 'animate-spin')} aria-hidden="true" />
          {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-3.5" aria-hidden="true" />
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
            <DropdownMenuItem
              onSelect={() => {
                navigate(ADMIN_ROUTES.VARIANTS);
              }}
            >
              Producto con variantes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
