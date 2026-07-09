import type { AdminMarcaFormValues } from '@/lib/admin-marca-form';
import { ADMIN_MARCA_MANAGER_OPTIONS, slugifyMarca } from '@/lib/admin-marca-form';
import type { AdminMarcaRecord } from '@/types/admin-marcas';
import type {
  StoreBrandInput,
  StoreBrandWithCount,
  StoreBrandsSummary,
} from '@/types/store-brand';
import type {
  AdminMarcaCategoryPresence,
  AdminMarcaKpi,
  AdminMarcaOriginDistribution,
  AdminMarcaTopSeller,
} from '@/types/admin-marcas';

export function storeBrandToAdminRecord(brand: StoreBrandWithCount): AdminMarcaRecord {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    ...(brand.logo ? { logo: brand.logo } : {}),
    ...(brand.logoBg ? { logoBg: brand.logoBg } : {}),
    ...(brand.logoText ? { logoText: brand.logoText } : {}),
    country: brand.country,
    countryCode: brand.countryCode,
    categories: brand.categories,
    productCount: brand.productCount,
    manager: {
      name: brand.managerName,
      role: brand.managerRole,
      avatarColor: brand.managerAvatarColor,
    },
    status: brand.status,
    origin: brand.origin,
    createdAt: new Date(brand.createdAt),
    featured: brand.featured,
  };
}

export function formValuesToStoreBrandInput(values: AdminMarcaFormValues): StoreBrandInput {
  const name = values.name.trim();
  const logo = values.logo.trim();
  const preset = values.managerName.trim();
  const managerPreset = ADMIN_MARCA_MANAGER_OPTIONS.find((item) => item.name === preset);

  return {
    name,
    slug: values.slug.trim() || slugifyMarca(name),
    logo: logo || null,
    logoBg: logo ? null : '#111827',
    logoText: logo ? null : name.slice(0, 2).toUpperCase(),
    country: values.country,
    countryCode: values.countryCode,
    origin: values.origin,
    categories: values.categories
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    managerName: preset,
    managerRole: values.managerRole.trim() || managerPreset?.role || 'Gestor de catálogo',
    managerAvatarColor: managerPreset?.avatarColor ?? '#3B82F6',
    status: values.status,
    featured: values.featured,
  };
}

export function buildMarcasKpisFromSummary(summary: StoreBrandsSummary): AdminMarcaKpi[] {
  const { kpis } = summary;

  return [
    {
      title: 'Marcas activas',
      value: String(kpis.activeCount),
      delta: 0,
      trendLabel: 'en catálogo',
      icon: 'active',
      sparkline: [kpis.activeCount],
    },
    {
      title: 'Marcas destacadas',
      value: String(kpis.featuredCount),
      delta: 0,
      trendLabel: 'en catálogo',
      icon: 'featured',
      sparkline: [kpis.featuredCount],
    },
    {
      title: 'Productos asociados',
      value: kpis.productsAssociated.toLocaleString('es-PE'),
      delta: 0,
      trendLabel: 'en inventario',
      icon: 'products',
      sparkline: [kpis.productsAssociated],
    },
    {
      title: 'Países de origen',
      value: String(kpis.countriesCount),
      delta: 0,
      trendLabel: 'representados',
      icon: 'new',
      sparkline: [kpis.countriesCount],
    },
  ];
}

export function buildMarcasWidgetsFromSummary(summary: StoreBrandsSummary): {
  total: number;
  updatedAt: Date;
  originDistribution: AdminMarcaOriginDistribution[];
  categoryPresence: AdminMarcaCategoryPresence[];
  topSellers: AdminMarcaTopSeller[];
} {
  return {
    total: summary.total,
    updatedAt: new Date(summary.updatedAt),
    originDistribution: summary.originDistribution,
    categoryPresence: summary.categoryPresence,
    topSellers: summary.topSellers.map((item) => ({
      rank: item.rank,
      name: item.name,
      slug: item.slug,
      logoBg: item.logoBg ?? undefined,
      logoText: item.logoText ?? undefined,
      productCount: item.productCount,
    })),
  };
}
