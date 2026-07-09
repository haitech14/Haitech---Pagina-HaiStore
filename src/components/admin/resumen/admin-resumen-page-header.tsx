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

const VISTA_META = {
  general: {
    title: 'Resumen',
    description: 'Cotizaciones solicitadas, visitantes de la tienda e indicadores de la operación.',
  },
  cotizaciones: {
    title: 'Cotizaciones',
    description: 'Clientes que pidieron cotización y seguimiento por WhatsApp.',
  },
  visitantes: {
    title: 'Visitantes',
    description: 'IP, ciudad, identidad, cuenta creada y productos revisados en la tienda.',
  },
  reportes: {
    title: 'Reportes',
    description: 'Indicadores y reportes consolidados de la operación.',
  },
  estadisticas: {
    title: 'Estadísticas',
    description: 'Tendencias y distribución de la actividad del sistema.',
  },
  reseñas: {
    title: 'Reseñas',
    description: 'Valoraciones y comentarios de clientes.',
  },
} as const;

interface AdminResumenPageHeaderProps {
  className?: string;
  vista?: keyof typeof VISTA_META;
}

export function AdminResumenPageHeader({
  className,
  vista = 'general',
}: AdminResumenPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const meta = VISTA_META[vista] ?? VISTA_META.general;

  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
          {meta.title}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-8 bg-card"
          aria-label="Notificaciones, 6 sin leer"
        >
          <Bell className="size-3.5" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 flex size-[1.125rem] items-center justify-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white ring-2 ring-background">
            6
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" className="h-8 gap-1 bg-[hsl(var(--admin-accent))] text-xs hover:bg-[hsl(var(--admin-accent-hover))]">
              <Plus className="size-3.5" aria-hidden="true" />
              Nuevo registro
              <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Solicitud de soporte</DropdownMenuItem>
            <DropdownMenuItem>Orden de venta</DropdownMenuItem>
            <DropdownMenuItem>Ticket de inventario</DropdownMenuItem>
            <DropdownMenuItem>Registro de cliente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
