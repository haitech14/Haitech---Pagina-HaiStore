import {
  Award,
  BookOpen,
  Cloud,
  Copy,
  Cpu,
  FileText,
  FlipHorizontal2,
  Gauge,
  Grid3x3,
  Inbox,
  Layers,
  Leaf,
  Monitor,
  Lock,
  Network,
  Printer,
  ScanLine,
  Settings,
  Shield,
  Smartphone,
  Timer,
  Usb,
  Wifi,
} from 'lucide-react';

import type { FeaturedProduct } from '@/data/featured-products';
import { DEFAULT_BULK_DISCOUNT_TIERS } from '@/lib/bulk-discount-tiers';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
import type {
  BulkDiscountTier,
  EquipmentConfigStep,
  ProductComboItem,
  ProductDescriptionContent,
  ProductDescriptionHighlight,
  ProductDescriptionVisual,
  ProductDetailViewModel,
  ProductFeatureCard,
  ProductFeatureIcon,
  ProductGalleryItem,
  ProductHeroSpecBullet,
  ProductSpecRow,
} from '@/types/product-detail';
import type { Product } from '@/types/product';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import { findTechnicalSheetAttachment } from '@/lib/inventory-attachments';
import { buildProductGalleryItems } from '@/lib/product-media';
import { ensureFullPrices } from '@/lib/roles';
import { usdToPen } from '@/lib/utils';

const SUPPLY_FEATURES: ProductFeatureIcon[] = [
  { icon: Award, label: 'Compatible de alta calidad' },
  { icon: Shield, label: 'Garantía 12 meses' },
  { icon: FileText, label: 'Rendimiento optimizado' },
];

const PRINTER_FEATURES: ProductFeatureIcon[] = [
  { icon: Layers, label: 'Multifuncional 4 en 1' },
  { icon: Gauge, label: 'Hasta 40 ppm' },
  { icon: ScanLine, label: 'Escaneo dúplex' },
  { icon: Wifi, label: 'Conectividad Wi-Fi' },
];

const PRINTER_BULLETS = [
  'Impresión, copia, escaneo y fax en un solo equipo compacto.',
  'Pantalla táctil a color de 4.3" para operación intuitiva.',
  'Impresión dúplex automática para ahorro de papel.',
  'Conectividad Wi-Fi, Ethernet y móvil para equipos híbridos.',
  'Bandeja de 500 hojas y alimentador automático de documentos.',
  'Compatible con soluciones cloud y gestión remota Ricoh.',
];

const IM430F_BULLETS = [
  'Imprime, copia, escanea y fax',
  'Hasta 45 ppm',
  'Pantalla Smart Operation Panel de 10.1"',
  'Primera impresión en menos de 6 segundos',
  'Escaneo a color',
  'Conectividad móvil y nube',
];

const IM430F_HERO_SPEC_BULLETS: ProductHeroSpecBullet[] = [
  { label: 'Multifunción 4 en 1', value: 'impresión, copia, escaneo y fax' },
  { label: 'Velocidad de impresión', value: 'hasta 45 ppm (A4)' },
  { label: 'Calidad de impresión', value: '1200 x 1200 dpi' },
  { label: 'Pantalla', value: 'táctil a color de 10.1"' },
  { label: 'Conectividad', value: 'Wi-Fi, USB, LAN' },
  {
    label: 'Manejo de papel',
    value: 'casetera 500 hojas + bypass 80 hojas | ADF dúplex 50 hojas',
  },
  { label: 'Rendimiento de tóner', value: 'hasta 15,000 páginas' },
];

const IM430F_HERO_LEAD = '';

const IM430F_HERO_DESCRIPTION = '';

const IM430F_FEATURE_BAR: ProductDescriptionHighlight[] = [
  { icon: Gauge, title: '45 ppm', subtitle: 'Velocidad de impresión' },
  { icon: Wifi, title: 'Wi-Fi', subtitle: 'Conectividad inalámbrica' },
  { icon: Smartphone, title: 'Pantalla 10.1"', subtitle: 'Smart Operation Panel' },
  { icon: Inbox, title: 'ADF', subtitle: 'Alimentador automático' },
  { icon: Layers, title: '550 hojas', subtitle: 'Capacidad estándar' },
  { icon: ScanLine, title: 'Escaneo a color', subtitle: 'Calidad profesional' },
];

function buildHeroSpecTitle(_product: Product, _isPrinter: boolean): string | null {
  return null;
}

