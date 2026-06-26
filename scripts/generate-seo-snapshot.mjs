/**
 * Genera snapshots SEO fragmentados en public/catalog/seo-snapshot/ para el middleware.
 */
import 'dotenv/config';
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory, toPublicProduct } from '../server/lib/inventory-store.js';
import { resolveSiteOrigin } from '../shared/site-origin.js';
import { deriveProductSlug, buildProductPath } from '../shared/product-slug.js';
import {
  buildCategorySeoRecord,
  buildHomeSeoRecord,
  buildProductSeoRecord,
} from '../shared/seo/meta.js';
import {
  buildCategoryCollectionJsonLd,
  buildHomeJsonLd,
  buildProductJsonLd,
} from '../shared/seo/json-ld.js';
import {
  buildSimpleProductBreadcrumbs,
  LANDING_CATEGORY_SEO,
} from '../shared/seo/landing-categories.js';
import { buildAbsoluteUrl } from '../shared/site-origin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../public/catalog/seo-snapshot');
const LEGACY_OUTPUT_PATH = path.join(__dirname, '../public/catalog/seo-snapshot.json');

const CATEGORY_SUB_PATHS = {
  multifuncionales: [
    { query: 'sub=all', label: 'Todas' },
    { query: 'sub=nuevas', label: 'Nuevas' },
    { query: 'sub=seminuevas', label: 'Seminuevas' },
    { query: 'sub=remanufacturadas', label: 'Remanufacturadas' },
  ],
  impresoras: [
    { query: 'sub=all', label: 'Todas' },
    { query: 'sub=nuevas', label: 'Nuevas' },
    { query: 'sub=seminuevas', label: 'Seminuevas' },
  ],
  'toner-suministros': [
    { query: 'sub=toner-originales', label: 'Toner Original' },
    { query: 'sub=toner-remanufacturado', label: 'Toner Remanufacturado' },
    { query: 'sub=toner-recarga', label: 'Recarga' },
  ],
};

function isUuidSlug(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value ?? '').trim(),
  );
}

function productMatchesCategory(product, categorySlug) {
  const category = String(product.category ?? '').toLowerCase();
  const name = String(product.name ?? '').toLowerCase();
  if (categorySlug === 'multifuncionales') {
    return category.includes('multifuncional') || name.includes('multifuncional');
  }
  if (categorySlug === 'impresoras') {
    return category.includes('impresora') && !category.includes('multifuncional');
  }
  if (categorySlug === 'toner-suministros') {
    return /toner|tóner|suministro|cartucho/i.test(category);
  }
  if (categorySlug === 'repuestos') {
    return /repuesto|partes|unidad de imagen|drum|fuser/i.test(category);
  }
  return category.includes(categorySlug.replace(/-/g, ' '));
}

function topProductsForCategory(products, categorySlug, siteOrigin, limit = 10) {
  return products
    .filter((product) => productMatchesCategory(product, categorySlug))
    .slice(0, limit)
    .map((product) => ({
      name: product.name,
      url: buildAbsoluteUrl(buildProductPath(product), siteOrigin),
    }));
}

