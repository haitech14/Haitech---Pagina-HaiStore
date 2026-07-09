import { Bell, CircleHelp, CloudUpload, LayoutPanelLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { cn } from '@/lib/utils';

interface AdminMediosPageHeaderProps {
  className?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onUpload?: () => void;
  onNewFolder?: () => void;
}

export function AdminMediosPageHeader({
  className,
  search,
  onSearchChange,
  onUpload,
  onNewFolder,
}: AdminMediosPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();

  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">Medios</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Biblioteca central de imágenes, videos y archivos para tu catálogo.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar archivos…"
          className="h-8 w-[13.5rem] bg-card text-xs lg:w-[15rem]"
          aria-label="Buscar medios"
        />

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 bg-card text-xs"
          onClick={toggleSidebar}
        >
          <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
          {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
        </Button>

        <Button type="button" variant="outline" size="icon" className="size-8 bg-card" aria-label="Notificaciones">
          <Bell className="size-3.5" aria-hidden="true" />
        </Button>

        <Button type="button" variant="outline" size="icon" className="size-8 bg-card" aria-label="Ayuda">
          <CircleHelp className="size-3.5" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1 bg-card text-xs"
          onClick={onUpload}
        >
          <CloudUpload className="size-3.5" aria-hidden="true" />
          Subir archivo
        </Button>

        <Button
          type="button"
          className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
          onClick={onNewFolder}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Nueva carpeta
        </Button>
      </div>
    </header>
  );
}