function buildHeroSpecBullets(
  product: Product,
  specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductHeroSpecBullet[] {
  if (!isPrinter) return [];
  if (isIm430f(product)) return IM430F_HERO_SPEC_BULLETS;

  const bullets: ProductHeroSpecBullet[] = [];

  const functions = specs.find((row) => row.label === 'Funciones');
  if (functions) {
    bullets.push({ icon: Copy, text: 'Copiadora, Impresora, Escaner y fax' });
  }

  const speed = specs.find((row) => row.label === 'Velocidad');
  const format = specs.find(
    (row) => row.label === 'Formatos' || row.label === 'Formato' || row.label === 'Formato papel',
  );
  if (speed) {
    const ppm = /^hasta\s/i.test(speed.value) ? speed.value : `hasta ${speed.value}`;
    const formatoSuffix = format?.value.toLowerCase().includes('a4') ? ' en Formato A4' : '';
    bullets.push({ icon: Printer, text: `Imprime ${ppm}${formatoSuffix}` });
  } else if (format?.value.toLowerCase().includes('a4')) {
    bullets.push({ icon: FileText, text: 'Formato A4' });
  }

  const resolution = specs.find((row) => row.label.toLowerCase().includes('resolución'));
  if (resolution) {
    bullets.push({
      icon: Grid3x3,
      text: `Resolución de impresión: ${resolution.value.replace(/^hasta\s+/i, '')}`,
    });
  }

  const screen = specs.find((row) => row.label === 'Pantalla');
  if (screen) {
    bullets.push({ icon: Monitor, text: screen.value });
  }

  const connectivity = specs.find((row) => row.label === 'Conectividad');
  if (connectivity) {
    const formatted = connectivity.value
      .replace(/\s*\/\s*/g, ', ')
      .replace(/\s+y\s+/i, ', ')
      .replace(/Red/gi, 'LAN');
    bullets.push({ icon: Wifi, text: `Conectividad: ${formatted}` });
  }

  const paper = specs.find((row) => row.label.toLowerCase().includes('papel'));
  if (paper) {
    bullets.push({ icon: Layers, text: `Capacidad de papel: ${paper.value}` });
  }

  const adf = specs.find((row) => row.label.toLowerCase().includes('adf'));
  if (adf) {
    bullets.push({ icon: ScanLine, text: adf.value });
  }

  const volume = specs.find((row) => row.label.toLowerCase().includes('volumen'));
  if (volume) {
    const monthly = volume.value.replace(/^hasta\s+/i, '');
    bullets.push({
      icon: Gauge,
      text: `Ciclo Mensual: ${monthly}`,
    });
  } else if (functions && bullets.length < 9) {
    bullets.push({ icon: ScanLine, text: functions.value });
  }

  return bullets.slice(0, 9);
}

function resolveHeroLead(product: Product, isPrinter: boolean, isSupply: boolean): string {
  if (isIm430f(product)) return IM430F_HERO_LEAD;
  if (isPrinter) {
    return (
      product.description ??
      'Equipo multifuncional profesional diseñado para oficinas que buscan productividad y confiabilidad.'
    );
  }
  if (isSupply) return 'Consumible compatible de alta calidad para un rendimiento constante.';
  return product.category ?? 'Producto HaiStore';
}

function resolveHeroDescription(product: Product, isPrinter: boolean, isSupply: boolean): string {
  if (isIm430f(product)) return IM430F_HERO_DESCRIPTION;
  if (isPrinter) {
    return (
      product.description ??
      'Rendimiento, conectividad y facilidad de uso en un solo equipo. Consulta con nuestros asesores la configuración ideal para tu operación.'
    );
  }
  if (isSupply) {
    return 'Calidad de impresión consistente y compatibilidad verificada para tu equipo.';
  }
  return product.description ?? '';
}

function resolveHeroCategoryLabel(product: Product, isPrinter: boolean): string {
  if (isIm430f(product)) return 'Multifuncional monocromo';
  if (isPrinter) {
    const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
    if (haystack.includes('color') || haystack.includes('a color')) {
      return 'Multifuncional a color';
    }
    return 'Multifuncional monocromo';
  }
  return product.category ?? 'Productos';
}

function buildHeroHighlights(
  specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductDescriptionHighlight[] {
  if (!isPrinter) return [];

  const speedRaw = specs.find((row) => row.label === 'Velocidad')?.value ?? '40 ppm';
  const speedSubtitle = /^hasta\s/i.test(speedRaw) ? speedRaw : `Hasta ${speedRaw}`;

  const connectivityRaw =
    specs.find((row) => row.label === 'Conectividad')?.value ?? 'Wi-Fi / Red / Móvil';
  const connectivitySubtitle = connectivityRaw
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+y\s+/i, ', ')
    .replace(/Red/gi, 'Ethernet');

  return [
    {
      icon: Printer,
      title: '4 EN 1',
      subtitle: 'Imprime, copia, escanea y faxea',
    },
    {
      icon: Timer,
      title: 'ALTA VELOCIDAD',
      subtitle: speedSubtitle,
    },
    {
      icon: FlipHorizontal2,
      title: 'DÚPLEX AUTOMÁTICO',
      subtitle: 'Ahorro de papel',
    },
    {
      icon: Cloud,
      title: 'CONECTIVIDAD TOTAL',
      subtitle: connectivitySubtitle,
    },
  ];
}

const IM430F_SPECS: ProductSpecRow[] = [
  { label: 'Velocidad', value: '45 ppm' },
  { label: 'Funciones', value: 'Impresión / Copia / Escaneo / Fax' },
  { label: 'Pantalla', value: '10.1 pulgadas (Smart Operation Panel)' },
  { label: 'Tipo', value: 'Monocromática' },
  { label: 'Conectividad', value: 'Wi-Fi / Red / Móvil' },
  { label: 'Resolución de impresión', value: 'Hasta 1200 x 1200 dpi' },
  { label: 'Capacidad de papel estándar', value: '550 hojas (expandible a 2,300 hojas)' },
  { label: 'Volumen mensual recomendado', value: 'Hasta 10,000 páginas' },
];

const WARRANTY_BULLETS = [
  'Garantía oficial de 12 meses por defecto de fábrica.',
  'Cobertura en piezas, mano de obra y desplazamiento en Lima Metropolitana.',
  'Extensiones de garantía disponibles hasta 36 meses adicionales.',
  'Soporte técnico certificado Haitech durante todo el periodo de garantía.',
];

const PRINTER_CONNECTIVITY_VISUAL = [
  { icon: Wifi, label: 'Wi-Fi' },
  { icon: Network, label: 'RJ45 LAN' },
  { icon: Usb, label: 'USB' },
  { icon: Smartphone, label: 'Móvil' },
] as const;

const IM430F_DESCRIPTION_VISUAL: ProductDescriptionVisual = {
  functions: [
    { icon: Copy, label: 'Copiadora' },
    { icon: Printer, label: 'Impresora' },
    { icon: ScanLine, label: 'Escáner' },
  ],
  connectivity: [...PRINTER_CONNECTIVITY_VISUAL],
  specs: [
    { icon: Gauge, title: 'Velocidad', lines: ['45 ppm'] },
    { icon: Cpu, title: 'Memoria', lines: ['2 GB'] },
    { icon: Smartphone, title: 'Pantalla', lines: ['LCD 10,1"'] },
    { icon: Layers, title: 'Rendimiento Mensual', lines: ['10,000 páginas x mes'] },
    { icon: Printer, title: 'Capacidad de papel', lines: ['Estándar: 550 Hojas'] },
    { icon: Inbox, title: 'ADF', lines: ['Casetera 500 Hojas', 'Bypass: 100 Hojas'] },
  ],
};

function specValue(specs: ProductSpecRow[], ...labels: string[]): string {
  for (const label of labels) {
    const row = specs.find((entry) => entry.label.toLowerCase().includes(label.toLowerCase()));
    if (row?.value?.trim()) return row.value.trim();
  }
  return '';
}

function shortenScreenLabel(value: string): string {
  const inches = value.match(/(\d+(?:[.,]\d+)?)\s*(?:pulgadas|")/i);
  if (inches) {
    return `LCD ${inches[1]?.replace('.', ',')}"`;
  }
  return value;
}

function shortenMonthlyVolume(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return value;
  const formatted = Number(digits).toLocaleString('es-PE');
  return `${formatted} páginas x mes`;
}

function buildFeatureBar(
  product: Product,
  specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductDescriptionHighlight[] {
  if (!isPrinter) return [];
  if (isIm430f(product)) return IM430F_FEATURE_BAR;

  const speed = specValue(specs, 'velocidad') || '40 ppm';
  const screen = specValue(specs, 'pantalla');
  const paper = specValue(specs, 'capacidad', 'papel');

  return [
    {
      icon: Gauge,
      title: speed.replace(/^hasta\s+/i, ''),
      subtitle: 'Velocidad de impresión',
    },
    { icon: Wifi, title: 'Wi-Fi', subtitle: 'Conectividad inalámbrica' },
    {
      icon: Smartphone,
      title: screen ? shortenScreenLabel(screen) : 'Pantalla táctil',
      subtitle: 'Panel de operación',
    },
    { icon: Inbox, title: 'ADF', subtitle: 'Alimentador automático' },
    {
      icon: Layers,
      title: paper ? paper.replace(/.*(\d[\d.,]*\s*hojas?).*/i, '$1') : 'Bandeja estándar',
      subtitle: 'Capacidad estándar',
    },
    { icon: ScanLine, title: 'Escaneo a color', subtitle: 'Calidad profesional' },
  ];
}

function buildDescriptionVisual(
  product: Product,
  specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductDescriptionVisual | null {
  if (!isPrinter) return null;
  if (isIm430f(product)) return IM430F_DESCRIPTION_VISUAL;

  const speed = specValue(specs, 'velocidad') || '40 ppm';
  const screen = specValue(specs, 'pantalla');
  const monthly = specValue(specs, 'volumen');
  const paper = specValue(specs, 'capacidad', 'papel');

  return {
    functions: [
      { icon: Copy, label: 'Copiadora' },
      { icon: Printer, label: 'Impresora' },
      { icon: ScanLine, label: 'Escáner' },
    ],
    connectivity: [...PRINTER_CONNECTIVITY_VISUAL],
    specs: [
      { icon: Gauge, title: 'Velocidad', lines: [speed.replace(/^hasta\s+/i, '')] },
      { icon: Cpu, title: 'Memoria', lines: ['2 GB'] },
      ...(screen
        ? [{ icon: Smartphone, title: 'Pantalla', lines: [shortenScreenLabel(screen)] }]
        : [{ icon: Smartphone, title: 'Pantalla', lines: ['Pantalla táctil'] }]),
      ...(monthly
        ? [{ icon: Layers, title: 'Rendimiento Mensual', lines: [shortenMonthlyVolume(monthly)] }]
        : [{ icon: Layers, title: 'Rendimiento Mensual', lines: ['Alto volumen mensual'] }]),
      ...(paper
        ? [{ icon: Printer, title: 'Capacidad de papel', lines: [`Estándar: ${paper}`] }]
        : [{ icon: Printer, title: 'Capacidad de papel', lines: ['Bandeja estándar'] }]),
      { icon: Inbox, title: 'ADF', lines: ['Casetera ampliable', 'Bypass incluido'] },
    ],
  };
}

const IM430F_FEATURE_CARDS: ProductFeatureCard[] = [
  {
    icon: Printer,
    title: 'Alto rendimiento',
    description:
      'Imprime hasta 43 páginas por minuto para mantener la productividad de tu equipo.',
  },
  {
    icon: Copy,
    title: 'Multifunción 5 en 1',
    description:
      'Imprime, copia, escanea, faxea y almacena documentos desde un solo dispositivo.',
  },
  {
    icon: Monitor,
    title: 'Experiencia intuitiva',
    description: 'Pantalla táctil inteligente de 4.3 pulgadas para una operación rápida y sencilla.',
  },
  {
    icon: Network,
    title: 'Conectividad flexible',
    description: 'Compatible con dispositivos móviles, servicios en la nube y diversas soluciones.',
  },
  {
    icon: Shield,
    title: 'Seguridad avanzada',
    description: 'Protege tu información con funciones de seguridad líderes en la industria.',
  },
  {
    icon: Leaf,
    title: 'Eficiencia sostenible',
    description:
      'Diseñada para reducir el consumo de energía y el impacto ambiental sin comprometer el rendimiento.',
  },
];

const IM430F_DESCRIPTION: ProductDescriptionContent = {
  overviewTitle: 'Diseñada para la productividad',
  overviewParagraphs: [
    'La RICOH IM 430F mejora los flujos de trabajo documentales y optimiza la eficiencia de tu negocio con funciones inteligentes y una alta confiabilidad.',
  ],
  overviewLink: {
    label: 'Más información sobre la serie IM 430',
    href: '/tienda',
  },
  featureCards: IM430F_FEATURE_CARDS,
  paragraphs: [
    'La RICOH IM 430F es una impresora multifuncional inteligente diseñada para oficinas que buscan productividad, velocidad y eficiencia. Ofrece hasta 45 ppm, pantalla Smart Operation Panel de 10.1" y conectividad móvil y en la nube para flujos de trabajo modernos.',
    'Ideal para equipos que necesitan impresión, copiado, escaneo y fax en un solo equipo compacto, con calidad homogénea y control de costos operativos.',
  ],
  youtubeVideoId: 'zlmBXCWnR20',
  youtubeTitle: 'Ricoh IM 430F | Productividad y eficiencia en una sola impresora multifuncional',
  highlights: [
    { icon: Gauge, title: 'Alta velocidad', subtitle: 'Hasta 40 ppm color y B/N' },
    { icon: Inbox, title: 'Gran capacidad', subtitle: 'Hasta 4,700 hojas' },
    { icon: Smartphone, title: 'Pantalla inteligente', subtitle: 'Pantalla táctil de 10.1"' },
    { icon: Cloud, title: 'Conectividad', subtitle: 'Impresión móvil y en la nube' },
    { icon: Lock, title: 'Seguridad', subtitle: 'Seguridad avanzada y confiable' },
  ],
};

function buildDescriptionContent(product: Product, isPrinter: boolean, isSupply: boolean): ProductDescriptionContent | null {
  if (isIm430f(product)) return IM430F_DESCRIPTION;

  if (isPrinter) {
    const highlights = [
      { icon: Gauge, title: 'Alta velocidad', subtitle: 'Rendimiento constante en impresión y copiado' },
      { icon: Inbox, title: 'Gran capacidad', subtitle: 'Bandejas ampliadas para alto volumen' },
      { icon: Settings, title: 'Panel inteligente', subtitle: 'Operación intuitiva con pantalla táctil' },
      { icon: Cloud, title: 'Conectividad', subtitle: 'Impresión móvil y en la nube' },
      { icon: Lock, title: 'Seguridad', subtitle: 'Protección de documentos y accesos' },
      { icon: Leaf, title: 'Eficiencia energética', subtitle: 'Menor consumo sin sacrificar rendimiento' },
    ];
    return {
      overviewTitle: 'Diseñada para la productividad',
      overviewParagraphs: [
        product.description ??
          'Equipo multifuncional profesional diseñado para oficinas que buscan productividad, conectividad y control de costos operativos.',
      ],
      featureCards: highlights.map((item) => ({
        icon: item.icon,
        title: item.title,
        description: item.subtitle,
      })),
      paragraphs: [
        product.description ??
          'Equipo multifuncional profesional diseñado para oficinas que buscan productividad, conectividad y control de costos operativos.',
        'Compatible con impresión móvil, escaneo a carpetas y servicios en la nube para equipos de trabajo híbridos.',
      ],
      highlights,
    };
  }

  if (isSupply && product.description) {
    return {
      paragraphs: [product.description],
      highlights: [],
    };
  }

  return null;
}

const CONSUMER_BULLETS = [
  'Producto original con garantía del fabricante.',
  'Envío seguro a todo el Perú.',
  'Soporte técnico especializado Haitech.',
  'Devoluciones según política de la tienda.',
];

function skuFromId(id: string): string {
  const clean = id.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase().padEnd(8, '0');
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-1`;
}

function soldCountFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 97;
  return 4 + (hash % 24);
}

export function isPrinterEquipment(product: Product): boolean {
  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();
  return (
    cat.includes('multifuncional') ||
    cat.includes('impresora') ||
    name.includes('ricoh') ||
    name.includes('bizhub') ||
    name.includes('im ') ||
    name.includes('imageclass')
  );
}

function isSupplyProduct(product: Product): boolean {
  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();
  return (
    cat.includes('toner') ||
    cat.includes('suministro') ||
    cat.includes('repuesto') ||
    name.includes('toner') ||
    name.includes('tóner') ||
    name.includes('cartucho')
  );
}

function isIm430f(product: Product): boolean {
  if (product.id === 'ricoh-im-430f') return true;
  return /\bim\s*430\s*f\b/i.test(product.name);
}

const PRINTER_CATEGORY_PREFIX_PATTERN = /^(?:impresora\s+)?multifuncional(?:es)?\s+/i;

function normalizeModelToken(model: string): string {
  return model.replace(/\s+/g, ' ').trim().toUpperCase();
}

function extractPrinterShortTitle(product: Product): string | null {
  const name = product.name.trim();
  const brand = product.brand?.trim();

  const ricohMatch = name.match(/\bRICOH\s+(IM\s*C?\s*\d{3,4}[A-Z]?)\b/i);
  if (ricohMatch?.[1]) {
    return `RICOH ${normalizeModelToken(ricohMatch[1])}`;
  }

  const imMatch = name.match(/\b(IM\s*C?\s*\d{3,4}[A-Z]?)\b/i);
  if (imMatch?.[1] && brand && /^ricoh$/i.test(brand)) {
    return `RICOH ${normalizeModelToken(imMatch[1])}`;
  }

  if (brand) {
    let model = stripBrandFromName(name, brand).replace(PRINTER_CATEGORY_PREFIX_PATTERN, '').trim();
    if (model) {
      return `${brand.toUpperCase()} ${model.toUpperCase()}`;
    }
  }

  return null;
}

function resolveShortTitle(product: Product, isPrinter: boolean): string {
  if (isIm430f(product)) return 'RICOH IM 430F';
  if (isPrinter) {
    return extractPrinterShortTitle(product) ?? product.name;
  }
  return product.name;
}

function stripBrandFromName(name: string, brand: string | null | undefined): string {
  if (!brand?.trim()) return name.trim();
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return name
    .trim()
    .replace(new RegExp(escaped, 'gi'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Título en ficha: nombre del producto sin marca, en minúsculas. */
function resolveDetailDisplayTitle(product: Product, brandLabel: string): string {
  const withoutBrand = stripBrandFromName(product.name, brandLabel);
  return (withoutBrand || product.name).toLowerCase();
}

function resolveDisplaySubtitle(product: Product, isPrinter: boolean, isSupply: boolean): string {
  if (isIm430f(product)) {
    return IM430F_HERO_LEAD;
  }
  if (isPrinter) {
    return (
      product.description ??
      'Equipo multifuncional profesional diseñado para oficinas que buscan productividad y confiabilidad.'
    );
  }
  if (isSupply) return 'Consumible compatible de alta calidad';
  return product.category ?? 'Producto HaiStore';
}

function toHeroTitle(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      const upper = word.toUpperCase();
      if (
        upper === 'IM' ||
        upper === 'RICOH' ||
        /^IM\d/.test(upper) ||
        /^\d+[A-Z]?$/.test(upper)
      ) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function buildTagPills(
  specs: ProductSpecRow[],
  isPrinter: boolean,
  showNuevo: boolean,
): string[] {
  const pills: string[] = [];
  if (showNuevo) pills.push('Nuevo');

  if (!isPrinter) return pills;

  const speed = specs.find((row) => row.label === 'Velocidad')?.value;
  if (speed) pills.push(speed);

  const formato =
    specs.find((row) => row.label === 'Formatos' || row.label === 'Formato')?.value ?? 'A4';
  if (formato.toLowerCase().includes('a4')) pills.push('A4');

  const tipo = specs.find((row) => row.label === 'Tipo')?.value;
  if (tipo) pills.push(tipo);

  return pills;
}

function buildGallery(product: Product): ProductGalleryItem[] {
  const items = buildProductGalleryItems(product);
  if (items.length > 0) return items;
  return [];
}

function buildSupplySpecs(product: Product): ProductSpecRow[] {
  const brand = product.brand ?? 'Ricoh';
  const name = product.name.toLowerCase();
  const color = name.includes('cyan') || name.includes('cian')
    ? 'Cian'
    : name.includes('magenta')
      ? 'Magenta'
      : name.includes('yellow') || name.includes('amarillo')
        ? 'Amarillo'
        : name.includes('black') || name.includes('negro')
          ? 'Negro'
          : 'Cian';

  return [
    { label: 'Marca', value: brand },
    { label: 'Código', value: '841852' },
    { label: 'Modelo', value: 'MP C6003' },
    { label: 'Color', value: color },
    { label: 'Tipo', value: 'Cartucho de toner' },
    {
      label: 'Rendimiento',
      value: 'Negro 33,000 Páginas y Color 22,500 Páginas',
    },
    {
      label: 'Compatibilidad',
      value: 'Para impresoras MP C4503, C5503, C5504, C6003, C6004 series',
    },
    { label: 'Garantía', value: '12 meses' },
  ];
}

function buildSupplyBullets(): string[] {
  return [
    'Cartucho compatible de alta calidad certificado.',
    'Rendimiento equivalente al original del fabricante.',
    'Instalación sencilla en equipos Ricoh MP series.',
    'Empaque sellado con protección contra daños en transporte.',
  ];
}

function buildGenericSpecs(product: Product, brandLabel: string, sku: string): ProductSpecRow[] {
  return [
    { label: 'Marca', value: brandLabel },
    { label: 'SKU', value: sku },
    { label: 'Categoría', value: product.category ?? 'General' },
    { label: 'Disponibilidad', value: product.stock > 0 ? `${product.stock} unidades` : 'Agotado' },
    { label: 'Moneda', value: product.currency },
    { label: 'Garantía', value: '12 meses' },
  ];
}

function buildPrinterSpecs(product: Product, brandLabel: string, sku: string): ProductSpecRow[] {
  return [
    { label: 'Velocidad', value: '40 ppm' },
    { label: 'Marca', value: brandLabel },
    { label: 'Modelo', value: product.name },
    { label: 'SKU', value: sku },
    { label: 'Categoría', value: product.category ?? 'Multifuncionales' },
    { label: 'Tipo', value: 'Monocromática' },
    { label: 'Formatos', value: 'A4, oficio, sobres' },
    { label: 'Conectividad', value: 'Wi-Fi, Ethernet, USB' },
    { label: 'Funciones', value: 'Impresión, copia, escaneo, fax' },
    { label: 'Garantía', value: '12 meses' },
  ];
}

function buildComboItems(product: Product, isPrinter: boolean, isSupply: boolean): ProductComboItem[] {
  const image = product.image_url ?? null;

  if (isSupply) {
    return [
      {
        id: 'combo-toner-original',
        name: 'Toner Original RICOH IM 430F (15,500 páginas)',
        image: image ?? '',
        pricePen: 257,
        defaultSelected: true,
      },
      {
        id: 'combo-toner-magenta',
        name: 'Toner Compatible Magenta MP C6003',
        image: image ?? '',
        pricePen: 149,
        defaultSelected: false,
      },
      {
        id: 'combo-unidad-imagen',
        name: 'Unidad de imagen DR IM 430F',
        image: image ?? '',
        pricePen: 189,
        defaultSelected: false,
      },
    ];
  }

  if (isPrinter) {
    return [
      {
        id: 'combo-toner',
        name: 'Tóner RICOH IM 430F (15,500 páginas)',
        image: '/categories/toner-suministros.png',
        pricePen: 680,
        defaultSelected: false,
      },
      {
        id: 'combo-tray',
        name: 'Bandeja de papel adicional 500 hojas',
        image: '/categories/repuestos.png',
        pricePen: 420,
        defaultSelected: false,
      },
      {
        id: 'combo-pedestal',
        name: 'Pedestal / soporte de piso',
        image: '/categories/repuestos.png',
        pricePen: 890,
        defaultSelected: false,
      },
    ];
  }

  return [
    {
      id: 'combo-case',
      name: 'Funda protectora premium',
      image: product.image_url ?? '/products/mochila-techpro.png',
      pricePen: 89,
      defaultSelected: true,
    },
    {
      id: 'combo-cable',
      name: 'Cable y adaptador',
      image: product.image_url ?? '/products/mochila-techpro.png',
      pricePen: 45,
      defaultSelected: false,
    },
  ];
}

function buildEquipmentConfigSteps(isPrinter: boolean, isSupply: boolean): EquipmentConfigStep[] {
  if (isSupply || !isPrinter) return [];

  return [
    {
      id: 'bandeja-accesorios',
      stepNumber: 2,
      title: 'Bandeja de papel y accesorios opcionales',
      subtitle: 'Bandejas, pedestal y alimentadores',
      pricePen: 0,
      icon: Inbox,
      defaultSelected: true,
      options: [
        {
          id: 'bandeja-estandar',
          name: 'Bandeja estándar 550 hojas',
          description: 'Configuración de fábrica incluida.',
          pricePen: 0,
          included: true,
        },
        {
          id: 'bandeja-500',
          name: 'Bandeja adicional 500 hojas',
          description: 'Amplía la capacidad de papel.',
          pricePen: 420,
        },
        {
          id: 'pedestal',
          name: 'Pedestal / soporte de piso',
          description: 'Eleva el equipo y libera espacio en escritorio.',
          pricePen: 890,
        },
        {
          id: 'adf-alto-volumen',
          name: 'Alimentador automático de alto volumen',
          description: 'Para lotes de escaneo y copiado frecuentes.',
          pricePen: 1250,
        },
      ],
    },
    {
      id: 'acabado',
      stepNumber: 3,
      title: 'Opciones de acabado',
      subtitle: 'Grapado, perforado y finisher',
      pricePen: 0,
      icon: Settings,
      defaultSelected: true,
      options: [
        {
          id: 'sin-acabado',
          name: 'Sin unidad de acabado',
          description: 'Impresión y copiado sin grapado.',
          pricePen: 0,
          included: true,
        },
        {
          id: 'finisher-grapado',
          name: 'Finisher con grapado',
          description: 'Agrupa y grapa documentos automáticamente.',
          pricePen: 1680,
        },
        {
          id: 'finisher-grapado-perforado',
          name: 'Finisher grapado + perforado',
          description: 'Acabado profesional para carpetas y reportes.',
          pricePen: 2190,
        },
      ],
    },
    {
      id: 'impresion-escaneo',
      stepNumber: 4,
      title: 'Opciones de impresión/escaneo',
      subtitle: 'Escaneo, OCR y funciones avanzadas',
      pricePen: 0,
      icon: ScanLine,
      defaultSelected: true,
      options: [
        {
          id: 'escaneo-duplex',
          name: 'Escaneo dúplex automático',
          description: 'Digitaliza ambas caras en un solo paso.',
          pricePen: 0,
          included: true,
        },
        {
          id: 'kit-ocr',
          name: 'Kit OCR / escaneo buscable',
          description: 'Convierte documentos en PDF editables.',
          pricePen: 540,
        },
        {
          id: 'impresion-segura',
          name: 'Impresión segura con marca de agua',
          description: 'Protege documentos confidenciales.',
          pricePen: 320,
        },
      ],
    },
    {
      id: 'seguridad-accesorios',
      stepNumber: 5,
      title: 'Accesorios de seguridad y otros accesorios',
      subtitle: 'Control de acceso y almacenamiento',
      pricePen: 0,
      icon: Lock,
      defaultSelected: true,
      options: [
        {
          id: 'sin-seguridad-extra',
          name: 'Sin accesorios de seguridad adicionales',
          pricePen: 0,
          included: true,
        },
        {
          id: 'hdd-cifrado',
          name: 'Disco duro cifrado',
          description: 'Almacenamiento local con cifrado de datos.',
          pricePen: 760,
        },
        {
          id: 'auth-tarjeta',
          name: 'Autenticación por tarjeta / PIN',
          description: 'Libera trabajos solo con credencial autorizada.',
          pricePen: 480,
        },
        {
          id: 'bandeja-bypass',
          name: 'Bandeja bypass para formatos especiales',
          description: 'Sobres, etiquetas y papeles de distinto gramaje.',
          pricePen: 290,
        },
      ],
    },
    {
      id: 'suministros',
      stepNumber: 6,
      title: 'Suministros',
      subtitle: 'Tóner y kits de mantenimiento',
      pricePen: 0,
      icon: Printer,
      defaultSelected: true,
      options: [
        {
          id: 'starter-kit',
          name: 'Kit de inicio incluido',
          description: 'Tóner y unidad de imagen de fábrica.',
          pricePen: 0,
          included: true,
        },
        {
          id: 'toner-extra',
          name: 'Cartucho de tóner negro adicional',
          description: 'Alto rendimiento para puesta en marcha.',
          pricePen: 185,
        },
        {
          id: 'kit-mantenimiento',
          name: 'Kit de mantenimiento preventivo',
          description: 'Repuestos de desgaste para el primer año.',
          pricePen: 340,
        },
        {
          id: 'waste-bottle',
          name: 'Botella de tóner residual adicional',
          pricePen: 95,
        },
      ],
    },
  ];
}

function resolvePricing(
  product: Product,
  featuredMeta?: FeaturedProduct,
): {
  oldPricePen: number | null;
  discountPercent: number | null;
  isOnOffer: boolean;
} {
  const pricePen = usdToPen(product.price);

  if (featuredMeta?.oldPrice) {
    const oldPen = usdToPen(featuredMeta.oldPrice);
    const discount = featuredMeta.discount ?? Math.round((1 - product.price / featuredMeta.oldPrice) * 100);
    return {
      oldPricePen: oldPen,
      discountPercent: discount,
      isOnOffer: true,
    };
  }

  if (isIm430f(product)) {
    const discountPercent = 21;
    const oldPriceUsd = Math.round((product.price / (1 - discountPercent / 100)) * 100) / 100;
    return {
      oldPricePen: usdToPen(oldPriceUsd),
      discountPercent,
      isOnOffer: true,
    };
  }

  if (isSupplyProduct(product) || product.category?.toLowerCase().includes('toner')) {
    const oldPen = Math.round(pricePen * 2);
    return {
      oldPricePen: oldPen,
      discountPercent: 50,
      isOnOffer: true,
    };
  }

  return {
    oldPricePen: null,
    discountPercent: null,
    isOnOffer: false,
  };
}

export function buildProductDetail(
  product: Product,
  featuredMeta?: FeaturedProduct,
  rentalPlansFromApi: Array<{ pagesPerMonth: number; monthlyPricePen: number }> = [],
  bulkDiscountTiers: BulkDiscountTier[] = DEFAULT_BULK_DISCOUNT_TIERS,
): ProductDetailViewModel {
  const isPrinter = isPrinterEquipment(product);
  const isSupply = isSupplyProduct(product);
  const brandLabel = product.brand ?? (isSupply ? 'Compatible' : 'Haitech');
  const categoryLabel = resolveHeroCategoryLabel(product, isPrinter);

  const pricing = resolvePricing(product, featuredMeta);
  const sku = isIm430f(product) ? '9900129' : skuFromId(product.id);
  const colorLabel = isIm430f(product)
    ? 'Blanco/Negro'
    : isSupply
      ? 'Varios'
      : 'Estándar';
  const bullets = isSupply
    ? buildSupplyBullets()
    : product.description && !isPrinter
      ? [product.description, ...CONSUMER_BULLETS.slice(0, 3)]
      : isIm430f(product)
        ? IM430F_BULLETS
        : isPrinter
          ? PRINTER_BULLETS
          : CONSUMER_BULLETS;

  const shortTitle = resolveShortTitle(product, isPrinter);
  const displaySubtitle = resolveDisplaySubtitle(product, isPrinter, isSupply);
  const heroLead = resolveHeroLead(product, isPrinter, isSupply);
  const heroDescription = resolveHeroDescription(product, isPrinter, isSupply);

  const displayTitle = resolveDetailDisplayTitle(product, brandLabel);

  const specs = isIm430f(product)
    ? IM430F_SPECS
    : isSupply
      ? buildSupplySpecs(product)
      : isPrinter
        ? buildPrinterSpecs(product, brandLabel, sku)
        : buildGenericSpecs(product, brandLabel, sku);

  const heroSpecBullets = buildHeroSpecBullets(product, specs, isPrinter);
  const heroSpecTitle = buildHeroSpecTitle(product, isPrinter);

  const descriptionVisual = buildDescriptionVisual(product, specs, isPrinter);
  const featureBar = buildFeatureBar(product, specs, isPrinter);

  const showNuevo = productHasNuevoCornerBadge(product);

  const heroTitle = toHeroTitle(product.name);
  const tagPills = buildTagPills(specs, isPrinter, showNuevo);
  const heroHighlights = buildHeroHighlights(specs, isPrinter);

  const breadcrumbs = buildProductBreadcrumbs(product, displayTitle, []);

  const fullPrices = ensureFullPrices(product.prices ?? { public: product.price });
  const technicalSheet = findTechnicalSheetAttachment(product);
  const technicalSheetUrl = technicalSheet?.url ?? null;
  const wholesalePriceUsd = fullPrices.mayorista > 0 ? fullPrices.mayorista : null;

  return {
    product,
    sku,
    brandLabel,
    colorLabel,
    breadcrumbs,
    displayTitle,
    shortTitle,
    heroTitle,
    tagPills,
    heroHighlights,
    displaySubtitle,
    heroLead,
    heroDescription,
    heroSpecBullets,
    heroSpecTitle,
    categoryLabel,
    rating: featuredMeta?.rating ?? 4.6,
    reviews: featuredMeta?.reviews ?? soldCountFromId(product.id) * 5 + 18,
    soldCount: soldCountFromId(product.id),
    bullets,
    descriptionContent: buildDescriptionContent(product, isPrinter, isSupply),
    descriptionVisual,
    featureBar,
    specs,
    warrantyBullets: WARRANTY_BULLETS,
    gallery: buildGallery(product),
    features: isSupply ? SUPPLY_FEATURES : isPrinter ? PRINTER_FEATURES : SUPPLY_FEATURES,
    resourceLinks: [
      {
        label: 'Ficha Técnica',
        subtitle: 'PDF',
        icon: FileText,
        href: technicalSheetUrl ?? '#',
      },
      { label: 'Solicitar cotización', subtitle: 'PDF', icon: FileText, action: 'quote' },
      { label: 'Manual de Usuario', subtitle: 'PDF', icon: BookOpen, href: '#' },
    ],
    warrantyOptions: [
      { id: 'none', label: 'No incluir' },
      { id: '1y', label: '1 año adicional', priceUsd: 89 },
      { id: '2y', label: '2 años adicionales', priceUsd: 149 },
      { id: '3y', label: '3 años adicionales', priceUsd: 199 },
    ],
    comboItems: buildComboItems(product, isPrinter, isSupply),
    equipmentConfigSteps: buildEquipmentConfigSteps(isPrinter, isSupply),
    bulkDiscountTiers,
    rentalPlans: isPrinter ? rentalPlansFromApi : [],
    isPrinterEquipment: isPrinter,
    isSupplyProduct: isSupply,
    isOnOffer: pricing.isOnOffer,
    oldPricePen: pricing.oldPricePen,
    discountPercent: pricing.discountPercent,
    technicalSheetUrl,
    wholesalePriceUsd,
  };
}