function safeProductFileSlug(slug) {
  return String(slug ?? 'product')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

async function writeJson(filePath, payload) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function main() {
  const siteOrigin = resolveSiteOrigin(process.env);
  const inventoryPath = getInventoryPath();

  if (!existsSync(inventoryPath)) {
    console.warn(`[generate:seo-snapshot] Sin inventario en ${inventoryPath}; snapshot no actualizado.`);
    return;
  }

  const { products: rawProducts } = await readInventory();
  const products = rawProducts.map((product) => toPublicProduct(product, 'public'));

  const productsByLookup = {};
  const routes = {};
  const productsDir = path.join(OUTPUT_DIR, 'products');

  for (const product of products) {
    const slug = deriveProductSlug(product);
    const breadcrumbs = buildSimpleProductBreadcrumbs(product);
    const seo = buildProductSeoRecord(product, siteOrigin, breadcrumbs);
    const jsonLd = buildProductJsonLd(product, siteOrigin, breadcrumbs);
    const payload = {
      ...seo,
      jsonLd,
      robots: 'index,follow',
    };

    const fileSlug = safeProductFileSlug(slug);
    await writeJson(path.join(productsDir, `${fileSlug}.json`), payload);

    const keys = new Set(
      [String(product.id ?? '').toLowerCase(), slug.toLowerCase(), String(product.slug ?? '').trim().toLowerCase()].filter(
        Boolean,
      ),
    );

    for (const key of keys) {
      productsByLookup[key] = fileSlug;
    }

    const canonicalPath = buildProductPath(product);
    routes[canonicalPath] = { type: 'product', file: fileSlug };

    const legacyId = String(product.id ?? '').trim();
    if (legacyId && legacyId !== slug && isUuidSlug(legacyId)) {
      const legacyPath = `/tienda/producto/${encodeURIComponent(legacyId)}`;
      routes[legacyPath] = {
        type: 'product',
        file: fileSlug,
        redirectTo: canonicalPath,
      };
    }
  }

  const categoriesBySlug = {};
  for (const category of LANDING_CATEGORY_SEO) {
    const record = buildCategorySeoRecord(category, siteOrigin);
    const topProducts = topProductsForCategory(products, category.slug, siteOrigin);
    const jsonLd = buildCategoryCollectionJsonLd(category, siteOrigin, topProducts);
    const categoryPayload = {
      ...record,
      jsonLd,
      robots: 'index,follow',
    };
    categoriesBySlug[category.slug] = categoryPayload;
    routes[`/categoria/${category.slug}`] = { type: 'category', slug: category.slug };

    const subPaths = CATEGORY_SUB_PATHS[category.slug];
    if (subPaths) {
      for (const sub of subPaths) {
        const pathKey = `/categoria/${category.slug}?${sub.query}`;
        routes[pathKey] = {
          type: 'category',
          slug: category.slug,
          title: `${category.name} ${sub.label} | Comprar en Perú | Haitech`,
        };
      }
    } else if (category.slug === 'multifuncionales') {
      routes[`/categoria/${category.slug}?sub=all`] = { type: 'category', slug: category.slug };
    }
  }

  const homeRecord = buildHomeSeoRecord(siteOrigin);
  const home = {
    ...homeRecord,
    jsonLd: buildHomeJsonLd(siteOrigin),
    robots: 'index,follow',
  };
  routes['/'] = { type: 'home' };

  if (categoriesBySlug.multifuncionales) {
    routes['/tienda'] = { type: 'category', slug: 'multifuncionales' };
  }

  routes['/categoria/toner-compatibles'] = {
    redirectTo: '/categoria/toner-suministros',
  };

  const manifest = {
    version: 2,
    generatedAt: new Date().toISOString(),
    siteOrigin,
    sharded: true,
    routes,
    productsByLookup,
    categories: Object.keys(categoriesBySlug),
  };

  await writeJson(path.join(OUTPUT_DIR, 'home.json'), home);
  await writeJson(path.join(OUTPUT_DIR, 'categories.json'), categoriesBySlug);
  await writeJson(path.join(OUTPUT_DIR, 'routes.json'), routes);
  await writeJson(path.join(OUTPUT_DIR, 'products-index.json'), productsByLookup);
  await writeJson(path.join(OUTPUT_DIR, 'manifest.json'), manifest);
  await writeJson(LEGACY_OUTPUT_PATH, manifest);

  console.log(`✓ SEO snapshot fragmentado en ${OUTPUT_DIR}`);
  console.log(`  Productos: ${products.length} · Categorías: ${LANDING_CATEGORY_SEO.length}`);
}

main().catch((error) => {
  console.warn('[generate:seo-snapshot] omitido:', error instanceof Error ? error.message : error);
  process.exit(0);
});
