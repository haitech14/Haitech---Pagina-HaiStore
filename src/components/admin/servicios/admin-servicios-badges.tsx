import {
  Briefcase,
  Headphones,
  Package,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AdminServicioCategoria, AdminServicioEstado } from '@/types/admin-servicios';
import {
  SERVICIO_CATEGORIA_LABELS,
  SERVICIO_CATEGORIA_STYLES,
  SERVICIO_ESTADO_LABELS,
  SERVICIO_ESTADO_STYLES,
} from '@/lib/admin-servicios-utils';

const categoriaIcons: Record<AdminServicioCategoria, LucideIcon> = {
  mantenimiento: Wrench,
  instalacion: Package,
  soporte: Headphones,
  consultoria: Briefcase,
  otros: Wrench,
};

export function AdminServiciosCategoriaBadge({
  categoria,
}: {
  categoria: AdminServicioCategoria;
}) {
  const Icon = categoriaIcons[categoria];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        SERVICIO_CATEGORIA_STYLES[categoria],
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {SERVICIO_CATEGORIA_LABELS[categoria]}
    </span>
  );
}

export function AdminServiciosEstadoBadge({ estado }: { estado: AdminServicioEstado }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        SERVICIO_ESTADO_STYLES[estado],
      )}
    >
      {SERVICIO_ESTADO_LABELS[estado]}
    </span>
  );
}

export function AdminServiciosResponsableCell({
  name,
  title,
  initials,
  avatarColor,
}: {
  name: string;
  title: string;
  initials: string;
  avatarColor: string;
}) {
  return (
    <div className="flex min-w-[9rem] items-center gap-2">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold text-white"
        style={{ backgroundColor: avatarColor }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">{name}</p>
        <p className="truncate text-[0.6875rem] text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
