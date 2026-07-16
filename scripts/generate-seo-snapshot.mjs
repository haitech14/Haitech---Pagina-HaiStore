/**
 * Genera snapshots SEO fragmentados en public/catalog/seo-snapshot/ para el middleware.
 */
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory, toPublicProduct } from '../server/lib/inventory-store.js';
import { resolveSiteOrigin } from '../shared/site-origin.js';
import { deriveProductSlug, buildProductPath } from '../shared/product-slug.js';
import { collectCategoryTreeUrls } from '../shared/seo/category-tree-urls.js';
import {
  buildCategorySeoRecord,
  buildHomeSeoRecord,
  buildProductSeoRecord,
  buildStoreSeoRecord,
  buildStaticPageSeoRecord,
} from '../shared/seo/meta.js';
import {
  buildBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
  buildFaqPageJsonLd,
  buildHomeJsonLd,
  buildProductJsonLd,
  buildServiceJsonLd,
  buildStoreJsonLd,
  buildWebPageJsonLd,
} from '../shared/seo/json-ld.js';
import {
  buildSimpleProductBreadcrumbs,
  LANDING_CATEGORY_SEO,
} from '../shared/seo/landing-categories.js';
import {
  buildServiceSeoRecord,
  SERVICE_SEO_ROUTES,
} from '../shared/seo/service-routes.js';
import { isIndexableCatalogProduct } from '../shared/seo/indexable-product.js';
import {
  STATIC_SEO_ROUTES,
  buildStaticSeoRecord,
} from '../shared/seo/static-routes.js';
import { buildAbsoluteUrl } from '../shared/site-origin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../public/catalog/seo-snapshot');
const LEGACY_OUTPUT_PATH = path.join(__dirname, '../public/catalog/seo-snapshot.json');
const CATEGORY_TREE_PATH = path.join(__dirname, '../public/catalog/store-categories-tree.json');

const LANDING_BY_SLUG = Object.fromEntries(
  LANDING_CATEGORY_SEO.map((category) => [category.slug, category]),
);

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

function loadCategoryTreeUrls() {
  if (!existsSync(CATEGORY_TREE_PATH)) return [];
  try {
    const payload = JSON.parse(readFileSync(CATEGORY_TREE_PATH, 'utf8'));
    return collectCategoryTreeUrls(payload.tree ?? []);
  } catch {
    return [];
  }
}

async function writeJson(filePath, payload) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function pruneStaleProductSnapshots(productsDir, activeFileSlugs) {
  let entries;
  try {
    entries = await readdir(productsDir);
  } catch {
    return 0;
  }
  const keep = new Set(activeFileSlugs);
  let removed = 0;
  for (const name of entries) {
    if (!name.endsWith('.json')) continue;
    const slug = name.slice(0, -5);
    if (keep.has(slug)) continue;
    try {
      await unlink(path.join(productsDir, name));
      removed += 1;
    } catch {
      /* archivo bloqueado u omitido */
    }
  }
  return removed;
}

