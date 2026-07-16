import { inventoryCategoryParentLabel } from '@/lib/inventory-stock-status';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import {
  isImpresoraOrMultifuncionalCategory,
  usdToPenCharm,
} from '@/lib/pen-pricing';
import { resolveProductCardEstadoLabel } from '@/lib/product-card-condition';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { ensureFullPrices } from '@/lib/pricing';
import { imageBasePath } from '@/lib/responsive-image';
import type { InventoryProduct } from '@/types/product';

const THUMB_PX = 72;
const IMAGE_COL_WIDTH = 12;
const HEADER_ROW = 1;
const COLUMN_ROW = 2;
const DATA_START_ROW = 3;

const COLUMNS = [
  { key: 'image', header: 'Imagen', width: IMAGE_COL_WIDTH },
  { key: 'category', header: 'Categoría', width: 28 },
  { key: 'code', header: 'Código', width: 16 },
  { key: 'name', header: 'Producto', width: 42 },
  { key: 'brand', header: 'Marca', width: 14 },
  { key: 'condition', header: 'Condición', width: 14 },
  { key: 'publicUsd', header: 'Público USD', width: 12 },
  { key: 'publicPen', header: 'Público S/', width: 12 },
  { key: 'tecnicoUsd', header: 'Técnico USD', width: 12 },
  { key: 'tecnicoPen', header: 'Técnico S/', width: 12 },
  { key: 'mayoristaUsd', header: 'Mayorista USD', width: 13 },
  { key: 'mayoristaPen', header: 'Mayorista S/', width: 13 },
  { key: 'stock', header: 'Stock', width: 10 },
] as const;

function absoluteImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(url, window.location.origin).href;
  }
  return url;
}

/** Prefer local -256.webp thumbnails when available. */
function resolveThumbnailCandidateUrls(product: InventoryProduct): string[] {
  const primary = resolveProductImageUrl(product) ?? product.image_url?.trim() ?? '';
  if (!primary) return [];

  const path = primary.split('?')[0]?.split('#')[0] ?? primary;
  const query = primary.includes('?') ? primary.slice(primary.indexOf('?')) : '';
  const urls: string[] = [];

  if (path.startsWith('/products/') && !/-(?:256|512|1024)\.webp$/i.test(path)) {
    const base = imageBasePath(path);
    urls.push(`${base}-256.webp${query}`);
  }

  urls.push(primary);
  return [...new Set(urls.map(absoluteImageUrl))];
}

async function fetchImageAsPngBuffer(urls: string[]): Promise<Uint8Array | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) continue;
      const blob = await response.blob();
      if (blob.size === 0) continue;

      if (typeof createImageBitmap === 'function' && typeof document !== 'undefined') {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        const size = THUMB_PX;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          bitmap.close();
          continue;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        const scale = Math.min(size / bitmap.width, size / bitmap.height);
        const drawW = bitmap.width * scale;
        const drawH = bitmap.height * scale;
        ctx.drawImage(bitmap, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);
        bitmap.close();

        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((result) => resolve(result), 'image/png');
        });
        if (!pngBlob) continue;
        return new Uint8Array(await pngBlob.arrayBuffer());
      }

      return new Uint8Array(await blob.arrayBuffer());
    } catch {
      // try next candidate
    }
  }
  return null;
}

function commercialPen(usd: number, category: string | null | undefined, rate: number): number {
  const pen = usdToPenCharm(usd, rate);
  if (pen <= 0) return 0;
  if (isImpresoraOrMultifuncionalCategory(category)) return Math.round(pen);
  return Math.round(pen * 100) / 100;
}

