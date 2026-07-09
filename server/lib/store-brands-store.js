import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

import { readInventory } from './inventory-store.js';
import { getStoreBrandsPath } from './server-paths.js';

const BUNDLED_STORE_BRANDS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/store-brands.json',
);

const ORIGIN_COLORS = {
  Asia: '#8B5CF6',
  'Norteamérica': '#22C55E',
  Europa: '#3B82F6',
  Otros: '#F59E0B',
};

function brandsPath() {
  return getStoreBrandsPath();
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normalizeBrandName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function parseBrandTags(brandField) {
  if (!brandField?.trim()) return [];
  return brandField
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeCategories(raw, existing) {
  if (!Array.isArray(raw)) return existing?.categories ?? [];
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeBrand(raw, existing) {
  const name = String(raw.name ?? existing?.name ?? '').trim();
  const slug = slugify(raw.slug ?? name ?? existing?.slug) || randomUUID().slice(0, 8);
  const status = raw.status === 'inactiva' ? 'inactiva' : 'activa';

  return {
    id: existing?.id ?? raw.id ?? `brand-${randomUUID()}`,
    name,
    slug,
    logo: raw.logo ?? existing?.logo ?? null,
    logoBg: raw.logoBg ?? existing?.logoBg ?? null,
    logoText: raw.logoText ?? existing?.logoText ?? null,
    country: String(raw.country ?? existing?.country ?? 'Perú').trim(),
    countryCode: String(raw.countryCode ?? existing?.countryCode ?? 'PE').trim().toUpperCase(),
    origin: String(raw.origin ?? existing?.origin ?? 'Otros').trim(),
    categories: normalizeCategories(raw.categories, existing),
    managerName: String(raw.managerName ?? existing?.managerName ?? 'Sin asignar').trim(),
    managerRole: String(raw.managerRole ?? existing?.managerRole ?? 'Gestor de catálogo').trim(),
    managerAvatarColor: String(raw.managerAvatarColor ?? existing?.managerAvatarColor ?? '#3B82F6'),
    status,
    featured: Boolean(raw.featured ?? existing?.featured ?? false),
    createdAt: raw.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
    sortOrder: Number(raw.sortOrder ?? existing?.sortOrder ?? 0),
  };
}

async function ensureBrandsFile() {
  try {
    await fs.access(brandsPath());
    return;
  } catch {
    // crear abajo
  }

  await fs.mkdir(path.dirname(brandsPath()), { recursive: true });

  try {
    const bundled = await fs.readFile(BUNDLED_STORE_BRANDS_PATH, 'utf8');
    await fs.writeFile(brandsPath(), bundled);
  } catch {
    await fs.writeFile(brandsPath(), JSON.stringify({ brands: [] }, null, 2));
  }
}

export async function readStoreBrands() {
  await ensureBrandsFile();
  const raw = await fs.readFile(brandsPath(), 'utf8');
  const data = JSON.parse(raw);
  return (data.brands ?? []).map((row) => normalizeBrand(row));
}

export async function writeStoreBrands(brands) {
  const normalized = brands.map((row) => normalizeBrand(row));
  await fs.mkdir(path.dirname(brandsPath()), { recursive: true });
  await fs.writeFile(brandsPath(), JSON.stringify({ brands: normalized }, null, 2));
  invalidateStoreBrandsCache();
  return normalized;
}

function countProductsForBrand(brand, products) {
  const target = normalizeBrandName(brand.name);
  let count = 0;

  for (const product of products) {
    const tags = parseBrandTags(product.brand);
    if (tags.some((tag) => normalizeBrandName(tag) === target)) {
      count += 1;
      continue;
    }
    if (normalizeBrandName(product.brand) === target) count += 1;
  }

  return count;
}

function enrichBrand(brand, products) {
  return {
    ...brand,
    productCount: countProductsForBrand(brand, products),
  };
}

function buildSummary(brands) {
  const activeBrands = brands.filter((brand) => brand.status === 'activa');
  const featuredBrands = brands.filter((brand) => brand.featured);
  const productsAssociated = brands.reduce((sum, brand) => sum + (brand.productCount ?? 0), 0);
  const countries = new Set(brands.map((brand) => brand.countryCode).filter(Boolean));

  const originMap = new Map();
  for (const brand of brands) {
    const key = brand.origin || 'Otros';
    const current = originMap.get(key) ?? { region: key, count: 0, color: ORIGIN_COLORS[key] ?? '#94A3B8' };
    current.count += 1;
    originMap.set(key, current);
  }

  const total = brands.length || 1;
  const originDistribution = [...originMap.values()]
    .map((item) => ({
      region: item.region,
      count: item.count,
      percent: Math.round((item.count / total) * 100),
      color: item.color,
    }))
    .sort((a, b) => b.count - a.count);

  const categoryMap = new Map();
  for (const brand of brands) {
    for (const category of brand.categories ?? []) {
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
    }
  }

  const categoryPresence = [...categoryMap.entries()]
    .map(([category, count]) => ({
      category,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const topSellers = [...brands]
    .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0))
    .slice(0, 5)
    .map((brand, index) => ({
      rank: index + 1,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      logoBg: brand.logoBg,
      logoText: brand.logoText,
      productCount: brand.productCount ?? 0,
    }));

  return {
    total: brands.length,
    updatedAt: new Date().toISOString(),
    kpis: {
      activeCount: activeBrands.length,
      featuredCount: featuredBrands.length,
      productsAssociated,
      countriesCount: countries.size,
    },
    originDistribution,
    categoryPresence,
    topSellers,
  };
}

const BRANDS_CACHE_TTL_MS = 60 * 1000;
let brandsCache = null;
let brandsCacheAt = 0;

export function invalidateStoreBrandsCache() {
  brandsCache = null;
  brandsCacheAt = 0;
}

export async function readStoreBrandsCatalog() {
  const now = Date.now();
  if (brandsCache && now - brandsCacheAt < BRANDS_CACHE_TTL_MS) {
    return brandsCache;
  }

  const brands = await readStoreBrands();
  const { products } = await readInventory();
  const enriched = brands
    .map((brand) => enrichBrand(brand, products))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'));

  const payload = {
    brands: enriched,
    summary: buildSummary(enriched),
  };

  brandsCache = payload;
  brandsCacheAt = now;
  return payload;
}

function findDuplicate(brands, { name, slug, excludeId }) {
  const normalizedName = normalizeBrandName(name);
  const normalizedSlug = slugify(slug);

  return brands.find((brand) => {
    if (excludeId && brand.id === excludeId) return false;
    return normalizeBrandName(brand.name) === normalizedName || brand.slug === normalizedSlug;
  });
}

export async function createStoreBrand(input) {
  const brands = await readStoreBrands();
  const name = String(input.name ?? '').trim();
  if (!name) throw new Error('El nombre de la marca es obligatorio');

  const slug = slugify(input.slug ?? name);
  if (findDuplicate(brands, { name, slug })) {
    throw new Error('Ya existe una marca con ese nombre o slug');
  }

  const siblings = brands.length;
  const brand = normalizeBrand({
    ...input,
    name,
    slug,
    sortOrder: input.sortOrder ?? siblings,
    createdAt: new Date().toISOString(),
  });

  brands.push(brand);
  await writeStoreBrands(brands);
  const { products } = await readInventory();
  return enrichBrand(brand, products);
}

export async function updateStoreBrand(id, input) {
  const brands = await readStoreBrands();
  const index = brands.findIndex((row) => row.id === id);
  if (index === -1) throw new Error('Marca no encontrada');

  const nextName = input.name === undefined ? brands[index].name : String(input.name).trim();
  const nextSlug = slugify(input.slug ?? nextName ?? brands[index].slug);

  if (
    findDuplicate(brands, {
      name: nextName,
      slug: nextSlug,
      excludeId: id,
    })
  ) {
    throw new Error('Ya existe una marca con ese nombre o slug');
  }

  brands[index] = normalizeBrand(
    {
      ...brands[index],
      ...input,
      name: nextName,
      slug: nextSlug,
    },
    brands[index],
  );

  await writeStoreBrands(brands);
  const { products } = await readInventory();
  return enrichBrand(brands[index], products);
}

export async function deleteStoreBrand(id) {
  const brands = await readStoreBrands();
  const next = brands.filter((row) => row.id !== id);
  if (next.length === brands.length) throw new Error('Marca no encontrada');
  await writeStoreBrands(next);
  return { ok: true };
}

export async function syncBrandsFromInventory() {
  const brands = await readStoreBrands();
  const { products } = await readInventory();
  const known = new Set(brands.map((brand) => normalizeBrandName(brand.name)));
  let changed = false;

  for (const product of products) {
    for (const tag of parseBrandTags(product.brand)) {
      const key = normalizeBrandName(tag);
      if (!key || known.has(key)) continue;

      brands.push(
        normalizeBrand({
          name: tag.trim(),
          slug: slugify(tag),
          origin: 'Otros',
          country: 'Perú',
          countryCode: 'PE',
          categories: product.category ? [String(product.category).trim()] : ['General'],
          status: 'activa',
          featured: false,
          sortOrder: brands.length,
          createdAt: new Date().toISOString(),
        }),
      );
      known.add(key);
      changed = true;
    }
  }

  if (changed) await writeStoreBrands(brands);
  return readStoreBrandsCatalog();
}