async function main() {
  const siteOrigin = resolveSiteOrigin(process.env);
  const inventoryPath = getInventoryPath();

  if (!existsSync(inventoryPath)) {
    console.warn(`[generate:seo-snapshot] Sin inventario en ${inventoryPath}; snapshot no actualizado.`);
    return;
  }

  const { products: rawProducts } = await readInventory();
  const products = rawProducts
    .map((product) => toPublicProduct(product, 'public'))
    .filter((product) => isIndexableCatalogProduct(product));

  const productsByLookup = {};
  const routes = {};
  const productsDir = path.join(OUTPUT_DIR, 'products');

  for (const product of products) {
    const slug = deriveProductSlug(product);
    const breadcrumbs = buildSimpleProductBreadcrumbs(product);
    const seo = buildProductSeoRecord(product, siteOrigin, breadcrumbs);
    const jsonLd = buildProductJsonLd(product, siteOrigin, breadcrumbs);
    const indexable = isIndexableCatalogProduct(product);
    const payload = {
      ...seo,
      jsonLd,
      robots: indexable ? 'index,follow' : 'noindex,follow',
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

    const encodedSlug = encodeURIComponent(slug);
    const legacyPrefixedPath = `/tienda/producto/${encodedSlug}`;
    routes[legacyPrefixedPath] = {
      type: 'product',
      file: fileSlug,
      redirectTo: canonicalPath,
    };

    const legacyId = String(product.id ?? '').trim();
    if (legacyId && legacyId.toLowerCase() !== slug.toLowerCase()) {
      const encodedId = encodeURIComponent(legacyId);
      routes[`/tienda/producto/${encodedId}`] = {
        type: 'product',
        file: fileSlug,
        redirectTo: canonicalPath,
      };
      if (isUuidSlug(legacyId)) {
        routes[`/tienda/${encodedId}`] = {
          type: 'product',
          file: fileSlug,
          redirectTo: canonicalPath,
        };
      }
    }
  }

  const activeFileSlugs = [...new Set(Object.values(productsByLookup))];
  const pruned = await pruneStaleProductSnapshots(productsDir, activeFileSlugs);

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
  }

  for (const entry of loadCategoryTreeUrls()) {
    const category = LANDING_BY_SLUG[entry.rootSlug];
    if (!category) continue;

    const record = buildCategorySeoRecord(category, siteOrigin, {
      subcategoryName: entry.subName,
      heroSubtitle: entry.tagline,
      canonicalPath: entry.pathname,
      subSlug: entry.subSlug || undefined,
    });

    const breadcrumbs = [
      { label: 'Inicio', href: '/' },
      { label: category.name, href: `/categoria/${category.slug}` },
    ];
    if (entry.subSlug && entry.subSlug !== 'all') {
      breadcrumbs.push({ label: entry.subName, href: entry.pathname });
    }
    const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbs, siteOrigin);

    routes[entry.pathname] = {
      type: 'category',
      slug: category.slug,
      title: record.title,
      description: record.description,
      jsonLd: breadcrumbLd ? [breadcrumbLd] : undefined,
    };
  }

  for (const category of LANDING_CATEGORY_SEO) {
    routes[`/categoria/${category.slug}`] = { type: 'category', slug: category.slug };
  }

  const servicesByPath = {};
  for (const route of SERVICE_SEO_ROUTES) {
    const record = buildServiceSeoRecord(route, siteOrigin, buildAbsoluteUrl);
    const jsonLd = buildServiceJsonLd(route, siteOrigin);
    servicesByPath[route.pathname] = {
      ...record,
      jsonLd,
      robots: 'index,follow',
    };
    routes[route.pathname] = { type: 'service', pathname: route.pathname };
  }

  const homeRecord = buildHomeSeoRecord(siteOrigin);
  const home = {
    ...homeRecord,
    jsonLd: buildHomeJsonLd(siteOrigin),
    robots: 'index,follow',
  };
  routes['/'] = { type: 'home' };

  const storeRecord = buildStoreSeoRecord(siteOrigin);
  const store = {
    ...storeRecord,
    jsonLd: buildStoreJsonLd(siteOrigin),
    robots: 'index,follow',
  };
  routes['/tienda'] = { type: 'store' };

  const pagesByPath = {};
  for (const route of STATIC_SEO_ROUTES) {
    const record = buildStaticSeoRecord(route, siteOrigin, buildAbsoluteUrl);
    const jsonLd =
      route.jsonLdKind === 'faq'
        ? buildFaqPageJsonLd()
        : buildWebPageJsonLd(
            {
              pathname: route.pathname,
              pageName: route.pageName,
              description: route.description,
            },
            siteOrigin,
          );
    pagesByPath[route.pathname] = {
      ...buildStaticPageSeoRecord(route.pathname, route.title, route.description, siteOrigin),
      ...record,
      jsonLd,
      robots: 'index,follow',
    };
    routes[route.pathname] = { type: 'page', pathname: route.pathname };
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
    services: Object.keys(servicesByPath),
    pages: Object.keys(pagesByPath),
  };

  await writeJson(path.join(OUTPUT_DIR, 'home.json'), home);
  await writeJson(path.join(OUTPUT_DIR, 'store.json'), store);
  await writeJson(path.join(OUTPUT_DIR, 'categories.json'), categoriesBySlug);
  await writeJson(path.join(OUTPUT_DIR, 'services.json'), servicesByPath);
  await writeJson(path.join(OUTPUT_DIR, 'pages.json'), pagesByPath);
  await writeJson(path.join(OUTPUT_DIR, 'routes.json'), routes);
  await writeJson(path.join(OUTPUT_DIR, 'products-index.json'), productsByLookup);
  await writeJson(path.join(OUTPUT_DIR, 'manifest.json'), manifest);
  await writeJson(LEGACY_OUTPUT_PATH, manifest);

  console.log(`✓ SEO snapshot fragmentado en ${OUTPUT_DIR}`);
  console.log(
    `  Productos: ${products.length} · Categorías: ${LANDING_CATEGORY_SEO.length} · Servicios: ${SERVICE_SEO_ROUTES.length} · Páginas: ${STATIC_SEO_ROUTES.length}${pruned > 0 ? ` · Obsoletos eliminados: ${pruned}` : ''}`,
  );
}

main().catch((error) => {
  console.warn('[generate:seo-snapshot] omitido:', error instanceof Error ? error.message : error);
  process.exit(0);
});
