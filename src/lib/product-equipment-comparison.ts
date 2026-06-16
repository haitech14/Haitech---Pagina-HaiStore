import type { ProductSpecRow } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface ProductComparisonRow {
  id: string;
  label: string;
}

export interface ProductComparisonColumn {
  productId?: string;
  modelLabel: string;
  image: string;
  isCurrent: boolean;
  values: Record<string, string | boolean>;
}

export interface ProductComparisonData {
  title: string;
  subtitle: string;
  rows: ProductComparisonRow[];
  columns: ProductComparisonColumn[];
}

interface ComparisonModelSpec {
  match: RegExp;
  label: string;
  image?: string;
  values: Record<string, string | boolean>;
}

const COMPARISON_ROWS: ProductComparisonRow[] = [
  { id: 'speed', label: 'Velocidad de impresión' },
  { id: 'tray', label: 'Bandeja estándar' },
  { id: 'duplex', label: 'Dúplex automático' },
  { id: 'screen', label: 'Pantalla táctil' },
  { id: 'volume', label: 'Volumen mensual recomendado' },
];

const RICOH_IM_MONO_MODELS: ComparisonModelSpec[] = [
  {
    match: /\bIM\s*350F\b/i,
    label: 'IM 350F',
    values: {
      speed: '35 ppm',
      tray: '250 hojas',
      duplex: true,
      screen: '4.3" color',
      volume: '3,000 – 10,000 pág.',
    },
  },
  {
    match: /\bIM\s*430F\b/i,
    label: 'IM 430F',
    values: {
      speed: '45 ppm',
      tray: '500 hojas',
      duplex: true,
      screen: '4.3" color',
      volume: '5,000 – 20,000 pág.',
    },
  },
  {
    match: /\bIM\s*550F\b/i,
    label: 'IM 550F',
    values: {
      speed: '55 ppm',
      tray: '550 hojas',
      duplex: true,
      screen: '7" color',
      volume: '10,000 – 30,000 pág.',
    },
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isRicohImMonochromeFamily(equipment: Product): boolean {
  const haystack = normalizeText(`${equipment.name} ${equipment.id}`);
  return /\bim\s*\d{3,4}[a-z]?\b/.test(haystack) || haystack.includes('ricoh-im');
}

function findCatalogMatch(catalog: Product[], spec: ComparisonModelSpec): Product | undefined {
  return catalog.find((row) => {
    const haystack = normalizeText(`${row.name} ${row.id}`);
    return spec.match.test(haystack);
  });
}

function specsToComparisonValues(specs: ProductSpecRow[]): Record<string, string | boolean> {
  const speed = specs.find((row) => row.label === 'Velocidad')?.value ?? '';
  const tray =
    specs.find((row) => row.label === 'Capacidad de papel estándar')?.value ??
    specs.find((row) => row.label.toLowerCase().includes('bandeja'))?.value ??
    '';
  const screen = specs.find((row) => row.label === 'Pantalla')?.value ?? '';
  const volume =
    specs.find((row) => row.label === 'Volumen mensual recomendado')?.value ?? '';

  return {
    speed: speed || '—',
    tray: tray ? tray.replace(/\s*\(.*\)$/, '').trim() : '—',
    duplex: true,
    screen: screen || '—',
    volume: volume || '—',
  };
}

function resolveModelColumn(
  spec: ComparisonModelSpec,
  catalog: Product[],
  currentProduct: Product,
): ProductComparisonColumn {
  const catalogMatch = findCatalogMatch(catalog, spec);
  const isCurrent =
    spec.match.test(normalizeText(currentProduct.name)) ||
    spec.match.test(normalizeText(currentProduct.id));

  if (catalogMatch) {
    return {
      productId: catalogMatch.id,
      modelLabel: spec.label,
      image: catalogMatch.image_url ?? '/categories/multifuncionales.png',
      isCurrent,
      values: isCurrent ? spec.values : spec.values,
    };
  }

  return {
    modelLabel: spec.label,
    image: spec.image ?? '/categories/multifuncionales.png',
    isCurrent,
    values: spec.values,
  };
}

export function resolveEquipmentComparison(
  equipment: Product,
  catalog: Product[],
  specs: ProductSpecRow[],
): ProductComparisonData | null {
  if (!isRicohImMonochromeFamily(equipment)) return null;

  const columns = RICOH_IM_MONO_MODELS.map((spec) =>
    resolveModelColumn(spec, catalog, equipment),
  );

  const currentIndex = columns.findIndex((column) => column.isCurrent);
  if (currentIndex > 0) {
    const [current] = columns.splice(currentIndex, 1);
    columns.unshift(current);
  } else if (currentIndex === -1) {
    columns.unshift({
      productId: equipment.id,
      modelLabel: equipment.name.replace(/ricoh\s*/i, 'IM ').trim() || 'Este equipo',
      image: equipment.image_url ?? '/categories/multifuncionales.png',
      isCurrent: true,
      values: specsToComparisonValues(specs),
    });
  }

  return {
    title: '¿Cómo se compara?',
    subtitle: 'Elige el equipo ideal para tu oficina',
    rows: COMPARISON_ROWS,
    columns: columns.slice(0, 3),
  };
}
