/**
 * Genera public/catalog/seo-snapshot.json para middleware y prerender SEO.
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
const OUTPUT_PATH = path.join(__dirname, '../public/catalog/seo-snapshot.json');

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

    const keys = new Set(
      [String(product.id ?? '').toLowerCase(), slug.toLowerCase(), String(product.slug ?? '').trim().toLowerCase()].filter(
        Boolean,
      ),
    );

    for (const key of keys) {
      productsByLookup[key] = payload;
    }

    const canonicalPath = buildProductPath(product);
    routes[canonicalPath] = payload;

    const legacyId = String(product.id ?? '').trim();
    if (legacyId && legacyId !== slug && isUuidSlug(legacyId)) {
      const legacyPath = `/tienda/producto/${encodeURIComponent(legacyId)}`;
      routes[legacyPath] = {
        ...payload,
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
    routes[`/categoria/${category.slug}`] = categoryPayload;

    const subPaths = CATEGORY_SUB_PATHS[category.slug];
    if (subPaths) {
      for (const sub of subPaths) {
        const pathKey = `/categoria/${category.slug}?${sub.query}`;
        routes[pathKey] = {
          ...categoryPayload,
          title: `${category.name} ${sub.label} | Comprar en Perú | Haitech`,
        };
      }
    } else if (category.slug === 'multifuncionales') {
      routes[`/categoria/${category.slug}?sub=all`] = categoryPayload;
    }
  }

  const homeRecord = buildHomeSeoRecord(siteOrigin);
  const home = {
    ...homeRecord,
    jsonLd: buildHomeJsonLd(siteOrigin),
    robots: 'index,follow',
  };
  routes['/'] = home;

  if (categoriesBySlug.multifuncionales) {
    routes['/tienda'] = {
      ...categoriesBySlug.multifuncionales,
    };
  }

  routes['/categoria/toner-compatibles'] = {
    redirectTo: '/categoria/toner-suministros',
  };

  const snapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    siteOrigin,
    home,
    categories: categoriesBySlug,
    productsByLookup,
    routes,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot)}\n`, 'utf8');
  console.log(`✓ SEO snapshot escrito en ${OUTPUT_PATH}`);
  console.log(`  Productos: ${products.length} · Categorías: ${LANDING_CATEGORY_SEO.length}`);
}

main().catch((error) => {
  console.warn('[generate:seo-snapshot] omitido:', error instanceof Error ? error.message : error);
  process.exit(0);
});
