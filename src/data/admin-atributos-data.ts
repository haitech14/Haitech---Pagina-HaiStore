import type {
  AdminAtributosCategoryUsage,
  AdminAtributosKpi,
  AdminAtributosTopUsed,
  AdminAtributosTypeDistribution,
  AdminCatalogAttribute,
} from '@/types/admin-atributos';
import { ATRIBUTO_TIPO_LABELS } from '@/lib/admin-atributos-utils';

const BASE_CREATED_AT = '2026-07-10T00:00:00.000Z';

export const ADMIN_ATRIBUTOS_UPDATED_AT = new Date();

export const ADMIN_CATALOG_ATTRIBUTES: AdminCatalogAttribute[] = [
  {
    id: 'attr-formato',
    name: 'Formato',
    slug: 'formato',
    tipo: 'lista',
    valores: 'A4, A3',
    aplicaA: ['Multifuncionales', 'Impresoras', 'Escáneres'],
    visibilidad: 'publica',
    estado: 'activo',
    scope: 'sistema',
    required: true,
    usedInFilters: true,
    productCount: 0,
    createdAt: BASE_CREATED_AT,
  },
  {
    id: 'attr-color',
    name: 'Color',
    slug: 'color',
    tipo: 'lista',
    valores: 'Color, B/N',
    aplicaA: ['Multifuncionales', 'Impresoras'],
    visibilidad: 'publica',
    estado: 'activo',
    scope: 'sistema',
    required: true,
    usedInFilters: true,
    productCount: 0,
    createdAt: BASE_CREATED_AT,
  },
  {
    id: 'attr-condicion',
    name: 'Condición',
    slug: 'condicion',
    tipo: 'lista',
    valores: 'Nueva, Seminueva, Remanufacturada, Original, Compatible, Recarga',
    aplicaA: ['Multifuncionales', 'Impresoras', 'Suministros', 'Repuestos'],
    visibilidad: 'publica',
    estado: 'activo',
    scope: 'sistema',
    required: true,
    usedInFilters: true,
    productCount: 0,
    createdAt: BASE_CREATED_AT,
  },
  {
    id: 'attr-generacion',
    name: 'Generación',
    slug: 'generacion',
    tipo: 'lista',
    valores: 'Linea IM, Linea Smart',
    aplicaA: ['Multifuncionales', 'Impresoras'],
    visibilidad: 'publica',
    estado: 'activo',
    scope: 'global',
    required: false,
    usedInFilters: true,
    productCount: 0,
    createdAt: BASE_CREATED_AT,
  },
  {
    id: 'attr-ano-fabricacion',
    name: 'Año de Fabricación',
    slug: 'ano-de-fabricacion',
    tipo: 'lista',
    valores: '2024, 2026, 2022, 2014, 2016, 2020',
    aplicaA: ['Multifuncionales', 'Impresoras', 'Escáneres'],
    visibilidad: 'publica',
    estado: 'activo',
    scope: 'global',
    required: false,
    usedInFilters: false,
    productCount: 0,
    createdAt: BASE_CREATED_AT,
  },
];

function countAttributeValues(valores: string): number {
  return valores
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean).length;
}

function buildTypeDistribution(
  attributes: readonly AdminCatalogAttribute[],
): AdminAtributosTypeDistribution[] {
  const colors: Record<AdminCatalogAttribute['tipo'], string> = {
    lista: '#3B82F6',
    lista_multiple: '#8B5CF6',
    numero: '#F59E0B',
    texto: '#22C55E',
    booleano: '#94A3B8',
  };

  const totals = new Map<AdminCatalogAttribute['tipo'], number>();
  for (const attribute of attributes) {
    totals.set(attribute.tipo, (totals.get(attribute.tipo) ?? 0) + 1);
  }

  const total = attributes.length || 1;

  return [...totals.entries()].map(([tipo, count]) => ({
    tipo,
    label: ATRIBUTO_TIPO_LABELS[tipo],
    count,
    percent: Math.round((count / total) * 100),
    color: colors[tipo],
  }));
}

function buildCategoryUsage(
  attributes: readonly AdminCatalogAttribute[],
): AdminAtributosCategoryUsage[] {
  const usage = new Map<string, number>();

  for (const attribute of attributes) {
    for (const category of attribute.aplicaA) {
      usage.set(category, (usage.get(category) ?? 0) + 1);
    }
  }

  const total = attributes.length || 1;

  return [...usage.entries()]
    .map(([category, used]) => ({
      category,
      used,
      total,
      percent: Math.round((used / total) * 100),
    }))
    .sort((a, b) => b.used - a.used)
    .slice(0, 5);
}

function buildTopUsed(attributes: readonly AdminCatalogAttribute[]): AdminAtributosTopUsed[] {
  return [...attributes]
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, 'es'))
    .slice(0, 5)
    .map((attribute, index) => ({
      rank: index + 1,
      name: attribute.name,
      productCount: attribute.productCount,
    }));
}

function buildKpis(attributes: readonly AdminCatalogAttribute[]): AdminAtributosKpi[] {
  const active = attributes.filter((attribute) => attribute.estado === 'activo').length;
  const values = attributes.reduce((sum, attribute) => sum + countAttributeValues(attribute.valores), 0);
  const required = attributes.filter((attribute) => attribute.required).length;
  const filters = attributes.filter((attribute) => attribute.usedInFilters).length;

  return [
    {
      title: 'Atributos activos',
      value: String(active),
      icon: 'active',
      trendLabel: 'configurados en catálogo',
      sparkline: [0, 0, 0, 0, active],
    },
    {
      title: 'Valores registrados',
      value: String(values),
      icon: 'values',
      trendLabel: 'opciones en listas',
      sparkline: [0, 0, 0, 0, values],
    },
    {
      title: 'Obligatorios',
      value: String(required),
      icon: 'required',
      trendLabel: 'requeridos al publicar',
      sparkline: [0, 0, 0, 0, required],
    },
    {
      title: 'En filtros',
      value: String(filters),
      icon: 'filters',
      trendLabel: 'visibles en tienda',
      sparkline: [0, 0, 0, 0, filters],
    },
  ];
}

export const ADMIN_ATRIBUTOS_KPIS = buildKpis(ADMIN_CATALOG_ATTRIBUTES);
export const ADMIN_ATRIBUTOS_TYPE_DISTRIBUTION = buildTypeDistribution(ADMIN_CATALOG_ATTRIBUTES);
export const ADMIN_ATRIBUTOS_CATEGORY_USAGE = buildCategoryUsage(ADMIN_CATALOG_ATTRIBUTES);
export const ADMIN_ATRIBUTOS_TOP_USED = buildTopUsed(ADMIN_CATALOG_ATTRIBUTES);
