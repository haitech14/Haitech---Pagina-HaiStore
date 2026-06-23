import {
  Award,
  BookOpen,
  Cloud,
  Copy,
  FileText,
  Gauge,
  Gift,
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
  Usb,
  Wifi,
} from 'lucide-react';

import type { FeaturedProduct } from '@/data/featured-products';
import { DEFAULT_BULK_DISCOUNT_TIERS } from '@/lib/bulk-discount-tiers';
import { normalizeAttributes } from '@/lib/inventory-attributes';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
import {
  CASETERA_250_PB1110_PRODUCT_ID,
  CASETERA_500_PB1120_PRODUCT_ID,
  CASETERA_500_PB1160_PRODUCT_ID,
  ESTABILIZADOR_2KVA_PRODUCT_ID,
  GABINETE_ALTO_TIPO_I_PRODUCT_ID,
  IM430F_ORIGINAL_TONER_PRODUCT_ID,
  IM550F_COMPATIBLE_TONER_PRODUCT_ID,
  IM550F_ORIGINAL_TONER_PRODUCT_ID,
  ROUTER_WIFI_PRODUCT_ID,
  TALL_CABINET_IM430_PRODUCT_ID,
  TALL_CABINET_IM550_PRODUCT_ID,
} from '@/lib/equipment-config-catalog';
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
import { findTechnicalSheetAttachment, findAttachmentByKind } from '@/lib/inventory-attachments';
import { buildProductGalleryItems } from '@/lib/product-media';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import {
  heroBulletsToStored,
  highlightsToStoredFeatureBar,
  normalizeStorefrontHeroBullets,
  resolveHeroBulletIcon,
  resolveStoredFeatureBar,
  resolveStoredHeroBullets,
} from '@/lib/product-storefront-detail';
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

const IM_BN_A4_FORMAT_BULLET: ProductHeroSpecBullet = {
  icon: FileText,
  text: 'Formato A4, A5, A6 Bypass Formato A4-Carta',
};

const IM_BN_A4_MONTHLY_PRODUCTION_BULLET: ProductHeroSpecBullet = {
  icon: Gauge,
  text: 'Producción mensual 50,000 páginas al mes',
};

const IM_BN_A4_GIFT_BULLET: ProductHeroSpecBullet = {
  icon: Gift,
  text: 'Regalo: 04 Toner de Inicio mínimo al 40% y Envío Gratis',
};

const IM430F_HERO_LEAD = '';

const IM430F_HERO_DESCRIPTION = '';

function resolvePrinterSpeedTitle(specs: ProductSpecRow[]): string {
  const speed = specValue(specs, 'velocidad') || '40 ppm';
  return speed.replace(/^hasta\s+/i, '').trim();
}

function resolveAdfFeatureBarTile(
  product: Product,
  specs: ProductSpecRow[],
): { title: string; subtitle: string } {
  if (isImBnA4Sibling(product)) {
    return { title: 'SPDF', subtitle: 'Alimentador de originales doble scan' };
  }

  const adf = specValue(specs, 'adf') || findProductAttribute(product, 'alimentador', 'adf') || '';
  if (/doble\s*scan/i.test(adf)) {
    return { title: 'SPDF', subtitle: 'Alimentador de originales doble scan' };
  }
  if (/est[aá]ndar/i.test(adf)) {
    return { title: 'ADF', subtitle: 'Alimentador de documentos estándar' };
  }
  return { title: 'SPDF', subtitle: 'Alimentador de originales doble scan' };
}

function resolveFormatFeatureBarTile(
  product: Product,
  specs: ProductSpecRow[],
): { title: string; subtitle: string } {
  const format =
    specValue(specs, 'formato') || findProductAttribute(product, 'formato') || 'A4';
  if (format.toLowerCase().includes('a4')) {
    return { title: 'Papel A4', subtitle: 'Formato estándar oficina' };
  }
  return { title: format, subtitle: 'Formato de impresión' };
}

function formatConnectivityBullet(connectivity: string): string {
  const formatted = connectivity
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+y\s+/i, ', ')
    .replace(/Red/gi, 'LAN');
  return `Conectividad: ${formatted}`;
}

