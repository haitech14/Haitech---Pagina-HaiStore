import type {
  AdminServicioCategoria,
  AdminServicioEstado,
  AdminServicioModalidad,
  AdminServicioRecord,
} from '@/types/admin-servicios';
import type { ServiceRequestRecord } from '@/types/haitech-domain';
import type { ServiceCategory, ServicePriceItem } from '@/types/service';

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#16a34a'] as const;

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function avatarColorFromName(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
}

function inferCategoria(
  categoryId: string,
  categoryName: string,
): AdminServicioCategoria {
  const haystack = `${categoryId} ${categoryName}`.toLowerCase();
  if (haystack.includes('manten') || haystack.includes('prevent') || haystack.includes('correct')) {
    return 'mantenimiento';
  }
  if (haystack.includes('instal')) return 'instalacion';
  if (haystack.includes('soport') || haystack.includes('remot') || haystack.includes('técnic')) {
    return 'soporte';
  }
  if (haystack.includes('consult') || haystack.includes('infra')) return 'consultoria';
  return 'otros';
}

function inferModalidad(
  item: ServicePriceItem,
  categoryId: string,
  categoryName: string,
): AdminServicioModalidad {
  if (item.modalidad) return item.modalidad;
  const haystack = `${categoryId} ${categoryName} ${item.name}`.toLowerCase();
  if (haystack.includes('remot')) return 'remoto';
  if (haystack.includes('instal') || haystack.includes('mixt')) return 'mixto';
  return 'presencial';
}

function inferTipo(item: ServicePriceItem): AdminServicioRecord['tipo'] {
  if (item.tipo) return item.tipo;
  const name = item.name.toLowerCase();
  if (name.includes('mes') || name.includes('mensual') || name.includes('/ mes')) return 'mensual';
  if (name.includes('consult') || name.includes('desde')) return 'proyecto';
  return 'unico';
}

function formatPrecioLabel(item: ServicePriceItem): string {
  const amount = item.prices.public ?? 0;
  const tipo = inferTipo(item);
  if (tipo === 'mensual') return `S/ ${amount.toFixed(2)} / mes`;
  if (tipo === 'proyecto' && amount > 0) return `Desde S/ ${amount.toFixed(2)}`;
  if (amount <= 0) return '—';
  return `S/ ${amount.toFixed(2)}`;
}

function parseCreatedAt(item: ServicePriceItem): string {
  if (item.createdAt) return item.createdAt;
  const match = item.id.match(/(\d{10,13})/);
  if (match?.[1]) {
    const numeric = Number(match[1]);
    const ms = match[1].length === 13 ? numeric : numeric;
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date(2024, 3, 1).toISOString();
}

function categoryRequests(
  categoryId: string,
  requests: readonly ServiceRequestRecord[],
): ServiceRequestRecord[] {
  return requests.filter((request) => request.categoryId === categoryId);
}

function inferEstado(
  item: ServicePriceItem,
  category: ServiceCategory | undefined,
  requests: readonly ServiceRequestRecord[],
): AdminServicioEstado {
  if (item.estado) return item.estado;
  if (!item.active) return 'archivado';
  if (category && !category.active) return 'pausado';

  const related = categoryRequests(item.categoryId, requests);
  const hasScheduled = related.some(
    (request) => request.status === 'scheduled' || request.status === 'pending',
  );
  if (hasScheduled) return 'programado';

  return 'activo';
}

function inferCobertura(
  item: ServicePriceItem,
  requests: readonly ServiceRequestRecord[],
): string {
  if (item.cobertura?.trim()) return item.cobertura.trim();

  const cities = new Set(
    categoryRequests(item.categoryId, requests)
      .map((request) => request.city?.trim())
      .filter((city): city is string => Boolean(city)),
  );

  if (cities.size === 0) return 'Nacional';
  if (cities.size === 1) return [...cities][0] ?? 'Nacional';
  if (cities.size <= 3) return [...cities].join(', ');
  return 'Nacional';
}

function inferResponsable(
  item: ServicePriceItem,
  requests: readonly ServiceRequestRecord[],
): AdminServicioRecord['responsable'] {
  if (item.responsableName?.trim()) {
    const name = item.responsableName.trim();
    return {
      name,
      title: item.responsableTitle?.trim() || 'Responsable',
      initials: initialsFromName(name) || '—',
      avatarColor: avatarColorFromName(name),
    };
  }

  const technicians = categoryRequests(item.categoryId, requests)
    .map((request) => request.technician?.trim())
    .filter((name): name is string => Boolean(name));

  const name = technicians[0] ?? 'Sin asignar';
  return {
    name,
    title: technicians.length > 0 ? 'Técnico asignado' : 'Pendiente de asignación',
    initials: initialsFromName(name) || 'SA',
    avatarColor: avatarColorFromName(name),
  };
}

export function mapPriceItemToAdminServicio(
  item: ServicePriceItem,
  categories: readonly ServiceCategory[],
  requests: readonly ServiceRequestRecord[],
): AdminServicioRecord {
  const category = categories.find((row) => row.id === item.categoryId);
  const categoryName = category?.name ?? item.categoryId;

  return {
    id: item.id,
    sourceId: item.id,
    name: item.name,
    slug: slugify(item.name) || slugify(item.code) || item.id,
    categoria: inferCategoria(item.categoryId, categoryName),
    modalidad: inferModalidad(item, item.categoryId, categoryName),
    precioLabel: formatPrecioLabel(item),
    cobertura: inferCobertura(item, requests),
    responsable: inferResponsable(item, requests),
    estado: inferEstado(item, category, requests),
    tipo: inferTipo(item),
    createdAt: parseCreatedAt(item),
  };
}

export function mapPriceListToAdminServicios(
  items: readonly ServicePriceItem[],
  categories: readonly ServiceCategory[],
  requests: readonly ServiceRequestRecord[],
): AdminServicioRecord[] {
  return items.map((item) => mapPriceItemToAdminServicio(item, categories, requests));
}

export function mergeServiceCategories(
  apiCategories: readonly { id: string; name: string; description: string; active: boolean; sortOrder: number }[],
  localCategories: readonly ServiceCategory[],
): ServiceCategory[] {
  if (apiCategories.length > 0) {
    return apiCategories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      active: category.active,
      sortOrder: category.sortOrder,
    }));
  }
  return [...localCategories];
}
