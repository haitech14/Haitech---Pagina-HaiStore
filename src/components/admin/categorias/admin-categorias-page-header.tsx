import { Bell, CircleHelp, LayoutPanelLeft, Plus, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

interface AdminCategoriasPageHeaderProps {
  className?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onNewCategory?: () => void;
  onSyncCatalog?: () => void;
  isSyncingCatalog?: boolean;
}

export function AdminCategoriasPageHeader({
  className,
  search,
  onSearchChange,
  onNewCategory,
  onSyncCatalog,
  isSyncingCatalog = false,
}: AdminCategoriasPageHeaderProps) {
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
          Categorías
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Árbol taxonómico del catálogo: ordena, anida y edita categorías.
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
            placeholder="Buscar categorías…"
            className="h-8 w-[13.5rem] bg-card pl-8 pr-14 text-xs lg:w-[15rem]"
            aria-label="Buscar categorías"
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

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 bg-card text-xs"
          disabled={isSyncingCatalog}
          onClick={onSyncCatalog}
        >
          <RefreshCw
            className={cn('size-3.5', isSyncingCatalog && 'animate-spin')}
            aria-hidden="true"
          />
          {isSyncingCatalog ? 'Sincronizando…' : 'Sincronizar catálogo'}
        </Button>

        <Button
          type="button"
          className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
          onClick={onNewCategory}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>
    </header>
  );
}