function resolveAdfBulletText(product: Product, specs: ProductSpecRow[]): string {
  if (isImBnA4Sibling(product)) {
    return 'SPDF — Alimentador de originales doble scan';
  }

  const adf = specValue(specs, 'adf') || findProductAttribute(product, 'alimentador', 'adf') || '';
  if (/doble\s*scan/i.test(adf)) {
    return 'SPDF — Alimentador de originales doble scan';
  }
  if (adf.trim()) return adf.trim();
  return 'SPDF — Alimentador de originales doble scan';
}

function resolveFormatBulletText(product: Product, specs: ProductSpecRow[]): string {
  const format =
    specValue(specs, 'formato') || findProductAttribute(product, 'formato') || '';
  if (!format || format.toLowerCase().includes('a4')) {
    return IM_BN_A4_FORMAT_BULLET.text ?? 'Formato A4, A5, A6 Bypass Formato A4-Carta';
  }
  return `Formato ${format}`;
}

function resolveMonthlyProductionBullet(
  product: Product,
  specs: ProductSpecRow[],
): ProductHeroSpecBullet | null {
  const volume = specValue(specs, 'volumen');
  if (volume) {
    const monthly = volume.replace(/^hasta\s+/i, '');
    return { icon: Gauge, text: `Producción mensual ${monthly}` };
  }

  if (/nuev/i.test(product.category ?? '')) {
    return IM_BN_A4_MONTHLY_PRODUCTION_BULLET;
  }

  return null;
}

function shouldShowGiftBullet(product: Product): boolean {
  return /nuev/i.test(product.category ?? '') || isImBnA4Sibling(product);
}

function buildPrinterFeatureBar(product: Product, specs: ProductSpecRow[]): ProductDescriptionHighlight[] {
  const screen = specValue(specs, 'pantalla');
  const connectivityRaw = specValue(specs, 'conectividad') || 'Wi-Fi / Red / USB';
  const formatTile = resolveFormatFeatureBarTile(product, specs);
  const adfTile = resolveAdfFeatureBarTile(product, specs);

  return [
    { icon: Printer, title: '4 en 1', subtitle: 'Imprime, copia, escanea y faxea' },
    {
      icon: Gauge,
      title: resolvePrinterSpeedTitle(specs),
      subtitle: 'Velocidad de impresión',
    },
    {
      icon: Smartphone,
      title: screen ? shortenScreenLabel(screen) : 'Pantalla táctil',
      subtitle: 'Panel de operación',
    },
    { icon: FileText, title: formatTile.title, subtitle: formatTile.subtitle },
    { icon: ScanLine, title: adfTile.title, subtitle: adfTile.subtitle },
    {
      icon: Cloud,
      title: 'Conectividad',
      subtitle: formatConnectivitySubtitle(connectivityRaw),
    },
  ];
}

function buildPrinterHeroSpecBullets(product: Product, specs: ProductSpecRow[]): ProductHeroSpecBullet[] {
  const bullets: ProductHeroSpecBullet[] = [];
  const functions = specValue(specs, 'funciones');
  const connectivity = specValue(specs, 'conectividad');

  bullets.push({ icon: Copy, text: 'Copiadora, Impresora, Escaner y fax' });
  bullets.push({ icon: Printer, text: `Imprime hasta ${resolvePrinterSpeedTitle(specs)}` });

  if (connectivity) {
    bullets.push({ icon: Wifi, text: formatConnectivityBullet(connectivity) });
  }

  bullets.push({ icon: ScanLine, text: resolveAdfBulletText(product, specs) });

  if (functions) {
    const normalized = functions.replace(/\s*\/\s*/g, ', ').toLowerCase();
    const firstBullet = bullets[0]?.text?.toLowerCase() ?? '';
    const isRedundant =
      /impresi|copia|escane|fax/.test(normalized) &&
      /copiadora|impresora|escaner|fax/.test(firstBullet);
    if (!isRedundant) {
      bullets.push({
        icon: ScanLine,
        text: functions.replace(/\s*\/\s*/g, ', '),
      });
    }
  }

  bullets.push({ icon: FileText, text: resolveFormatBulletText(product, specs) });

  const monthly = resolveMonthlyProductionBullet(product, specs);
  if (monthly) bullets.push(monthly);

  if (shouldShowGiftBullet(product)) {
    bullets.push(IM_BN_A4_GIFT_BULLET);
  }

  return bullets.slice(0, 10);
}

