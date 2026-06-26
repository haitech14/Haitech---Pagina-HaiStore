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
  tagline: 'Soluciones de gestión documental y seguridad',
  image: '/categories/soluciones-negocio.png',
  inventoryLabels: ['Software'],
};

const ANTIVIRUS_SUBCATEGORY = {
  id: 'cat-software-antivirus',
  name: 'Antivirus',
  slug: 'antivirus',
  inventoryLabels: [
    'Antivirus',
    landingInventoryCategory('Software', 'Antivirus'),
  ],
};

const PRODUCT = {
  code: 'ESET-NOD32-12M',
  name: 'Licencia Original ESET NOD32 12 Meses',
  brand: 'ESET',
  publicPen: 120,
  rolePen: 90,
  description:
    'Licencia original ESET NOD32 por 12 meses. Protección antivirus y antiespía para 1 dispositivo en Windows y Mac.',
  category: landingInventoryCategory('Software', 'Antivirus'),
};

async function ensureSoftwareCategories() {
  let categories = await readStoreCategories();
  let parent = categories.find((row) => row.id === PARENT_CATEGORY.id);

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
    parent = categories.find((row) => row.id === PARENT_CATEGORY.id) ?? parent;
  } else {
    const labels = new Set([...(parent.inventoryLabels ?? []), ...PARENT_CATEGORY.inventoryLabels]);
    await updateStoreCategory(parent.id, {
      inventoryLabels: [...labels],
      image: parent.image ?? PARENT_CATEGORY.image,
      tagline: parent.tagline ?? PARENT_CATEGORY.tagline,
    });
  }

  const existingChild = categories.find((row) => row.id === ANTIVIRUS_SUBCATEGORY.id);
  if (existingChild) {
    const labels = new Set([
      ...(existingChild.inventoryLabels ?? []),
      ...ANTIVIRUS_SUBCATEGORY.inventoryLabels,
    ]);
    await updateStoreCategory(existingChild.id, {
      name: ANTIVIRUS_SUBCATEGORY.name,
      slug: ANTIVIRUS_SUBCATEGORY.slug,
      parentId: parent.id,
      inventoryLabels: [...labels],
    });
    return;
  }

  const duplicateSlug = categories.find((row) => row.slug === ANTIVIRUS_SUBCATEGORY.slug);
  if (duplicateSlug) {
    const labels = new Set([
      ...(duplicateSlug.inventoryLabels ?? []),
      ...ANTIVIRUS_SUBCATEGORY.inventoryLabels,
    ]);
    await updateStoreCategory(duplicateSlug.id, {
      parentId: parent.id,
      inventoryLabels: [...labels],
    });
    return;
  }

  await createStoreCategory({
    name: ANTIVIRUS_SUBCATEGORY.name,
    slug: ANTIVIRUS_SUBCATEGORY.slug,
    parentId: parent.id,
    sortOrder: 0,
    inventoryLabels: ANTIVIRUS_SUBCATEGORY.inventoryLabels,
  });
}

async function ensureProductImage(productId) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const base = productId;
  const outPath = join(PRODUCTS_DIR, `${base}.webp`);
  const source = join(ROOT, 'public', 'categories', 'soluciones-negocio.png');

  if (!existsSync(outPath)) {
    if (existsSync(source)) {
      await sharp(source)
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
    const sizedPath = join(PRODUCTS_DIR, `${base}${suffix}.webp`);
    if (!existsSync(sizedPath)) {
      await sharp(outPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(sizedPath);
    }
  }

  return `/products/${base}.webp`;
}

function buildProduct(imageUrl, sortOrder) {
  const publicUsd = penToUsd(PRODUCT.publicPen);
  const roleUsd = penToUsd(PRODUCT.rolePen);
  const id = 'eset-nod32-licencia-12-meses';

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name: PRODUCT.name }),
      code: PRODUCT.code,
      name: PRODUCT.name,
      description: [
        PRODUCT.description,
        '',
        'ESET NOD32:',
        '1. Antivirus y antiespía',
        '2. Detección de páginas fraudulentas',
        '3. Modo de juego',
        '4. Bloqueo de exploits',
        '5. Análisis potenciado en la nube',
        '6. Bajo consumo de recursos',
        '7. Protección de banca y pagos por Internet',
        '',
        'Términos:',
        '• La licencia es válida solo para 1 dispositivo.',
        '• Es reinstalable previa coordinación en el plazo que está en plataforma la licencia (90 días).',
        '• La licencia dura 12 meses.',
        '• Nosotros administramos la licencia.',
        '• La garantía que brindamos es de 90 días.',
        '• Para Windows y Mac.',
        '• Facturación legal.',
      ].join('\n'),
      currency: 'USD',
      stock: 999,
      category: PRODUCT.category,
      brand: PRODUCT.brand,
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
        { key: 'Duración', value: '12 meses' },
        { key: 'Dispositivos', value: '1' },
        { key: 'Plataformas', value: 'Windows y Mac' },
      ],
    },
    undefined,
  );
}

async function main() {
  await ensureSoftwareCategories();

  const imageUrl = await ensureProductImage('eset-nod32-licencia-12-meses');
  const inventory = await readInventory();
  const product = buildProduct(imageUrl, inventory.products.length);

  const codeKey = PRODUCT.code.trim().toUpperCase();
  const existingIndex = inventory.products.findIndex(
    (row) => String(row.code ?? '').trim().toUpperCase() === codeKey,
  );

  const products =
    existingIndex >= 0
      ? inventory.products.map((row, index) => (index === existingIndex ? { ...row, ...product } : row))
      : [...inventory.products, product];

  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(
    existingIndex >= 0
      ? `✓ Producto actualizado: ${PRODUCT.name}`
      : `✓ Producto creado: ${PRODUCT.name}`,
  );
  console.log(`  Categoría: ${PRODUCT.category}`);
  console.log(`  Público: S/ ${PRODUCT.publicPen} · Técnico/Distribuidor: S/ ${PRODUCT.rolePen}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
