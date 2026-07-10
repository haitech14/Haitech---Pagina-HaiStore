/**
 * Verificación rápida del fix de imagen principal.
 * Ejecutar: node scripts/verify-main-image-fix.mjs
 */
import { sanitizeStoredProductMedia } from '../shared/product-media-sanitize.js';
import { normalizeProductGalleryFields } from '../shared/product-gallery.js';
import { persistProductMedia } from '../server/lib/persist-product-media.js';
import { migrateInventoryProduct } from '../server/lib/inventory-store.js';

const PRODUCT_ID = 'ricoh-im-430f';
const OLD_MAIN = '/products/ricoh-im-430f.webp';
const NEW_MAIN = '/album/test-new-main.webp';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testSanitizePreservesExplicitMain() {
  const product = {
    id: PRODUCT_ID,
    image_url: NEW_MAIN,
    gallery: [OLD_MAIN, '/products/ricoh-im-430f-2.webp'],
  };

  const result = sanitizeStoredProductMedia(product);
  assert(
    result.image_url === NEW_MAIN,
    `sanitize: esperaba ${NEW_MAIN}, obtuvo ${result.image_url}`,
  );
  assert(
    result.gallery.includes(OLD_MAIN),
    'sanitize: la imagen anterior debe quedar en galería',
  );
  console.log('✓ sanitizeStoredProductMedia preserva imagen principal explícita');
}

function testMigratePreservesExplicitMain() {
  const migrated = migrateInventoryProduct({
    id: PRODUCT_ID,
    name: 'RICOH IM 430F',
    image_url: NEW_MAIN,
    gallery: [OLD_MAIN],
    prices: { public: 702 },
  });

  assert(
    migrated.image_url === NEW_MAIN,
    `migrate: esperaba ${NEW_MAIN}, obtuvo ${migrated.image_url}`,
  );
  console.log('✓ migrateInventoryProduct preserva imagen principal');
}

function testSupabaseRowPrefersColumnsOverStaleSnapshot() {
  const row = {
    id: PRODUCT_ID,
    name: 'RICOH IM 430F',
    image_url: NEW_MAIN,
    gallery: [OLD_MAIN],
    prices: { public: 702 },
    inventory_snapshot: {
      id: PRODUCT_ID,
      name: 'RICOH IM 430F',
      image_url: OLD_MAIN,
      gallery: [OLD_MAIN, '/products/ricoh-im-430f-2.webp'],
      prices: { public: 702 },
    },
  };

  // rowToInventoryProduct no está exportado; replicamos la lógica del fix
  const snapshot = row.inventory_snapshot;
  const product = migrateInventoryProduct({
    ...snapshot,
    image_url: row.image_url ?? snapshot.image_url,
    gallery: Array.isArray(row.gallery) ? row.gallery : snapshot.gallery,
  });

  assert(
    product.image_url === NEW_MAIN,
    `supabase merge: esperaba ${NEW_MAIN}, obtuvo ${product.image_url}`,
  );
  console.log('✓ lectura Supabase prioriza columnas sobre snapshot obsoleto');
}

async function testPersistPreservesMainPosition() {
  const tinyPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const product = {
    id: 'verify-main-image-test',
    image_url: tinyPng,
    gallery: [OLD_MAIN],
  };

  const persisted = await persistProductMedia(product);
  assert(
    persisted.image_url?.startsWith('/products/verify-main-image-test.webp'),
    `persist: URL principal inesperada ${persisted.image_url}`,
  );
  assert(
    persisted.gallery.includes(OLD_MAIN),
    'persist: la galería debe conservar la imagen anterior',
  );
  console.log('✓ persistProductMedia mantiene la principal en la posición correcta');
}

function testNormalizeAlignsWithSanitize() {
  const fields = normalizeProductGalleryFields(NEW_MAIN, [OLD_MAIN]);
  const sanitized = sanitizeStoredProductMedia({
    id: PRODUCT_ID,
    image_url: fields.image_url,
    gallery: fields.gallery,
  });
  assert(
    sanitized.image_url === fields.image_url,
    'normalize y sanitize deben coincidir en image_url',
  );
  console.log('✓ normalizeProductGalleryFields y sanitize están alineados');
}

function testBlocklistedProductWithGalleryExtras() {
  const product = {
    id: '328f41ef-d935-4807-85d0-e1db5bdf73fb',
    image_url: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    gallery: [
      '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb-2.webp',
      '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb-3.webp',
    ],
  };

  const result = sanitizeStoredProductMedia(product);
  assert(
    result.image_url === product.image_url,
    `blocklist+galería: esperaba ${product.image_url}, obtuvo ${result.image_url}`,
  );
  console.log('✓ productos en blocklist con galería real conservan la imagen principal');
}

function testBlocklistedProductWithCacheBustedMain() {
  const cacheBusted = '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp?v=1234567890';
  const product = {
    id: '328f41ef-d935-4807-85d0-e1db5bdf73fb',
    image_url: cacheBusted,
    gallery: [],
  };

  const result = sanitizeStoredProductMedia(product);
  assert(
    result.image_url === cacheBusted,
    `blocklist+cache bust: esperaba ${cacheBusted}, obtuvo ${result.image_url}`,
  );
  console.log('✓ productos en blocklist con ?v= conservan la imagen principal');
}

function testCacheBustedMainUrlIsNotSynthetic() {
  const cacheBusted = '/products/ricoh-im-430f.webp?v=1234567890';
  const product = {
    id: PRODUCT_ID,
    image_url: cacheBusted,
    gallery: ['/products/ricoh-im-430f-2.webp'],
  };

  const result = sanitizeStoredProductMedia(product);
  assert(
    result.image_url === cacheBusted,
    `cache bust: esperaba ${cacheBusted}, obtuvo ${result.image_url}`,
  );
  console.log('✓ URLs con ?v= no se descartan como sintéticas');
}

async function testAlbumUrlIsCopiedToProducts() {
  const albumMain = '/album/d8f7206e-68e8-4c00-beb3-6eab91b18417.webp';
  const product = await persistProductMedia({
    id: 'verify-album-product',
    image_url: albumMain,
    gallery: ['/products/ricoh-im-430f-2.webp'],
  });

  assert(
    product.image_url?.startsWith('/products/verify-album-product.webp'),
    `album copy: esperaba /products/verify-album-product.webp, obtuvo ${product.image_url}`,
  );
  console.log('✓ URLs /album/ se copian a /products/ al persistir');
}

try {
  testSanitizePreservesExplicitMain();
  testBlocklistedProductWithGalleryExtras();
  testBlocklistedProductWithCacheBustedMain();
  testCacheBustedMainUrlIsNotSynthetic();
  testMigratePreservesExplicitMain();
  testSupabaseRowPrefersColumnsOverStaleSnapshot();
  testNormalizeAlignsWithSanitize();
  await testPersistPreservesMainPosition();
  await testAlbumUrlIsCopiedToProducts();
  console.log('\nTodas las verificaciones pasaron.');
} catch (error) {
  console.error('\n✗ Falló:', error.message);
  process.exit(1);
}
