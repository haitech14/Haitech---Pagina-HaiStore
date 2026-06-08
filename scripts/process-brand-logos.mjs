import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'brands');

/**
 * Convierte logos de color a blanco sobre fondo transparente (estilo fila de marcas).
 * @param {string} input
 * @param {string} output
 * @param {{ darkBackground?: boolean }} [options]
 */
async function processBrandLogo(input, output, options = {}) {
  const { darkBackground = false } = options;
  const { data, info } = await sharp(input)
    .resize({ width: 320, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const brightness = (r + g + b) / 3;

    if (darkBackground) {
      if (brightness < 48) {
        pixels[i + 3] = 0;
      } else {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
      continue;
    }

    if (brightness > 232) {
      pixels[i + 3] = 0;
      continue;
    }

    const alpha = Math.min(255, Math.round(120 + (255 - brightness) * 1.1));
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = alpha;
  }

  mkdirSync(dirname(output), { recursive: true });
  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(output);
}

const assetsDir =
  'C:/Users/nicol/.cursor/projects/c-Users-nicol-HaiStore/assets';

const jobs = [
  {
    input: join(assetsDir, 'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_images__1_-2d00998f-f1da-46b4-a1f7-8ffc25cfeb94.png'),
    output: join(outDir, 'ramko.png'),
  },
  {
    input: join(assetsDir, 'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_topjet-c03b1148-616d-4fae-a1ce-883ed0ce2090.png'),
    output: join(outDir, 'topjet.png'),
  },
  {
    input: join(assetsDir, 'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_DENSITONE-PREMIUM-79a457c4-e11c-442c-a469-169ac1d1e3a7.png'),
    output: join(outDir, 'densitone.png'),
    darkBackground: true,
  },
  {
    input: join(assetsDir, 'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_images__2_-19a60a15-09bd-4b17-98e4-735473ebdb79.png'),
    output: join(outDir, 'intercopy.png'),
  },
  {
    input: join(assetsDir, 'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Katun_logo-f32a7eb7-d51f-42be-a4e7-42ee139bdb46.png'),
    output: join(outDir, 'katun.png'),
  },
];

for (const job of jobs) {
  await processBrandLogo(job.input, job.output, { darkBackground: job.darkBackground });
  console.log(`OK ${job.output}`);
}
