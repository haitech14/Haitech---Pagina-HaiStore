import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import type {
  AdminServicioCategoria,
  AdminServicioEstado,
  AdminServicioModalidad,
  AdminServicioRecord,
  AdminServiciosTab,
} from '@/types/admin-servicios';

export const SERVICIO_CATEGORIA_LABELS: Record<AdminServicioCategoria, string> = {
  mantenimiento: 'Mantenimiento',
  instalacion: 'Instalación',
  soporte: 'Soporte',
  consultoria: 'Consultoría',
  otros: 'Otros',
};

export const SERVICIO_CATEGORIA_STYLES: Record<AdminServicioCategoria, string> = {
  mantenimiento: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  instalacion: 'bg-blue-50 text-blue-700 ring-blue-100',
  soporte: 'bg-violet-50 text-violet-700 ring-violet-100',
  consultoria: 'bg-amber-50 text-amber-700 ring-amber-100',
  otros: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const SERVICIO_MODALIDAD_LABELS: Record<AdminServicioModalidad, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  mixto: 'Mixto',
};

export const SERVICIO_ESTADO_LABELS: Record<AdminServicioEstado, string> = {
  activo: 'Activo',
  programado: 'Programado',
  pausado: 'Pausado',
  archivado: 'Archivado',
};

export const SERVICIO_ESTADO_STYLES: Record<AdminServicioEstado, string> = {
  activo: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  programado: 'bg-blue-50 text-blue-700 ring-blue-100',
  pausado: 'bg-amber-50 text-amber-700 ring-amber-100',
  archivado: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const SERVICIO_TIPO_LABELS: Record<AdminServicioRecord['tipo'], string> = {
  unico: 'Único',
  mensual: 'Mensual',
  proyecto: 'Proyecto',
};

export function mapServicioToTab(
  estado: AdminServicioEstado,
): Exclude<AdminServiciosTab, 'todos'> {
  switch (estado) {
    case 'activo':
      return 'activos';
    case 'programado':
      return 'programados';
    case 'pausado':
      return 'pausados';
    case 'archivado':
      return 'archivados';
    default: {
      const _exhaustive: never = estado;
      return _exhaustive;
    }
  }
}

export interface FilterServiciosInput {
  services: readonly AdminServicioRecord[];
  tab: AdminServiciosTab;
  search: string;
  categoriaFilter: string;
  responsableFilter: string;
  tipoFilter: string;
  range: AdminDateRange;
}

function isInRange(iso: string, range: AdminDateRange): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date >= range.from && date <= range.to;
}

export function filterServicios({
  services,
  tab,
  search,
  categoriaFilter,
  responsableFilter,
  tipoFilter,
  range,
}: FilterServiciosInput): AdminServicioRecord[] {
  const query = search.trim().toLowerCase();

  return services.filter((service) => {
    if (tab !== 'todos' && mapServicioToTab(service.estado) !== tab) {
      return false;
    }

    if (categoriaFilter !== 'todos' && service.categoria !== categoriaFilter) {
      return false;
    }

    if (tipoFilter !== 'todos' && service.tipo !== tipoFilter) {
      return false;
    }

    if (responsableFilter !== 'todos' && service.responsable.initials !== responsableFilter) {
      return false;
    }

    if (!isInRange(service.createdAt, range)) {
      return false;
    }

    if (!query) return true;

    const haystack = [
      service.name,
      service.slug,
      SERVICIO_CATEGORIA_LABELS[service.categoria],
      SERVICIO_MODALIDAD_LABELS[service.modalidad],
      service.responsable.name,
      service.responsable.title,
      service.cobertura,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function computeServiciosTabCounts(
  services: readonly AdminServicioRecord[],
): Record<Exclude<AdminServiciosTab, 'todos'>, number> {
  return {
    activos: services.filter((service) => service.estado === 'activo').length,
    programados: services.filter((service) => service.estado === 'programado').length,
    pausados: services.filter((service) => service.estado === 'pausado').length,
    archivados: services.filter((service) => service.estado === 'archivado').length,
  };
}
