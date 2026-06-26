import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

import {
  HAITECH_WATERMARK_PUBLIC_PATH,
  isProductImageWatermarkEnabled,
  PRODUCT_IMAGE_WATERMARK_COMPOSITE_OPACITY,
  shouldWatermarkProductImage,
} from '../../shared/product-image-watermark.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.join(__dirname, '../../public');
const WATERMARK_FILE = path.join(PUBLIC_ROOT, 'brand', 'haitech-watermark.png');
const WATERMARK_FALLBACK = path.join(PUBLIC_ROOT, 'logo.png');

const MIN_EDGE_FOR_WATERMARK = 120;
const WATERMARK_WIDTH_RATIO = 0.28;
const WATERMARK_MAX_WIDTH = 280;
const WATERMARK_MIN_WIDTH = 64;
const WATERMARK_PADDING_RATIO = 0.025;

async function withAlphaMultiplier(buffer, multiplier) {
  if (multiplier >= 1) return buffer;

  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8ClampedArray(data);
  for (let i = 3; i < pixels.length; i += 4) {
    pixels[i] = Math.round(pixels[i] * multiplier);
  }

  return sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** @type {Buffer | null} */
let cachedWatermark = null;

async function resolveWatermarkPath() {
  try {
    await fs.access(WATERMARK_FILE);
    return WATERMARK_FILE;
  } catch {
    try {
      await fs.access(WATERMARK_FALLBACK);
      return WATERMARK_FALLBACK;
    } catch {
      return null;
    }
  }
}

async function loadWatermarkBuffer() {
  if (cachedWatermark) return cachedWatermark;

  const watermarkPath = await resolveWatermarkPath();
  if (!watermarkPath) {
    throw new Error('No se encontró el logo HAITECH para la marca de agua.');
  }

  if (watermarkPath === WATERMARK_FILE) {
    cachedWatermark = await fs.readFile(WATERMARK_FILE);
    return cachedWatermark;
  }

  const { data, info } = await sharp(watermarkPath)
    .resize({ width: 480, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    if (brightness < 42) {
      pixels[i + 3] = 0;
      continue;
    }
    pixels[i + 3] = Math.round(pixels[i + 3] * 0.42);
  }

  cachedWatermark = await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  return cachedWatermark;
}

/**
 * @param {Buffer} imageBuffer
 * @param {{ sourceUrl?: string | null }} [options]
 * @returns {Promise<Buffer>}
 */
export async function applyHaitechWatermark(imageBuffer, options = {}) {
  if (!isProductImageWatermarkEnabled()) return imageBuffer;
  if (options.sourceUrl && !shouldWatermarkProductImage(options.sourceUrl)) {
    return imageBuffer;
  }

  const base = sharp(imageBuffer).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width < MIN_EDGE_FOR_WATERMARK || height < MIN_EDGE_FOR_WATERMARK) {
    return imageBuffer;
  }

  let watermarkBuffer;
  try {
    watermarkBuffer = await loadWatermarkBuffer();
  } catch (error) {
    console.warn('[image-watermark]', error?.message ?? error);
    return imageBuffer;
  }

  const targetWidth = Math.round(
    Math.min(
      Math.max(WATERMARK_MIN_WIDTH, width * WATERMARK_WIDTH_RATIO),
      WATERMARK_MAX_WIDTH,
    ),
  );

  const resizedWatermark = await withAlphaMultiplier(
    await sharp(watermarkBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .png()
      .toBuffer(),
    PRODUCT_IMAGE_WATERMARK_COMPOSITE_OPACITY,
  );

  const wmMeta = await sharp(resizedWatermark).metadata();
  const wmWidth = wmMeta.width ?? targetWidth;
  const wmHeight = wmMeta.height ?? Math.round(targetWidth * 0.35);
  const padding = Math.max(8, Math.round(Math.min(width, height) * WATERMARK_PADDING_RATIO));
  const left = Math.max(0, Math.round((width - wmWidth) / 2));
  const top = Math.max(0, Math.round((height - wmHeight) / 2));

  return base
    .composite([
      {
        input: resizedWatermark,
        left,
        top,
        blend: 'over',
      },
    ])
    .toBuffer();
}

export { HAITECH_WATERMARK_PUBLIC_PATH };
