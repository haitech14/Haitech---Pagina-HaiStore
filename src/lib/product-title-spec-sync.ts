import {
  inferFormatoPapelFromModel,
  isDualFormatA4PrimaryProduct,
} from '@/lib/category-catalog-filters';
import {
  inferMonthlyProductionLabelFromRicohModelName,
  inferPpmLabelFromRicohModelName,
  inferRicohModelNumberBlock,
  isRicohImMpCatalogEquipment,
} from '@/lib/ricoh-model-ppm';
import type { ProductSpecRow } from '@/types/product-detail';
import type { Product } from '@/types/product';

export type TitlePredominantColor = 'Color' | 'B/N';

export interface TitlePredominantPrinterFields {
  active: boolean;
  title: string;
  speed: string | null;
  volume: string | null;
  color: TitlePredominantColor;
  format: string | null;
}

/** Color inferido solo del título (sin atributos almacenados). */
export function inferColorFromProductTitle(title: string): TitlePredominantColor {
  const haystack = title.toLowerCase();
  if (
    /\bcolor\b|a color|\bc\d{3,4}\b|\bim\s*c\b|\bimp\s*c\b|\bmp\s*c\b|\bpro\s*c\b/i.test(
      haystack,
    )
  ) {
    return 'Color';
  }
  if (/\bb\/n\b|blanco\s*\/\s*negro|monocrom/i.test(haystack)) {
    return 'B/N';
  }
  return 'B/N';
}

/** Campos técnicos derivados del título; predominan sobre atributos almacenados. */
export function resolveTitlePredominantPrinterFields(
  product: Product,
): TitlePredominantPrinterFields {
  const title = product.name?.trim() ?? '';
  const fromRicohModel =
    inferRicohModelNumberBlock(title) != null || isRicohImMpCatalogEquipment(product);

  if (!fromRicohModel) {
    return {
      active: false,
      title,
      speed: null,
      volume: null,
      color: inferColorFromProductTitle(title),
      format: inferFormatoPapelFromModel({ name: title, category: product.category }),
    };
  }

  return {
    active: true,
    title,
    speed: inferPpmLabelFromRicohModelName(title),
    volume: inferMonthlyProductionLabelFromRicohModelName(title),
    color: inferColorFromProductTitle(title),
    format: isDualFormatA4PrimaryProduct(product)
      ? 'A4'
      : inferFormatoPapelFromModel({ name: title, category: product.category }),
  };
}

function patchSpecRow(
  specs: ProductSpecRow[],
  label: string,
  value: string,
): ProductSpecRow[] {
  const index = specs.findIndex((row) => row.label === label);
  if (index === -1) return [...specs, { label, value }];
  return specs.map((row, rowIndex) => (rowIndex === index ? { ...row, value } : row));
}

/** Alinea filas de especificaciones con el título del producto. */
export function applyTitlePredominanceToSpecs(
  product: Product,
  specs: ProductSpecRow[],
): ProductSpecRow[] {
  const titleSync = resolveTitlePredominantPrinterFields(product);
  let next = specs.map((row) =>
    row.label === 'Modelo' ? { ...row, value: titleSync.title || row.value } : row,
  );

  if (!titleSync.active) return next;

  if (titleSync.speed) {
    next = patchSpecRow(next, 'Velocidad', titleSync.speed);
  }
  if (titleSync.volume) {
    next = patchSpecRow(next, 'Volumen mensual recomendado', titleSync.volume);
  }
  if (titleSync.format) {
    next = patchSpecRow(next, 'Formatos', titleSync.format);
    next = patchSpecRow(next, 'Formato', titleSync.format);
  }

  next = patchSpecRow(
    next,
    'Tipo',
    titleSync.color === 'Color' ? 'Color' : 'Monocromática',
  );

  return next;
}

export function shouldPreferTitleSyncedHeroBullets(product: Product): boolean {
  return resolveTitlePredominantPrinterFields(product).active;
}
