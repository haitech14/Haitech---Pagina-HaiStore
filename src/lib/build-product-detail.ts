import {
  Award,
  BookOpen,
  Cloud,
  FileText,
  Gauge,
  Inbox,
  Layers,
  Lock,
  Printer,
  ScanLine,
  Settings,
  Shield,
  Smartphone,
  Wifi,
} from 'lucide-react';

import type { FeaturedProduct } from '@/data/featured-products';
import type {
  EquipmentConfigStep,
  ProductComboItem,
  ProductDescriptionContent,
  ProductDetailViewModel,
  ProductFeatureIcon,
  ProductGalleryItem,
  ProductSpecRow,
} from '@/types/product-detail';
import type { Product } from '@/types/product';
import { collectProductImageUrls } from '@/lib/product-media';
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

const WARRANTY_BULLETS = [
  'Garantía oficial de 12 meses por defecto de fábrica.',
  'Cobertura en piezas, mano de obra y desplazamiento en Lima Metropolitana.',
  'Extensiones de garantía disponibles hasta 36 meses adicionales.',
  'Soporte técnico certificado Haitech durante todo el periodo de garantía.',
];

const DEFAULT_BULK_TIERS = [
  { range: '2-4 unidades', discount: '5% dscto.', discountPercent: 5 },
  { range: '5-9 unidades', discount: '10% dscto.', discountPercent: 10 },
  { range: '10+ unidades', discount: '15% dscto.', discountPercent: 15 },
];

const DEFAULT_RENTAL_PLANS = [
  { pagesPerMonth: 3000, monthlyPricePen: 349 },
  { pagesPerMonth: 5000, monthlyPricePen: 399 },
  { pagesPerMonth: 8000, monthlyPricePen: 449 },
  { pagesPerMonth: 10000, monthlyPricePen: 499 },
];

