import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';
import { ensureFullPrices } from '../server/lib/roles.js';
import { deriveProductSlug } from '../shared/product-slug.js';
import { landingInventoryCategory } from '../shared/landing-categories.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRODUCTS_DIR = join(ROOT, 'public', 'products');

const EXCHANGE_RATE = (() => {
  try {
    const settings = JSON.parse(
      readFileSync(join(ROOT, 'server/data/company-settings.json'), 'utf8'),
    );
    const rate = Number(settings.usdToPenExchangeRate);
    return rate > 0 ? rate : 3.46;
  } catch {
    return 3.46;
  }
})();

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

const PARENT_CATEGORY = {
  id: 'cat-software',
  name: 'Software',
  slug: 'software',
  tagline: 'Soluciones de gestión documental, seguridad e IA',
  image: '/categories/soluciones-negocio.png',
  inventoryLabels: ['Software'],
};

const PARENT_CATEGORY_ID = PARENT_CATEGORY.id;
const IA_SUBCATEGORY = {
  id: 'cat-software-ia',
  name: 'Inteligencia Artificial',
  slug: 'inteligencia-artificial',
  inventoryLabels: [
    'Inteligencia Artificial',
    landingInventoryCategory('Software', 'Inteligencia Artificial'),
  ],
};

const INVENTORY_CATEGORY = landingInventoryCategory('Software', 'Inteligencia Artificial');

/** @type {Array<{ slug: string; code: string; name: string; brand: string; publicPen: number; techPen: number; provider?: string; purchaseCost?: string; description: string }>} */
const PRODUCTS = [
  {
    slug: 'chatgpt-pro-perfil-1-mes',
    code: 'IA-CHATGPT-PRO-1M',
    name: 'Licencia ChatGPT Pro Perfil X1 Mes',
    brand: 'OpenAI',
    publicPen: 60,
    techPen: 40,
    provider: 'Stream Box',
    purchaseCost: 'USD 2.75',
    description: 'Licencia ChatGPT Pro por 1 mes. 1 perfil. Proveedor Stream Box.',
  },
  {
    slug: 'chatgpt-plus-perfil-1-mes',
    code: 'IA-CHATGPT-PLUS-1M',
    name: 'Licencia ChatGPT Plus Perfil X1 Mes',
    brand: 'OpenAI',
    publicPen: 30,
    techPen: 25,
    provider: 'Streambox',
    purchaseCost: 'USD 2.75',
    description: 'Licencia ChatGPT Plus por 1 mes. 1 perfil. Proveedor Streambox.',
  },
  {
    slug: 'chatgpt-plus-perfil-3-meses',
    code: 'IA-CHATGPT-PLUS-3M',
    name: 'Licencia ChatGPT Plus X3 Meses',
    brand: 'OpenAI',
    publicPen: 80,
    techPen: 65,
    provider: 'Noddle Store',
    purchaseCost: 'USD 7.50',
    description: 'Licencia ChatGPT Plus por 3 meses. 1 perfil. Proveedor Noddle Store.',
  },
  {
    slug: 'chatgpt-plus-cuenta-completa-1-mes',
    code: 'IA-CHATGPT-PLUS-FULL-1M',
    name: 'Cuenta Completa ChatGPT Plus X1 Mes',
    brand: 'OpenAI',
    publicPen: 70,
    techPen: 65,
    provider: 'Noddle Store',
    purchaseCost: 'USD 15',
    description: 'Cuenta completa ChatGPT Plus por 1 mes. Proveedor Noddle Store.',
  },
  {
    slug: 'gemini-pro-perfil-1-anio',
    code: 'IA-GEMINI-PRO-1Y',
    name: 'Licencia Gemini Pro / 5 TB Perfil x 1 Año',
    brand: 'Google',
    publicPen: 50,
    techPen: 40,
    purchaseCost: 'USD 1.20',
    description: 'Licencia Gemini Pro con 5 TB. Invitación a tu correo. 1 perfil · 1 año.',
  },
  {
    slug: 'gemini-pro-cuenta-completa-1-anio',
    code: 'IA-GEMINI-FULL-1Y',
    name: 'Cuenta Completa Gemini Pro / 5 TB x 1 Año',
    brand: 'Google',
    publicPen: 60,
    techPen: 50,
    purchaseCost: 'USD 7',
    description: 'Cuenta completa Gemini Pro con 5 TB por 1 año.',
  },
  {
    slug: 'super-grok-perfil-1-mes',
    code: 'IA-GROK-1M',
    name: 'Licencia Super Grok X1 Mes',
    brand: 'xAI',
    publicPen: 40,
    techPen: 30,
    purchaseCost: 'USD 8',
    description: 'Licencia Super Grok por 1 mes. 1 perfil.',
  },
  {
    slug: 'super-grok-cuenta-completa',
    code: 'IA-GROK-FULL',
    name: 'Cuenta Completa Super Grok',
    brand: 'xAI',
    publicPen: 85,
    techPen: 70,
    purchaseCost: 'USD 11.80',
    description: 'Cuenta completa Super Grok.',
  },
  {
    slug: 'microsoft-365-cuenta-completa-1-anio',
    code: 'IA-M365-FULL-1Y',
    name: 'Cuenta Completa Microsoft 365 x 1 Año',
    brand: 'Microsoft',
    publicPen: 70,
    techPen: 55,
    provider: 'Luna Streaming',
    purchaseCost: 'USD 6',
    description: 'Cuenta completa Microsoft 365 por 1 año. Hasta 15 dispositivos.',
  },
  {
    slug: 'microsoft-365-perfil-1-anio',
    code: 'IA-M365-1Y',
    name: 'Licencia Microsoft 365 x 1 Año',
    brand: 'Microsoft',
    publicPen: 30,
    techPen: 20,
    provider: 'Luna Streaming',
    purchaseCost: 'S/ 4.60',
    description: 'Licencia Microsoft 365 por 1 año. 1 perfil.',
  },
  {
    slug: 'windows-10-11-licencia-permanente',
    code: 'IA-WIN-PERM',
    name: 'Licencia Windows 10 / Windows 11 Permanente',
    brand: 'Microsoft',
    publicPen: 50,
    techPen: 35,
    provider: 'Luna Streaming',
    purchaseCost: 'USD 6',
    description: 'Licencia permanente Windows 10 o Windows 11. 1 dispositivo.',
  },
  {
    slug: 'turnitin-reporte-plagio-ia',
    code: 'IA-TURNITIN-1',
    name: 'Licencia Turnitin Reporte (Plagio + IA)',
    brand: 'Turnitin',
    publicPen: 20,
    techPen: 15,
    provider: 'JPM Shop',
    purchaseCost: 'USD 2',
    description: 'Reporte Turnitin de plagio y detección de contenido con IA.',
  },
  {
    slug: 'nordvpn-surfshark-vpn-1-mes',
    code: 'IA-VPN-NORD-SURF-1M',
    name: 'Licencia Nord VPN y Surfshark VPN X1 Mes',
    brand: 'Nord / Surfshark',
    publicPen: 28,
    techPen: 18,
    provider: 'HappyCanchita',
    purchaseCost: 'USD 2.70',
    description: 'Acceso Nord VPN y Surfshark VPN por 1 mes.',
  },
];

