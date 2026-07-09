import type {
  AdminAtributosTab,
  AdminAtributoStatus,
  AdminAtributoTipo,
  AdminAtributoVisibility,
  AdminCatalogAttribute,
} from '@/types/admin-atributos';

export const ATRIBUTO_TIPO_LABELS: Record<AdminAtributoTipo, string> = {
  lista: 'Lista',
  lista_multiple: 'Lista múltiple',
  numero: 'Número',
  texto: 'Texto',
  booleano: 'Booleano',
};

export const ATRIBUTO_TIPO_STYLES: Record<AdminAtributoTipo, string> = {
  lista: 'bg-blue-50 text-blue-700 ring-blue-100',
  lista_multiple: 'bg-violet-50 text-violet-700 ring-violet-100',
  numero: 'bg-amber-50 text-amber-700 ring-amber-100',
  texto: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  booleano: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const ATRIBUTO_VISIBILITY_LABELS: Record<AdminAtributoVisibility, string> = {
  publica: 'Pública',
  privada: 'Privada',
};

export const ATRIBUTO_STATUS_LABELS: Record<AdminAtributoStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};

export function mapAttributeToTab(scope: AdminCatalogAttribute['scope']): Exclude<AdminAtributosTab, 'todos'> {
  switch (scope) {
    case 'global':
      return 'globales';
    case 'especifico':
      return 'especificos';
    case 'sistema':
      return 'sistema';
    case 'personalizado':
      return 'personalizados';
    default: {
      const _exhaustive: never = scope;
      return _exhaustive;
    }
  }
}

export interface FilterAtributosInput {
  attributes: readonly AdminCatalogAttribute[];
  tab: AdminAtributosTab;
  search: string;
  tipoFilter: string;
  aplicaFilter: string;
  visibilityFilter: string;
  statusFilter: string;
}

export function filterAtributos({
  attributes,
  tab,
  search,
  tipoFilter,
  aplicaFilter,
  visibilityFilter,
  statusFilter,
}: FilterAtributosInput): AdminCatalogAttribute[] {
  const query = search.trim().toLowerCase();

  return attributes.filter((attribute) => {
    if (tab !== 'todos' && mapAttributeToTab(attribute.scope) !== tab) {
      return false;
    }

    if (tipoFilter !== 'todos' && attribute.tipo !== tipoFilter) {
      return false;
    }

    if (visibilityFilter !== 'todos' && attribute.visibilidad !== visibilityFilter) {
      return false;
    }

    if (statusFilter !== 'todos' && attribute.estado !== statusFilter) {
      return false;
    }

    if (aplicaFilter !== 'todos') {
      const applies =
        attribute.aplicaA.some((category) => category.toLowerCase().includes(aplicaFilter.toLowerCase())) ||
        (aplicaFilter === 'todas' && attribute.aplicaA.some((category) => category.toLowerCase().includes('todas')));
      if (!applies) return false;
    }

    if (!query) return true;

    const haystack = [
      attribute.name,
      attribute.slug,
      ATRIBUTO_TIPO_LABELS[attribute.tipo],
      attribute.valores,
      ...attribute.aplicaA,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function computeAtributosTabCounts(
  attributes: readonly AdminCatalogAttribute[],
): Record<Exclude<AdminAtributosTab, 'todos'>, number> {
  return {
    globales: attributes.filter((attribute) => attribute.scope === 'global').length,
    especificos: attributes.filter((attribute) => attribute.scope === 'especifico').length,
    sistema: attributes.filter((attribute) => attribute.scope === 'sistema').length,
    personalizados: attributes.filter((attribute) => attribute.scope === 'personalizado').length,
  };
}

export function formatAplicaA(categories: string[]): string {
  if (categories.length === 0) return '—';
  if (categories.length <= 2) return categories.join(', ');
  return `${categories.slice(0, 2).join(', ')} +${categories.length - 2}`;
}