const IM430F_DESCRIPTION: ProductDescriptionContent = {
  paragraphs: [
    'La Impresora Multifuncional Nueva RICOH IM 430F (SPDF) es una multifuncional profesional pensada para oficinas y equipos de trabajo que requieren rendimiento constante. Ofrece hasta 40 ppm y un panel táctil de 10.1" para agilizar flujos de impresión, copiado y escaneo.',
    'Ideal para integrar impresión móvil, escaneo a carpetas y servicios en la nube, con calidad homogénea y control de costos operativos.',
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
    return {
      paragraphs: [
        product.description ??
          'Equipo multifuncional profesional diseñado para oficinas que buscan productividad, conectividad y control de costos operativos.',
        'Compatible con impresión móvil, escaneo a carpetas y servicios en la nube para equipos de trabajo híbridos.',
      ],
      highlights: [
        { icon: Gauge, title: 'Alta velocidad', subtitle: 'Rendimiento constante en impresión y copiado' },
        { icon: Inbox, title: 'Gran capacidad', subtitle: 'Bandejas ampliadas para alto volumen' },
        { icon: Settings, title: 'Panel inteligente', subtitle: 'Operación intuitiva con pantalla táctil' },
        { icon: Cloud, title: 'Conectividad', subtitle: 'Impresión móvil y en la nube' },
        { icon: Lock, title: 'Seguridad', subtitle: 'Protección de documentos y accesos' },
      ],
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

function isPrinterEquipment(product: Product): boolean {
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
  return product.id === 'ricoh-im-430f' || product.name.toLowerCase().includes('im 430f');
}

function buildGallery(product: Product): ProductGalleryItem[] {
  const isPrinter = isPrinterEquipment(product);
  const isSupply = isSupplyProduct(product);
  const description = buildDescriptionContent(product, isPrinter, isSupply);

  const inventoryUrls = collectProductImageUrls(product);
  const items: ProductGalleryItem[] = inventoryUrls.map((src, index) => ({
    type: 'image' as const,
    src,
    alt: index === 0 ? product.name : `${product.name} — imagen ${index + 1}`,
  }));

  if (items.length === 0) {
    items.push({
      type: 'image',
      src: isSupply ? '/categories/toner-suministros.png' : '/categories/multifuncionales.png',
      alt: product.name,
    });
  }

  const youtubeId =
    description?.youtubeVideoId ??
    (isIm430f(product) ? IM430F_DESCRIPTION.youtubeVideoId : undefined);

  if (youtubeId) {
    const alreadyHasVideo = items.some(
      (item) => item.type === 'video' && item.youtubeId === youtubeId,
    );
    if (!alreadyHasVideo) {
      items.push({
        type: 'video',
        youtubeId,
        ...(description?.youtubeTitle || IM430F_DESCRIPTION.youtubeTitle
          ? {
              title: description?.youtubeTitle ?? IM430F_DESCRIPTION.youtubeTitle,
            }
          : {}),
        poster: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      });
    }
  }

  return items;
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
    { label: 'Marca', value: brandLabel },
    { label: 'Modelo', value: product.name },
    { label: 'SKU', value: sku },
    { label: 'Categoría', value: product.category ?? 'Multifuncionales' },
    { label: 'Conectividad', value: 'Wi-Fi, Ethernet, USB' },
    { label: 'Funciones', value: 'Impresión, copia, escaneo, fax' },
    { label: 'Formatos', value: 'A4, oficio, sobres' },
    { label: 'Garantía', value: '12 meses' },
  ];
}

function buildComboItems(product: Product, isPrinter: boolean, isSupply: boolean): ProductComboItem[] {
  const image = product.image_url ?? '/categories/toner-suministros.png';

  if (isSupply) {
    return [
      {
        id: 'combo-toner-original',
        name: 'Toner Original RICOH IM 430F (15,500 páginas)',
        image,
        pricePen: 257,
        defaultSelected: true,
      },
      {
        id: 'combo-toner-magenta',
        name: 'Toner Compatible Magenta MP C6003',
        image,
        pricePen: 149,
        defaultSelected: false,
      },
      {
        id: 'combo-unidad-imagen',
        name: 'Unidad de imagen DR IM 430F',
        image,
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
      id: 'equipo-base',
      stepNumber: 1,
      title: 'Equipo base',
      subtitle: 'Configuración estándar',
      pricePen: 0,
      icon: Layers,
      defaultSelected: true,
    },
    {
      id: 'casetera',
      stepNumber: 2,
      title: 'Casetera',
      subtitle: 'Bandejas adicionales',
      pricePen: 0,
      icon: Inbox,
      defaultSelected: true,
    },
    {
      id: 'acabado',
      stepNumber: 3,
      title: 'Acabado',
      subtitle: 'Grapado y perforado',
      pricePen: 0,
      icon: Settings,
      defaultSelected: true,
    },
    {
      id: 'imp-esc',
      stepNumber: 4,
      title: 'Imp./Esc.',
      subtitle: 'Impresión y escaneo',
      pricePen: 0,
      icon: ScanLine,
      defaultSelected: true,
    },
    {
      id: 'seguridad',
      stepNumber: 5,
      title: 'Seguridad',
      subtitle: 'Control de acceso',
      pricePen: 0,
      icon: Lock,
      defaultSelected: true,
    },
    {
      id: 'toner',
      stepNumber: 6,
      title: 'Toner',
      subtitle: 'Consumibles recomendados',
      pricePen: 0,
      icon: Printer,
      defaultSelected: true,
    },
    {
      id: 'garantia-extendida',
      stepNumber: 7,
      title: 'Garantía extendida',
      subtitle: 'Cobertura adicional',
      pricePen: 0,
      icon: Shield,
      defaultSelected: true,
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
    return {
      oldPricePen: 3299,
      discountPercent: 21,
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
): ProductDetailViewModel {
  const isPrinter = isPrinterEquipment(product);
  const isSupply = isSupplyProduct(product);
  const brandLabel = product.brand ?? (isSupply ? 'Compatible' : 'Haitech');
  const categoryLabel = isPrinter
    ? `Equipo ${product.category ?? 'Multifuncionales Remanufacturadas'}`
    : (product.category ?? 'Productos');

  const pricing = resolvePricing(product, featuredMeta);
  const breadcrumbMiddle = isSupply || featuredMeta || pricing.isOnOffer ? 'Ofertas' : (product.category ?? 'Tienda');
  const sku = isIm430f(product) ? '9900129' : skuFromId(product.id);
  const colorLabel = isIm430f(product)
    ? 'Blanco/Negro'
    : isSupply
      ? 'Varios'
      : 'Estándar';
  const specs = isSupply
    ? buildSupplySpecs(product)
    : isPrinter
      ? buildPrinterSpecs(product, brandLabel, sku)
      : buildGenericSpecs(product, brandLabel, sku);

  const bullets = isSupply
    ? buildSupplyBullets()
    : product.description && !isPrinter
      ? [product.description, ...CONSUMER_BULLETS.slice(0, 3)]
      : isPrinter
        ? PRINTER_BULLETS
        : CONSUMER_BULLETS;

  const displayTitle = isIm430f(product)
    ? 'Impresora Multifuncional RICOH IM 430F'
    : product.name;

  return {
    product,
    sku,
    brandLabel,
    colorLabel,
    breadcrumbs: [
      { label: 'Inicio', href: '/' },
      { label: breadcrumbMiddle, href: '/tienda' },
      { label: displayTitle },
    ],
    displayTitle,
    categoryLabel,
    rating: featuredMeta?.rating ?? 4,
    reviews: featuredMeta?.reviews ?? soldCountFromId(product.id) + 2,
    soldCount: soldCountFromId(product.id),
    bullets,
    descriptionContent: buildDescriptionContent(product, isPrinter, isSupply),
    specs,
    warrantyBullets: WARRANTY_BULLETS,
    gallery: buildGallery(product),
    features: isSupply ? SUPPLY_FEATURES : isPrinter ? PRINTER_FEATURES : SUPPLY_FEATURES,
    resourceLinks: [
      { label: 'Ficha Técnica', subtitle: 'PDF', icon: FileText, href: '#' },
      { label: 'Descargar Cotización', subtitle: 'PDF', icon: FileText, action: 'quote' },
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
    bulkDiscountTiers: DEFAULT_BULK_TIERS,
    rentalPlans: isPrinter ? DEFAULT_RENTAL_PLANS : [],
    isPrinterEquipment: isPrinter,
    isSupplyProduct: isSupply,
    isOnOffer: pricing.isOnOffer,
    oldPricePen: pricing.oldPricePen,
    discountPercent: pricing.discountPercent,
  };
}