async function ensureSoftwareParent() {
  let categories = await readStoreCategories();
  let parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);

  if (!parent) {
    parent = await createStoreCategory({
      name: PARENT_CATEGORY.name,
      slug: PARENT_CATEGORY.slug,
      parentId: null,
      sortOrder: categories.filter((row) => !row.parentId).length,
      inventoryLabels: PARENT_CATEGORY.inventoryLabels,
      image: PARENT_CATEGORY.image,
      tagline: PARENT_CATEGORY.tagline,
    });
    categories = await readStoreCategories();
    parent = categories.find((row) => row.id === PARENT_CATEGORY_ID) ?? parent;
  } else {
    const labels = new Set([...(parent.inventoryLabels ?? []), ...PARENT_CATEGORY.inventoryLabels]);
    await updateStoreCategory(parent.id, {
      inventoryLabels: [...labels],
      image: parent.image ?? PARENT_CATEGORY.image,
      tagline: parent.tagline ?? PARENT_CATEGORY.tagline,
    });
  }

  return parent;
}

async function ensureIaSubcategory() {
  const parent = await ensureSoftwareParent();
  let categories = await readStoreCategories();
  const existingChild = categories.find((row) => row.id === IA_SUBCATEGORY.id);
  if (existingChild) {
    const labels = new Set([
      ...(existingChild.inventoryLabels ?? []),
      ...IA_SUBCATEGORY.inventoryLabels,
    ]);
    await updateStoreCategory(existingChild.id, {
      name: IA_SUBCATEGORY.name,
      slug: IA_SUBCATEGORY.slug,
      parentId: parent.id,
      inventoryLabels: [...labels],
    });
    return;
  }

  const duplicateSlug = categories.find((row) => row.slug === IA_SUBCATEGORY.slug);
  if (duplicateSlug) {
    const labels = new Set([
      ...(duplicateSlug.inventoryLabels ?? []),
      ...IA_SUBCATEGORY.inventoryLabels,
    ]);
    await updateStoreCategory(duplicateSlug.id, {
      parentId: parent.id,
      inventoryLabels: [...labels],
    });
    return;
  }

  await createStoreCategory({
    name: IA_SUBCATEGORY.name,
    slug: IA_SUBCATEGORY.slug,
    parentId: parent.id,
    sortOrder: 1,
    inventoryLabels: IA_SUBCATEGORY.inventoryLabels,
  });
}