function buildPrinterDescriptionVisual(product: Product, specs: ProductSpecRow[]): ProductDescriptionVisual {
  const screen = specValue(specs, 'pantalla');
  const monthly = specValue(specs, 'volumen');
  const paper = specValue(specs, 'capacidad', 'papel');
  const adf = specValue(specs, 'adf') || findProductAttribute(product, 'alimentador', 'adf') || '';
  const adfIsDobleScan = /doble\s*scan/i.test(adf);
  const adfLines = adfIsDobleScan
    ? ['Alimentador de originales doble scan']
    : adf.trim()
      ? [adf.trim()]
      : ['Alimentador de originales doble scan'];

  return {
    functions: [
      { icon: Copy, label: 'Copiadora' },
      { icon: Printer, label: 'Impresora' },
      { icon: ScanLine, label: 'Escáner' },
    ],
    connectivity: [...PRINTER_CONNECTIVITY_VISUAL],
    specs: [
      { icon: Gauge, title: 'Velocidad', lines: [resolvePrinterSpeedTitle(specs)] },
      { icon: FileText, title: 'Papel A4', lines: ['Formato estándar oficina'] },
      ...(screen
        ? [{ icon: Smartphone, title: 'Pantalla', lines: [shortenScreenLabel(screen)] }]
        : [{ icon: Smartphone, title: 'Pantalla', lines: ['Pantalla táctil'] }]),
      {
        icon: ScanLine,
        title: adfIsDobleScan ? 'SPDF' : 'ADF',
        lines: adfLines,
      },
      ...(monthly
        ? [{ icon: Layers, title: 'Rendimiento Mensual', lines: [shortenMonthlyVolume(monthly)] }]
        : [{ icon: Layers, title: 'Rendimiento Mensual', lines: ['Alto volumen mensual'] }]),
      ...(paper
        ? [{ icon: Printer, title: 'Capacidad de papel', lines: [`Estándar: ${paper}`] }]
        : [{ icon: Printer, title: 'Capacidad de papel', lines: ['Bandeja estándar'] }]),
    ],
  };
}

function buildHeroSpecTitle(_product: Product, _isPrinter: boolean): string | null {
  return null;
}

function buildHeroSpecBullets(
  product: Product,
  specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductHeroSpecBullet[] {
  if (!isPrinter) return [];
  return buildPrinterHeroSpecBullets(product, specs);
}

function resolveHeroLead(product: Product, isPrinter: boolean, isSupply: boolean): string {
  if (isIm430f(product)) return IM430F_HERO_LEAD;
  if (isPrinter) {
    const description = product.description?.trim() ?? '';
    if (description.includes('\n')) return '';
    return description;
  }
  if (isSupply) return 'Consumible compatible de alta calidad para un rendimiento constante.';
  return product.category ?? 'Producto HaiStore';
}

function resolveHeroDescription(product: Product, isPrinter: boolean, isSupply: boolean): string {
  if (isIm430f(product)) return IM430F_HERO_DESCRIPTION;
  if (isPrinter) return '';
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

function formatConnectivitySubtitle(connectivityRaw: string): string {
  let connectivitySubtitle = connectivityRaw
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+y\s+/i, ', ')
    .replace(/Red/gi, 'Ethernet')
    .replace(/LAN/gi, 'Ethernet')
    .replace(/,?\s*Móvil/gi, '')
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*/, '')
    .trim();

  if (!connectivitySubtitle.toLowerCase().includes('usb')) {
    connectivitySubtitle = `${connectivitySubtitle}, USB`;
  }

  return connectivitySubtitle;
}