function sortProductsByCategory(products: InventoryProduct[]): InventoryProduct[] {
  return products.slice().sort((a, b) => {
    const catA = inventoryCategoryParentLabel(a.category);
    const catB = inventoryCategoryParentLabel(b.category);
    const parentDiff = catA.localeCompare(catB, 'es', { sensitivity: 'base' });
    if (parentDiff !== 0) return parentDiff;

    const fullA = (a.category ?? '').trim();
    const fullB = (b.category ?? '').trim();
    const fullDiff = fullA.localeCompare(fullB, 'es', { sensitivity: 'base' });
    if (fullDiff !== 0) return fullDiff;

    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

function triggerDownload(data: ArrayBuffer, filename: string): void {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toArrayBuffer(raw: ArrayBuffer | Uint8Array | ArrayBufferView): ArrayBuffer {
  if (raw instanceof ArrayBuffer) return raw;
  if (ArrayBuffer.isView(raw)) {
    return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
  }
  return new Uint8Array(raw as ArrayLike<number>).buffer as ArrayBuffer;
}

/**
 * Genera y descarga un Excel comercial «LISTA DE PRECIOS»
 * con miniaturas, precios de venta (USD + S/) y stock.
 */
export async function exportListaPreciosToExcel(
  products: InventoryProduct[],
  filenamePrefix = 'lista-de-precios',
): Promise<boolean> {
  if (products.length === 0) return false;

  const ExcelJS = (await import('exceljs')).default;
  const sorted = sortProductsByCategory(products);
  const rate = getUsdToPenSaleRate();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HaiStore';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Lista de Precios', {
    views: [{ state: 'frozen', ySplit: COLUMN_ROW }],
  });

  const lastCol = COLUMNS.length;
  sheet.mergeCells(HEADER_ROW, 1, HEADER_ROW, lastCol);
  const titleCell = sheet.getCell(HEADER_ROW, 1);
  titleCell.value = 'LISTA DE PRECIOS';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF111827' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(HEADER_ROW).height = 28;

  const headerRow = sheet.getRow(COLUMN_ROW);
  COLUMNS.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getColumn(index + 1).width = column.width;
  });
  headerRow.height = 22;

  for (let i = 0; i < sorted.length; i += 1) {
    const product = sorted[i]!;
    const rowIndex = DATA_START_ROW + i;
    const row = sheet.getRow(rowIndex);
    const prices = ensureFullPrices(product.prices);
    const category = product.category ?? '';
    const publicUsd = Number(prices.public) || 0;
    const tecnicoUsd = Number(prices.tecnico) || 0;
    const mayoristaUsd = Number(prices.mayorista) || 0;

    row.getCell(1).value = '';
    row.getCell(2).value = category.trim() || inventoryCategoryParentLabel(category);
    row.getCell(3).value = product.code?.trim() || product.id;
    row.getCell(4).value = product.name;
    row.getCell(5).value = product.brand?.trim() || '';
    row.getCell(6).value = resolveProductCardEstadoLabel(product) ?? '';
    row.getCell(7).value = publicUsd > 0 ? publicUsd : '';
    row.getCell(8).value = publicUsd > 0 ? commercialPen(publicUsd, category, rate) : '';
    row.getCell(9).value = tecnicoUsd > 0 ? tecnicoUsd : '';
    row.getCell(10).value = tecnicoUsd > 0 ? commercialPen(tecnicoUsd, category, rate) : '';
    row.getCell(11).value = mayoristaUsd > 0 ? mayoristaUsd : '';
    row.getCell(12).value = mayoristaUsd > 0 ? commercialPen(mayoristaUsd, category, rate) : '';
    row.getCell(13).value = Number(product.stock) || 0;

    for (const col of [7, 8, 9, 10, 11, 12]) {
      row.getCell(col).numFmt = '#,##0.00';
      row.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' };
    }
    row.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };
    for (const col of [2, 3, 4, 5, 6]) {
      row.getCell(col).alignment = { vertical: 'middle', wrapText: col === 4 };
    }

    row.height = THUMB_PX + 6;

    const imageBuffer = await fetchImageAsPngBuffer(resolveThumbnailCandidateUrls(product));
    if (imageBuffer) {
      const imageId = workbook.addImage({
        // ExcelJS tipa `buffer` como Node Buffer; en el navegador usamos Uint8Array.
        buffer: imageBuffer as never,
        extension: 'png',
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: rowIndex - 1 },
        ext: { width: THUMB_PX, height: THUMB_PX },
        editAs: 'oneCell',
      });
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const raw = await workbook.xlsx.writeBuffer();
  triggerDownload(toArrayBuffer(raw as ArrayBuffer | Uint8Array), `${filenamePrefix}-${date}.xlsx`);
  return true;
}