async function ensureProductImage(slug) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const outPath = join(PRODUCTS_DIR, `${slug}.webp`);
  const source = join(ROOT, 'public', 'services', 'servicios-corporativos', 'saas.png');

  if (!existsSync(outPath)) {
    const input = existsSync(source)
      ? source
      : join(ROOT, 'public', 'categories', 'soluciones-negocio.png');
    if (existsSync(input)) {
      await sharp(input)
        .resize({ width: 800, height: 600, fit: 'cover' })
        .webp({ quality: 82 })
        .toFile(outPath);
    } else {
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 15, g: 31, b: 61 },
        },
      })
        .webp({ quality: 82 })
        .toFile(outPath);
    }
  }

  for (const [suffix, width] of [
    ['-256', 256],
    ['-512', 512],
  ]) {
    const sizedPath = join(PRODUCTS_DIR, `${slug}${suffix}.webp`);
    if (!existsSync(sizedPath)) {
      await sharp(outPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(sizedPath);
    }
  }

  return `/products/${slug}.webp`;
}

function buildProduct(entry, imageUrl, sortOrder) {
  const publicUsd = penToUsd(entry.publicPen);
  const roleUsd = penToUsd(entry.techPen);
  const id = entry.slug;

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name: entry.name }),
      code: entry.code,
      name: entry.name,
      description: [
        entry.description,
        '',
        `Público: S/ ${entry.publicPen} · Técnico/Distribuidor: S/ ${entry.techPen}`,
        entry.provider ? `Proveedor: ${entry.provider}` : null,
        entry.purchaseCost ? `Compra referencial: ${entry.purchaseCost}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      currency: 'USD',
      stock: 999,
      category: INVENTORY_CATEGORY,
      brand: entry.brand,
      image_url: imageUrl,
      gallery: [imageUrl],
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: roleUsd,
        distribuidor: roleUsd,
        mayorista: roleUsd,
      }),
      attributes: [
        { key: 'Subcategoría', value: 'Inteligencia Artificial' },
        ...(entry.provider ? [{ key: 'Proveedor', value: entry.provider }] : []),
      ],
    },
    undefined,
  );
}

function mergeByCode(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [String(product.code ?? '').trim().toUpperCase(), product]),
  );

  let created = 0;
  let updated = 0;

  for (const product of incoming) {
    const key = String(product.code ?? '').trim().toUpperCase();
    const prev = byCode.get(key);

    if (prev) {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            id: prev.id,
            slug: prev.slug ?? product.slug,
            sort_order: prev.sort_order ?? product.sort_order,
            stock: prev.stock,
            stock_by_warehouse: prev.stock_by_warehouse,
            gallery: product.gallery?.length ? product.gallery : prev.gallery,
            image_url: product.image_url || prev.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at,
          },
          prev,
        ),
      );
      updated += 1;
    } else {
      byCode.set(key, product);
      created += 1;
    }
  }

  return { products: [...byCode.values()], created, updated };
}

async function main() {
  await ensureIaSubcategory();

  const inventory = await readInventory();
  const baseSort =
    Math.max(0, ...inventory.products.map((product) => Number(product.sort_order) || 0)) + 1;

  const incoming = [];
  for (let index = 0; index < PRODUCTS.length; index += 1) {
    const entry = PRODUCTS[index];
    const imageUrl = await ensureProductImage(entry.slug);
    incoming.push(buildProduct(entry, imageUrl, baseSort + index));
  }

  const { products, created, updated } = mergeByCode(inventory.products, incoming);
  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Inteligencia Artificial: ${created} nuevos, ${updated} actualizados.`);
  for (const entry of PRODUCTS) {
    console.log(
      `  [${entry.code}] ${entry.name} — público S/ ${entry.publicPen} · técnico/distribuidor S/ ${entry.techPen}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
