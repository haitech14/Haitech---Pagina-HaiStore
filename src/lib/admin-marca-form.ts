import type { AdminMarcaRecord, AdminMarcaStatus } from '@/types/admin-marcas';

export interface AdminMarcaCountryOption {
  label: string;
  code: string;
  origin: string;
}

export interface AdminMarcaManagerOption {
  name: string;
  role: string;
  avatarColor: string;
}

export interface AdminMarcaFormValues {
  name: string;
  slug: string;
  logo: string;
  country: string;
  countryCode: string;
  origin: string;
  categories: string;
  managerName: string;
  managerRole: string;
  status: AdminMarcaStatus;
  featured: boolean;
}

export const ADMIN_MARCA_COUNTRY_OPTIONS: AdminMarcaCountryOption[] = [
  { label: 'Corea del Sur', code: 'KR', origin: 'Asia' },
  { label: 'China', code: 'CN', origin: 'Asia' },
  { label: 'Japón', code: 'JP', origin: 'Asia' },
  { label: 'Taiwán', code: 'TW', origin: 'Asia' },
  { label: 'Estados Unidos', code: 'US', origin: 'Norteamérica' },
  { label: 'Canadá', code: 'CA', origin: 'Norteamérica' },
  { label: 'México', code: 'MX', origin: 'Norteamérica' },
  { label: 'Alemania', code: 'DE', origin: 'Europa' },
  { label: 'Suiza', code: 'CH', origin: 'Europa' },
  { label: 'España', code: 'ES', origin: 'Europa' },
  { label: 'Perú', code: 'PE', origin: 'Otros' },
  { label: 'Brasil', code: 'BR', origin: 'Otros' },
];

export const ADMIN_MARCA_ORIGIN_OPTIONS = [
  'Asia',
  'Norteamérica',
  'Europa',
  'Otros',
] as const;

export const ADMIN_MARCA_MANAGER_OPTIONS: AdminMarcaManagerOption[] = [
  { name: 'Juan Mendoza', role: 'Gerente de Compras', avatarColor: '#3B82F6' },
  { name: 'Ana Ruiz', role: 'Coordinadora de Catálogo', avatarColor: '#8B5CF6' },
  { name: 'Javier Soto', role: 'Analista de Inventario', avatarColor: '#22C55E' },
];

export const ADMIN_MARCA_CATEGORY_SUGGESTIONS = [
  'Computación',
  'Accesorios',
  'Gaming',
  'Impresoras',
  'Periféricos',
  'Laptops',
  'Hardware',
  'Almacenamiento',
  'Componentes',
  'Audio',
  'Monitores',
  'Empresarial',
] as const;

const MANAGER_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EC4899'] as const;

export function slugifyMarca(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createEmptyMarcaFormValues(): AdminMarcaFormValues {
  const defaultCountry = ADMIN_MARCA_COUNTRY_OPTIONS[0];
  const defaultManager = ADMIN_MARCA_MANAGER_OPTIONS[0];

  return {
    name: '',
    slug: '',
    logo: '',
    country: defaultCountry.label,
    countryCode: defaultCountry.code,
    origin: defaultCountry.origin,
    categories: '',
    managerName: defaultManager.name,
    managerRole: defaultManager.role,
    status: 'activa',
    featured: false,
  };
}

export function marcaRecordToFormValues(record: AdminMarcaRecord): AdminMarcaFormValues {
  return {
    name: record.name,
    slug: record.slug,
    logo: record.logo ?? '',
    country: record.country,
    countryCode: record.countryCode,
    origin: record.origin,
    categories: record.categories.join(', '),
    managerName: record.manager.name,
    managerRole: record.manager.role,
    status: record.status,
    featured: record.featured ?? false,
  };
}

function resolveManager(values: AdminMarcaFormValues) {
  const preset = ADMIN_MARCA_MANAGER_OPTIONS.find((item) => item.name === values.managerName);
  if (preset) return preset;

  const colorIndex =
    Math.abs(values.managerName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) %
    MANAGER_COLORS.length;

  return {
    name: values.managerName.trim(),
    role: values.managerRole.trim() || 'Gestor de catálogo',
    avatarColor: MANAGER_COLORS[colorIndex] ?? MANAGER_COLORS[0],
  };
}

function parseCategories(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveMarcaVisual(
  name: string,
  logo: string,
  existing?: AdminMarcaRecord | null,
): Pick<AdminMarcaRecord, 'logo' | 'logoBg' | 'logoText'> {
  if (logo) return { logo };

  if (existing?.logo) return { logo: existing.logo };
  if (existing?.logoBg || existing?.logoText) {
    return {
      logoBg: existing.logoBg ?? '#111827',
      logoText: existing.logoText ?? name.slice(0, 2).toUpperCase(),
    };
  }

  return {
    logoBg: '#111827',
    logoText: name.slice(0, 2).toUpperCase(),
  };
}

export function buildMarcaRecordFromForm(
  values: AdminMarcaFormValues,
  existing?: AdminMarcaRecord | null,
): AdminMarcaRecord {
  const name = values.name.trim();
  const slug = values.slug.trim() || slugifyMarca(name);
  const categories = parseCategories(values.categories);
  const manager = resolveManager(values);
  const logo = values.logo.trim();
  const visual = resolveMarcaVisual(name, logo, existing);

  return {
    id: existing?.id ?? `marca-${Date.now()}`,
    name,
    slug,
    ...visual,
    country: values.country,
    countryCode: values.countryCode,
    categories: categories.length > 0 ? categories : ['General'],
    ...(existing?.extraCategories ? { extraCategories: existing.extraCategories } : {}),
    productCount: existing?.productCount ?? 0,
    manager,
    status: values.status,
    origin: values.origin,
    createdAt: existing?.createdAt ?? new Date(),
    featured: values.featured,
  };
}

export function findCountryOption(label: string): AdminMarcaCountryOption | undefined {
  return ADMIN_MARCA_COUNTRY_OPTIONS.find((item) => item.label === label);
}
