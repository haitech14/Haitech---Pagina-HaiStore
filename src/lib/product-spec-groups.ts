import type { ProductSpecRow } from '@/types/product-detail';

export const FICHA_TECNICA_SECTION_ORDER = [
  'General',
  'Impresora',
  'Escáner',
  'Fax',
  'Manejo de Papel',
  'Consumo Eléctrico',
  'Consumibles',
] as const;

export type FichaTecnicaSectionTitle = (typeof FICHA_TECNICA_SECTION_ORDER)[number];

export interface FichaTecnicaSection {
  title: FichaTecnicaSectionTitle;
  rows: ProductSpecRow[];
}

function normalizeSpecLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function labelMatches(label: string, needles: readonly string[]): boolean {
  const normalized = normalizeSpecLabel(label);
  return needles.some((needle) => normalized.includes(normalizeSpecLabel(needle)));
}

function resolveFichaTecnicaSection(label: string): FichaTecnicaSectionTitle {
  if (
    labelMatches(label, [
      'marca',
      'modelo',
      'codigo',
      'categoria',
      'garantia',
      'volumen mensual',
      'memoria',
      'dimensiones',
      'peso',
      'cpu',
      'tiempo de calentamiento',
      'primera copia',
      'velocidad continua',
      'hdd',
      'spdf',
      'fuente de energia',
      'funciones',
      'produccion',
      'disponibilidad',
      'moneda',
      'color',
      'tipo',
    ])
  ) {
    return 'General';
  }

  if (labelMatches(label, ['fax', 'grupo 3', 'modem', 'transmision fax'])) {
    return 'Fax';
  }

  if (
    labelMatches(label, [
      'escaner',
      'escaneo',
      'scan',
      'adf',
      'alimentador',
      'ipm',
      'digitalizacion',
    ])
  ) {
    return 'Escáner';
  }

  if (
    labelMatches(label, [
      'papel',
      'bandeja',
      'capacidad de papel',
      'formato',
      'formatos',
      'entrada',
      'salida',
      'hojas',
      'gramaje',
      'tamano',
    ])
  ) {
    return 'Manejo de Papel';
  }

  if (
    labelMatches(label, [
      'consumo',
      'electrico',
      'electricidad',
      'energia',
      'tec',
      'watt',
      'reposo',
      'voltaje',
      'amperaje',
    ])
  ) {
    return 'Consumo Eléctrico';
  }

  if (
    labelMatches(label, [
      'consumible',
      'toner',
      'cartucho',
      'rendimiento',
      'tambor',
      'unidad de imagen',
      'norma',
      'iso/iec',
    ])
  ) {
    return 'Consumibles';
  }

  if (
    labelMatches(label, [
      'impresion',
      'impresora',
      'velocidad',
      'resolucion',
      'lenguaje',
      'conectividad',
      'pantalla',
      'ppm',
      'duplex',
      'idioma',
      'emulacion',
      'pcl',
      'postscript',
    ])
  ) {
    return 'Impresora';
  }

  return 'General';
}

function normalizeSectionTitle(section: string): FichaTecnicaSectionTitle | null {
  if (section === 'Especificaciones Generales') return 'General';
  if (FICHA_TECNICA_SECTION_ORDER.includes(section as FichaTecnicaSectionTitle)) {
    return section as FichaTecnicaSectionTitle;
  }
  return null;
}

function resolveSpecSection(row: ProductSpecRow): FichaTecnicaSectionTitle {
  if (row.section) {
    const normalized = normalizeSectionTitle(row.section);
    if (normalized) return normalized;
  }
  return resolveFichaTecnicaSection(row.label);
}

export function groupSpecsForFichaTecnica(specs: ProductSpecRow[]): FichaTecnicaSection[] {
  const buckets = new Map<FichaTecnicaSectionTitle, ProductSpecRow[]>();

  for (const row of specs) {
    const section = resolveSpecSection(row);
    const existing = buckets.get(section) ?? [];
    existing.push(row);
    buckets.set(section, existing);
  }

  return FICHA_TECNICA_SECTION_ORDER.flatMap((title) => {
    const rows = buckets.get(title);
    if (!rows?.length) return [];
    return [{ title, rows }];
  });
}