function buildHeroHighlights(
  _specs: ProductSpecRow[],
  isPrinter: boolean,
): ProductDescriptionHighlight[] {
  // Las impresoras usan `featureBar` (una sola fila bajo la galería).
  if (isPrinter) return [];
  return [];
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

function specValue(specs: ProductSpecRow[], ...labels: string[]): string {
  for (const label of labels) {
    const row = specs.find((entry) => entry.label.toLowerCase().includes(label.toLowerCase()));
    if (row?.value?.trim()) return row.value.trim();
  }
  return '';
}

function normalizeAttrKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findProductAttribute(product: Product, ...needles: string[]): string | null {
  const attributes = normalizeAttributes(product.attributes);
  for (const attr of attributes) {
    const key = normalizeAttrKey(attr.name);
    if (!key) continue;
    if (needles.some((needle) => key.includes(normalizeAttrKey(needle)))) {
      const value = attr.value?.trim();
      if (value) return value;
    }
  }
  return null;
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
  return buildPrinterFeatureBar(product, specs);
}

function buildDescriptionVisual(
  product: Product,
  specs: ProductSpecRow[],
  isPrinter: boolean,
  heroSpecBullets: ProductHeroSpecBullet[],
): ProductDescriptionVisual | null {
  if (!isPrinter) return null;

  const storedBullets = normalizeStorefrontHeroBullets(product.storefront_hero_bullets);
  if (storedBullets.length > 0) {
    return {
      functions: [],
      specs: heroSpecBullets
        .filter((bullet) => bullet.text?.trim())
        .map((bullet) => ({
          icon: resolveHeroBulletIcon(bullet),
          title: '',
          lines: [bullet.text!.trim()],
        })),
    };
  }

  return buildPrinterDescriptionVisual(product, specs);
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

export function isColorPrinterEquipment(product: Product): boolean {
  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();
  const haystack = `${name} ${cat}`;

  if (/\bb\/n\b|\bmonocrom/i.test(haystack)) return false;

  const colorAttr = product.attributes?.find((attribute) =>
    attribute.name.toLowerCase().includes('color'),
  )?.value;
  if (colorAttr?.toLowerCase().includes('color')) return true;

  return (
    haystack.includes('color') ||
    haystack.includes('a color') ||
    /\b(mp\s+)?c\d{3,4}\b/i.test(product.name) ||
    /\bim\s+c\d{3,4}/i.test(product.name) ||
    /\bbizhub\s+c/i.test(product.name)
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

function isIm550f(product: Product): boolean {
  if (product.id === '328f41ef-d935-4807-85d0-e1db5bdf73fb') return true;
  return /\bim\s*550\s*f\b/i.test(product.name);
}

function isIm600f(product: Product): boolean {
  if (product.id === 'b32a43a1-09e4-49f6-8950-3639c9534700') return true;
  return /\bim\s*600\s*f\b/i.test(product.name);
}

function isImBnA4Sibling(product: Product): boolean {
  return isIm550f(product) || isIm600f(product);
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

function resolveDetailDisplayTitle(product: Product): string {
  // En storefront, el título debe respetar exactamente el nombre editado en inventario.
  // (Evita forzar minúsculas / title-case / stripping agresivo que rompe copy de admin.)
  const name = product.name?.trim();
  return name || product.name;
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

const IM430F_GALLERY_URLS = [
  '/products/ricoh-im-430f.webp',
  '/products/ricoh-im-430f-2.webp',
  '/products/ricoh-im-430f-3.webp',
] as const;

function buildGallery(product: Product): ProductGalleryItem[] {
  if (isIm430f(product)) {
    return IM430F_GALLERY_URLS.map((src) => ({
      type: 'image' as const,
      src,
      alt: product.name,
    }));
  }

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
    { label: 'Código', value: sku },
    { label: 'Categoría', value: product.category ?? 'General' },
    { label: 'Disponibilidad', value: product.stock > 0 ? `${product.stock} unidades` : 'Agotado' },
    { label: 'Moneda', value: product.currency },
    { label: 'Garantía', value: '12 meses' },
  ];
}

function buildPrinterSpecs(product: Product, brandLabel: string, sku: string): ProductSpecRow[] {
  const isBnA4 = isImBnA4Sibling(product);
  const speedAttr = findProductAttribute(product, 'velocidad');
  const adfAttr = findProductAttribute(product, 'alimentador', 'adf');
  const formatAttr = findProductAttribute(product, 'formato');
  const colorAttr = findProductAttribute(product, 'color');
  const connectivityAttr = findProductAttribute(product, 'conectividad');
  const isColor = colorAttr?.toLowerCase().includes('color') ?? false;

  return [
    {
      label: 'Velocidad',
      value: speedAttr ?? (isBnA4 ? '30 ppm' : '40 ppm'),
    },
    { label: 'Marca', value: brandLabel },
    { label: 'Modelo', value: product.name },
    { label: 'Código', value: sku },
    { label: 'Categoría', value: product.category ?? 'Multifuncionales' },
    { label: 'Tipo', value: isColor ? 'Color' : 'Monocromática' },
    {
      label: 'Formatos',
      value: formatAttr ?? (isBnA4 ? 'A4' : 'A4, oficio, sobres'),
    },
    {
      label: 'Conectividad',
      value: connectivityAttr ?? 'Wi-Fi, Ethernet, USB',
    },
    ...(isBnA4
      ? []
      : [{ label: 'Funciones', value: 'Impresión, copia, escaneo, fax' }]),
    ...(isBnA4
      ? [{ label: 'ADF', value: 'SPDF — Alimentador de originales doble scan' }]
      : adfAttr
        ? [{ label: 'ADF', value: adfAttr }]
        : []),
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

function buildAccessoryConfigOptions(product: Product): EquipmentConfigStep['options'] {
  const options: EquipmentConfigStep['options'] = [];

  if (!isImBnA4Sibling(product)) {
    options.push({
      id: 'casetera-250',
      productId: CASETERA_250_PB1110_PRODUCT_ID,
      name: 'Casetera 250 Hojas',
      pricePen: 0,
    });
  }

  const gabineteProductId = isImBnA4Sibling(product)
    ? TALL_CABINET_IM550_PRODUCT_ID
    : isIm430f(product)
      ? TALL_CABINET_IM430_PRODUCT_ID
      : GABINETE_ALTO_TIPO_I_PRODUCT_ID;

  options.push(
    {
      id: 'casetera-500',
      productId: isImBnA4Sibling(product)
        ? CASETERA_500_PB1160_PRODUCT_ID
        : CASETERA_500_PB1120_PRODUCT_ID,
      name: 'Casetera 500 hojas',
      pricePen: 0,
    },
    {
      id: 'gabinete',
      productId: gabineteProductId,
      name: 'Gabinete',
      pricePen: 0,
    },
    {
      id: 'router-wifi',
      productId: ROUTER_WIFI_PRODUCT_ID,
      name: 'Router Wifi',
      pricePen: 0,
    },
    {
      id: 'tall-cabinet-u',
      productId: gabineteProductId,
      name: 'Tall Cabinet Type U',
      description: 'Pedestal de piso',
      pricePen: 0,
    },
    {
      id: 'ocr-m13',
      name: 'OCR Unit Type M13',
      description: 'Reconocimiento PDF',
      pricePen: 0,
    },
  );

  return options;
}

function buildStarterTonerLabel(product: Product): string {
  const name = product.name;
  if (/IM\s*550F/i.test(name) || /IM\s*600F/i.test(name)) {
    return 'Tóner RICOH IM 550F, IM 600F';
  }

  const modelMatch = name.match(/\b(IM\s*\d+\s*[A-Z]?\w*)\b/i) ?? name.match(/\b(MP\s*[\w]+)\b/i);
  if (modelMatch?.[1]) {
    return `Tóner RICOH ${modelMatch[1].replace(/\s+/g, ' ').trim()}`;
  }

  const brand = product.brand?.trim() || 'RICOH';
  return `Tóner de inicio ${brand}`;
}

function buildEquipmentConfigSteps(product: Product, isPrinter: boolean, isSupply: boolean): EquipmentConfigStep[] {
  if (isSupply || !isPrinter) return [];

  const starterToner = buildStarterTonerLabel(product);
  const tonerOptions = isIm430f(product)
    ? [
        {
          id: 'toner-inicio',
          name: `Tóner de inicio (${starterToner})`,
          description: '8,000 páginas — incluido con el equipo',
          pricePen: 0,
          included: true,
        },
        {
          id: 'toner-ricoh-im-430f',
          productId: IM430F_ORIGINAL_TONER_PRODUCT_ID,
          name: 'Toner RICOH IM 430F',
          description: 'Cartucho original — Rend 14,500',
          pricePen: 0,
        },
      ]
    : isImBnA4Sibling(product)
      ? [
          {
            id: 'toner-ricoh-im-550f',
            productId: IM550F_ORIGINAL_TONER_PRODUCT_ID,
            name: 'Toner Original RICOH IM 550F',
            description: '04 tóner de inicio (mín. 40%) — incluido con el equipo',
            pricePen: 0,
            included: true,
          },
          {
            id: 'toner-compatible',
            productId: IM550F_COMPATIBLE_TONER_PRODUCT_ID,
            name: 'Tóner compatible',
            description: 'Rendimiento según modelo',
            pricePen: 0,
          },
        ]
      : [
          {
            id: 'toner-inicio',
            name: `Tóner de inicio (${starterToner})`,
            description: '8,000 páginas — incluido con el equipo',
            pricePen: 0,
            included: true,
          },
          {
            id: 'toner-compatible',
            name: 'Tóner compatible',
            description: 'Rendimiento según modelo',
            pricePen: 0,
          },
        ];

  const tonerSubtitle = isImBnA4Sibling(product)
    ? 'Tóner original RICOH y compatibles'
    : 'Tóner de inicio y compatibles';

  return [
    {
      id: 'toner',
      stepNumber: 1,
      title: 'Tóner',
      subtitle: tonerSubtitle,
      pricePen: 0,
      icon: Printer,
      defaultSelected: true,
      selectionMode: 'multiple',
      options: tonerOptions,
    },
    {
      id: 'accesorios',
      stepNumber: 2,
      title: 'Accesorios',
      subtitle: 'Bandejas, pedestal y OCR',
      pricePen: 0,
      icon: Inbox,
      defaultSelected: true,
      selectionMode: 'multiple',
      options: buildAccessoryConfigOptions(product),
    },
    {
      id: 'estabilizador',
      stepNumber: 3,
      title: 'Protección eléctrica',
      subtitle: 'Estabilizador de voltaje',
      pricePen: 0,
      icon: Shield,
      defaultSelected: true,
      selectionMode: 'multiple',
      options: [
        {
          id: 'estabilizador-2000w',
          productId: ESTABILIZADOR_2KVA_PRODUCT_ID,
          name: 'Estabilizador 2000 watts 220v',
          pricePen: 0,
        },
      ],
    },
    {
      id: 'garantia',
      stepNumber: 4,
      title: 'Garantía',
      subtitle: 'Cobertura estándar y extensiones',
      pricePen: 0,
      icon: Shield,
      defaultSelected: true,
      selectionMode: 'single',
      options: [
        {
          id: 'garantia-base',
          name: 'Garantía 1 año y/o 20,000 páginas',
          description: 'Incluido',
          pricePen: 0,
          included: true,
        },
        {
          id: 'garantia-2y',
          name: 'Garantía extendida 2 años y/o 100,000 páginas',
          description: '$200 o S/ 600 adicional',
          priceUsd: 200,
          pricePen: 600,
        },
        {
          id: 'garantia-3y',
          name: 'Garantía extendida 3 años y/o 100,000 páginas',
          description: '$350 adicional',
          priceUsd: 350,
          pricePen: usdToPen(350),
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
  const sku =
    formatProductDisplayCode(product.code, {
      brand: product.brand,
      category: product.category,
      name: product.name,
    }) || skuFromId(product.id);
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

  const displayTitle = resolveDetailDisplayTitle(product);

  const specs = isIm430f(product)
    ? IM430F_SPECS
    : isSupply
      ? buildSupplySpecs(product)
      : isPrinter
        ? buildPrinterSpecs(product, brandLabel, sku)
        : buildGenericSpecs(product, brandLabel, sku);

  const heroSpecBullets = resolveStoredHeroBullets(
    product,
    buildHeroSpecBullets(product, specs, isPrinter),
  ).map((bullet) => ({
    ...bullet,
    icon: resolveHeroBulletIcon(bullet),
  }));
  const heroSpecTitle = buildHeroSpecTitle(product, isPrinter);

  const descriptionVisual = buildDescriptionVisual(product, specs, isPrinter, heroSpecBullets);
  const featureBar = resolveStoredFeatureBar(product, buildFeatureBar(product, specs, isPrinter));

  const showNuevo = productHasNuevoCornerBadge(product);

  // Igual que displayTitle: mantener el formato editado en inventario.
  const heroTitle = product.name?.trim() || product.name;
  const tagPills = buildTagPills(specs, isPrinter, showNuevo);
  const heroHighlights = buildHeroHighlights(specs, isPrinter);

  const breadcrumbs = buildProductBreadcrumbs(product, displayTitle, []);

  const fullPrices = ensureFullPrices(product.prices ?? { public: product.price });
  const technicalSheet = findTechnicalSheetAttachment(product);
  const technicalSheetUrl = technicalSheet?.url ?? null;
  const manualAttachment = findAttachmentByKind(product, 'manual');
  const driverAttachment = findAttachmentByKind(product, 'printer_driver');
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
      ...(technicalSheetUrl
        ? [
            {
              label: 'Ficha Técnica',
              subtitle: 'PDF',
              icon: FileText,
              href: technicalSheetUrl,
              action: 'technical_sheet' as const,
              fileName: technicalSheet?.file_name ?? 'ficha-tecnica.pdf',
              ...(technicalSheet?.mime_type ? { mimeType: technicalSheet.mime_type } : {}),
            },
          ]
        : []),
      { label: 'Solicitar cotización', subtitle: 'PDF', icon: FileText, action: 'quote' as const },
      ...(manualAttachment?.url
        ? [
            {
              label: 'Manual de Usuario',
              subtitle: 'PDF',
              icon: BookOpen,
              href: manualAttachment.url,
            },
          ]
        : []),
      ...(driverAttachment?.url
        ? [
            {
              label: 'Driver',
              subtitle: 'Descarga',
              icon: FileText,
              href: driverAttachment.url,
            },
          ]
        : []),
    ],
    warrantyOptions: [
      { id: 'none', label: 'No incluir' },
      { id: '1y', label: '1 año adicional', priceUsd: 89 },
      { id: '2y', label: '2 años adicionales', priceUsd: 149 },
      { id: '3y', label: '3 años adicionales', priceUsd: 199 },
    ],
    comboItems: buildComboItems(product, isPrinter, isSupply),
    equipmentConfigSteps: buildEquipmentConfigSteps(product, isPrinter, isSupply),
    bulkDiscountTiers,
    rentalPlans: isPrinter ? rentalPlansFromApi : [],
    isPrinterEquipment: isPrinter,
    isSupplyProduct: isSupply,
    isOnOffer: pricing.isOnOffer,
    oldPricePen: pricing.oldPricePen,
    discountPercent: pricing.discountPercent,
    technicalSheetUrl,
    technicalSheetFileName: technicalSheet?.file_name ?? null,
    technicalSheetMimeType: technicalSheet?.mime_type ?? null,
    wholesalePriceUsd,
  };
}

/** Valores por defecto de ficha tienda (barra + bullets) a partir de atributos. */
export function generateDefaultStorefrontDetail(product: Product) {
  const isPrinter = isPrinterEquipment(product);
  if (!isPrinter) {
    return { featureBar: [], heroBullets: [] };
  }

  const brandLabel = product.brand ?? 'Haitech';
  const sku =
    formatProductDisplayCode(product.code, {
      brand: product.brand,
      category: product.category,
      name: product.name,
    }) || skuFromId(product.id);
  const specs = buildPrinterSpecs(product, brandLabel, sku);

  return {
    featureBar: highlightsToStoredFeatureBar(buildPrinterFeatureBar(product, specs)),
    heroBullets: heroBulletsToStored(buildPrinterHeroSpecBullets(product, specs)),
  };
}
