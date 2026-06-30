/**
 * Genera variantes WebP optimizadas para assets estáticos de la home.
 * Uso: node scripts/optimize-public-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.join(process.cwd(), 'public');

/** @param {string} filePath */
function kb(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return Math.round((fs.statSync(filePath).size / 1024) * 10) / 10;
}

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} width
 * @param {{ quality?: number }} [options]
 */
async function writeWebp(inputPath, outputPath, width, options = {}) {
  const { quality = 82 } = options;
  await sharp(inputPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
}

/**
 * @param {string} inputPath
 * @param {Array<{ suffix: string; width: number }>} variants
 */
async function generateVariants(inputPath, variants) {
  if (!fs.existsSync(inputPath)) {
    console.warn(`  ⚠ No encontrado: ${inputPath}`);
    return;
  }

  const parsed = path.parse(inputPath);
  const baseOut = path.join(parsed.dir, parsed.name);

  for (const { suffix, width } of variants) {
    const out = `${baseOut}${suffix}.webp`;
    await writeWebp(inputPath, out, width);
    console.log(`  ✓ ${path.relative(PUBLIC, out)} (${kb(out)} KB)`);
  }
}

async function optimizeHero() {
  console.log('\n— Hero banner —');
  const heroFiles = ['fiestaspatriasbanner.png', 'promonuevas-1.png'];

  for (const file of heroFiles) {
    const hero = path.join(PUBLIC, 'categories', file);
    if (!fs.existsSync(hero)) {
      console.warn(`  ⚠ No encontrado: ${file}`);
      continue;
    }

    const optimizedPng = `${hero}.optimized.tmp`;
    await sharp(hero)
      .rotate()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(optimizedPng);
    const before = kb(hero);
    fs.renameSync(optimizedPng, hero);
    console.log(`  ✓ ${file} optimizado (${before} KB → ${kb(hero)} KB)`);

    await generateVariants(hero, [
      { suffix: '-768', width: 768 },
      { suffix: '-1280', width: 1280 },
      { suffix: '-1920', width: 1920 },
    ]);
  }
}

async function optimizeCategories() {
  console.log('\n— Categorías —');
  const dir = path.join(PUBLIC, 'categories');
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png') && !f.includes('banner') && f !== 'DiadelPadre.png');
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [
      { suffix: '-256', width: 256 },
      { suffix: '-512', width: 512 },
    ]);
  }
}

async function optimizeClients() {
  console.log('\n— Logos clientes —');
  const dir = path.join(PUBLIC, 'clients');
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png') && f.startsWith('client-'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-200', width: 200 }]);
  }
}

async function optimizeRecommendations() {
  console.log('\n— Testimonios —');
  const dir = path.join(PUBLIC, 'clients', 'recommendations');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-400', width: 400 }]);
  }
}

async function optimizeBrands() {
  console.log('\n— Marcas —');
  const dir = path.join(PUBLIC, 'brands');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-160', width: 160 }]);
  }
}

async function optimizeProductImages() {
  console.log('\n— Productos —');
  const dir = path.join(PUBLIC, 'products');
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/-\d+\.webp$/i.test(f));

  for (const file of files) {
    const inputPath = path.join(dir, file);
    const parsed = path.parse(inputPath);
    const needs256 = !fs.existsSync(`${parsed.dir}/${parsed.name}-256.webp`);
    const needs512 = !fs.existsSync(`${parsed.dir}/${parsed.name}-512.webp`);
    const needs1024 = !fs.existsSync(`${parsed.dir}/${parsed.name}-1024.webp`);
    if (!needs256 && !needs512 && !needs1024) continue;

    console.log(`  ${file}`);
    const variants = [];
    if (needs256) variants.push({ suffix: '-256', width: 256 });
    if (needs512) variants.push({ suffix: '-512', width: 512 });
    if (needs1024) variants.push({ suffix: '-1024', width: 1024 });
    await generateVariants(inputPath, variants);
  }
}

async function optimizePromoCards() {
  console.log('\n— Promo cards —');
  const dir = path.join(PUBLIC, 'promo-cards');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/-\d+\.webp$/i.test(f));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [
      { suffix: '-256', width: 256 },
      { suffix: '-512', width: 512 },
    ]);
  }
}

console.log('Optimizando imágenes públicas…');
await optimizeHero();
await optimizeCategories();
await optimizeClients();
await optimizeRecommendations();
await optimizeBrands();
await optimizePromoCards();
await optimizeProductImages();
console.log('\nListo.');
