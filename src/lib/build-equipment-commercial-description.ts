import { normalizeAttributes } from '@/lib/inventory-attributes';
import {
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import { isPrinterProduct } from '@/lib/product-detail-badges';
import {
  resolveProductEquipmentConditionLabel,
  resolveProductHeroConditionLabel,
  type ProductEquipmentConditionLabel,
} from '@/lib/product-hero-meta';
import { inferPpmLabelFromRicohModelName } from '@/lib/ricoh-model-ppm';
import type { Product } from '@/types/product';

export type EquipmentCommercialCondition = ProductEquipmentConditionLabel;

/** Serie Ricoh IM / IMC (p. ej. IM 430F, IM C3000). No incluye MP. */
export function isRicohImSeriesEquipment(product: Product): boolean {
  const haystack = `${product.name} ${product.code ?? ''} ${product.slug ?? ''}`;
  return /\bIM\s*C?\s*\d{3,4}/i.test(haystack) || /\bIMC\s*\d{3,4}/i.test(haystack);
}

function isColorPrinter(product: Product): boolean {
  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();
  const haystack = `${name} ${cat}`;
  if (/\bb\/n\b|\bmonocrom/i.test(haystack)) return false;
  return (
    haystack.includes('color') ||
    haystack.includes('a color') ||
    /\b(mp\s+)?c\d{3,4}\b/i.test(product.name) ||
    /\bim\s+c\d{3,4}/i.test(product.name) ||
    /\bbizhub\s+c/i.test(product.name)
  );
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttribute(product: Product, ...needles: string[]): string | null {
  const attributes = normalizeAttributes(product.attributes);
  for (const attr of attributes) {
    const key = normalizeKey(attr.name ?? '');
    if (!key) continue;
    if (needles.some((needle) => key.includes(normalizeKey(needle)))) {
      const value = attr.value?.trim();
      if (value) return value;
    }
  }
  return null;
}

function descriptionBlob(product: Product): string {
  return `${product.name}\n${product.description ?? ''}\n${product.category ?? ''}`;
}

function matchFirst(blob: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = blob.match(pattern);
    const value = match?.[1]?.trim() || match?.[0]?.trim();
    if (value) return value;
  }
  return null;
}

function resolveDisplayTitle(product: Product): string {
  const name = product.name?.trim() || 'Equipo multifuncional';
  return name.replace(/\s{2,}/g, ' ');
}

function resolveCondition(product: Product): EquipmentCommercialCondition {
  return resolveProductEquipmentConditionLabel(product) ?? 'Nueva';
}

function resolveConditionIntro(condition: EquipmentCommercialCondition): string {
  const functions =
    'Multifuncional profesional 4 en 1: impresión, copia, escaneo y fax.';
  if (condition === 'Seminueva') {
    return `Seminueva. ${functions}`;
  }
  if (condition === 'Remanufacturada') {
    return `Remanufacturada. ${functions}`;
  }
  return `Nueva sellada en caja. ${functions}`;
}

function resolveSpeedLine(product: Product): string {
  const fromAttr = findAttribute(product, 'velocidad', 'ppm');
  const fromDesc = matchFirst(descriptionBlob(product), [
    /velocidad\s*:?\s*([\d.,]+\s*ppm)/i,
    /\b([\d.,]+\s*ppm)\b/i,
  ]);
  const fromModel = inferPpmLabelFromRicohModelName(product.name);
  const speed = (fromAttr || fromDesc || fromModel || '40 ppm')
    .replace(/^hasta\s+/i, '')
    .trim();
  return `Velocidad: ${speed}.`;
}

function resolveScreenLine(product: Product): string {
  const fromAttr = findAttribute(product, 'pantalla', 'panel', 'display');
  const fromDesc = matchFirst(descriptionBlob(product), [
    /pantalla[^\n]*?(\d+(?:[.,]\d+)?\s*(?:"|pulgadas?))/i,
    /panel t[aá]ctil[^\n]*?(\d+(?:[.,]\d+)?\s*(?:"|pulgadas?))/i,
    /(\d+(?:[.,]\d+)?")\s*(?:tactil|táctil|smart)/i,
  ]);
  const raw = fromAttr || fromDesc || '10.1"';
  const inches =
    raw.match(/(\d+(?:[.,]\d+)?)\s*(?:"|pulgadas?)/i)?.[1]?.replace(',', '.') ?? '10.1';
  return `Pantalla táctil ${inches}".`;
}

function resolveFormatLine(product: Product): string {
  const fromAttr = findAttribute(product, 'formato');
  const fromDesc = matchFirst(descriptionBlob(product), [
    /formato\s*:?\s*([^\n.]+)/i,
    /\b(A3|A4)\b/,
  ]);
  const format = (fromAttr || fromDesc || 'A4').replace(/^formato\s*/i, '').trim();
  if (/a3/i.test(format)) {
    return 'Formato A3 dúplex automático.';
  }
  return 'Formato A4 dúplex automático.';
}

function resolveConnectivityLine(product: Product): string {
  const fromAttr = findAttribute(product, 'conectividad', 'conexion', 'conexión');
  const fromDesc = matchFirst(descriptionBlob(product), [
    /conectividad\s*:?\s*([^\n]+)/i,
  ]);
  const raw = (fromAttr || fromDesc || 'Wi-Fi, Ethernet y USB')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+y\s+/gi, ', ')
    .replace(/\bred\b/gi, 'Ethernet')
    .replace(/\blan\b/gi, 'Ethernet')
    .replace(/,\s*,/g, ',')
    .trim();
  const parts = raw
    .split(/,|·|\|/)
    .map((part) => part.trim().replace(/\.$/, ''))
    .filter(Boolean);
  const unique = [...new Set(parts)];
  if (unique.length === 0) return 'Conectividad: Wi-Fi, Ethernet y USB.';
  if (unique.length === 1) return `Conectividad: ${unique[0]}.`;
  if (unique.length === 2) return `Conectividad: ${unique[0]} y ${unique[1]}.`;
  return `Conectividad: ${unique.slice(0, -1).join(', ')} y ${unique[unique.length - 1]}.`;
}

function resolveAdfLine(product: Product): string {
  const fromAttr = findAttribute(product, 'adf', 'alimentador', 'spdf');
  const blob = `${fromAttr ?? ''}\n${descriptionBlob(product)}`;
  if (/est[aá]ndar|ardf/i.test(blob) && !/doble\s*scan|spdf/i.test(blob)) {
    return 'ADF Estándar.';
  }
  return 'ADF Doble Scan.';
}

function resolvePaperLine(product: Product): string {
  const blob = descriptionBlob(product);
  const cassette =
    matchFirst(blob, [
      /casetera[s]?\s*:?\s*([^\n.]+)/i,
      /(\d[\d.,]*)\s*hojas?\s*(?:\+|,|y)?\s*bypass/i,
    ]) || findAttribute(product, 'casetera', 'bandeja', 'capacidad');
  const bypass = matchFirst(blob, [/bypass\s*:?\s*([^\n.]+)/i, /bypass\s+(\d+\s*hojas?)/i]);

  if (cassette && /bypass/i.test(cassette)) {
    return `Casetera ${cassette.replace(/^casetera[s]?\s*/i, '').trim()}.`.replace(/\.\.$/, '.');
  }

  if (cassette || bypass) {
    const cassetteText = cassette
      ? cassette.replace(/^casetera[s]?\s*/i, '').trim()
      : isColorPrinter(product)
        ? '2×250 hojas'
        : '500 hojas';
    const bypassText = bypass
      ? bypass.replace(/^bypass\s*/i, '').trim()
      : isColorPrinter(product)
        ? '50 hojas'
        : '80 hojas';
    return `Casetera ${cassetteText} + bypass ${bypassText}.`;
  }

  if (isColorPrinter(product)) {
    return 'Casetera 2×250 hojas + bypass 50 hojas.';
  }
  return 'Casetera 500 hojas + bypass 80 hojas.';
}

function resolveTonerLine(
  product: Product,
  condition: EquipmentCommercialCondition,
): string {
  const blob = descriptionBlob(product);
  const yieldMatch = matchFirst(blob, [
    /t[oó]ner[^\n]*?(\d[\d.,]*)\s*(?:p[aá]g(?:inas)?|paginas)/i,
    /inicial[^\n]*?(\d[\d.,]*)\s*(?:p[aá]g(?:inas)?|paginas)/i,
    /\((\d[\d.,]*)\s*(?:p[aá]g(?:inas)?|paginas)\)/i,
  ]);
  const digits = yieldMatch?.replace(/[^\d]/g, '') ?? '8000';
  const yieldLabel = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (isColorPrinter(product)) {
    if (condition === 'Nueva') {
      return `Incluye tóner inicial nuevo CMYK (${yieldLabel} páginas).`;
    }
    return `Incluye tóner nuevo CMYK (${yieldLabel} páginas).`;
  }

  if (condition === 'Nueva') {
    return `Incluye tóner inicial nuevo (${yieldLabel} páginas).`;
  }
  return `Incluye tóner nuevo (${yieldLabel} páginas).`;
}

function resolveWarrantyLine(condition: EquipmentCommercialCondition): string {
  if (condition === 'Nueva') {
    return 'Garantía de fábrica: 1 año o 20,000 páginas.';
  }
  return 'Garantía en soporte técnico: 1 año o 20,000 páginas.';
}

function resolveStabilizerLine(): string {
  return 'Recomendado usar estabilizador sólido 2000W ante variaciones eléctricas.';
}

function resolveGiftLines(product: Product): string[] {
  const lines = [
    'Envío gratis (Lima Metropolitana o agencia).',
    'Instalación y capacitación presencial/remota sin costo.',
  ];
  if (isRicohImSeriesEquipment(product)) {
    lines.push('Ricoh Smart Suite gratis por 1 año (gestión remota).');
  }
  lines.push('Constancia de garantía y carta de originalidad a solicitud.');
  return lines;
}

/**
 * Descripción comercial unificada para ficha y cotización
 * (nuevos, seminuevos y remanufacturados).
 */
export function buildEquipmentCommercialDescription(product: Product): string | null {
  if (!isPrinterProduct(product)) return null;

  const condition = resolveCondition(product);
  const giftLines = resolveGiftLines(product);

  return [
    resolveDisplayTitle(product),
    '',
    resolveConditionIntro(condition),
    '',
    resolveSpeedLine(product),
    resolveScreenLine(product),
    resolveFormatLine(product),
    resolveConnectivityLine(product),
    resolveAdfLine(product),
    resolvePaperLine(product),
    resolveTonerLine(product, condition),
    resolveWarrantyLine(condition),
    resolveStabilizerLine(),
    '',
    'REGALO:',
    '',
    ...giftLines,
  ].join('\n');
}

/** Párrafos listos para la ficha (conservan saltos con whitespace-pre-line). */
export function buildEquipmentCommercialDescriptionParagraphs(
  product: Product,
): string[] {
  const text = buildEquipmentCommercialDescription(product);
  if (!text) return [];

  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function resolveEquipmentCommercialConditionLabel(product: Product): string {
  return resolveProductHeroConditionLabel(product)?.trim() || resolveCondition(product);
}

export function productUsesSupportWarranty(product: Product): boolean {
  return (
    productQualifiesAsSeminuevaEquipment(product) ||
    productQualifiesAsRemanufacturadaEquipment(product) ||
    resolveCondition(product) !== 'Nueva'
  );
}
